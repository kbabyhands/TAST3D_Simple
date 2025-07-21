import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Plus, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { Restaurant } from '@/types/restaurant';
import { DatabaseMenuItem } from '@/types/menu';
import { RestaurantForm } from '@/components/admin/RestaurantForm';
import { RestaurantsList } from '@/components/admin/RestaurantsList';
import { MenuItemForm } from '@/components/admin/MenuItemForm';
import { MenuItemsList } from '@/components/admin/MenuItemsList';

type View = 'restaurants' | 'restaurant-form' | 'menu-management';

export default function AdminRestaurants() {
  const { user, signOut, isAdmin, loading } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<DatabaseMenuItem[]>([]);
  const [currentView, setCurrentView] = useState<View>('restaurants');
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [editingMenuItem, setEditingMenuItem] = useState<DatabaseMenuItem | null>(null);
  const [showMenuItemForm, setShowMenuItemForm] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/auth';
      return;
    }

    if (!loading && user && !isAdmin) {
      toast.error('Access denied. Admin privileges required.');
      signOut();
      return;
    }

    if (user && isAdmin) {
      fetchRestaurants();
    }
  }, [user, isAdmin, loading]);

  const fetchRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRestaurants(data || []);
    } catch (error: any) {
      toast.error('Failed to load restaurants');
    } finally {
      setLoadingData(false);
    }
  };

  const fetchMenuItems = async (restaurantId: string) => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('category', { ascending: true });

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error: any) {
      toast.error('Failed to load menu items');
    }
  };

  const handleRestaurantSaved = () => {
    fetchRestaurants();
    setCurrentView('restaurants');
    setEditingRestaurant(null);
  };

  const handleEditRestaurant = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
    setCurrentView('restaurant-form');
  };

  const handleManageMenu = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setCurrentView('menu-management');
    fetchMenuItems(restaurant.id);
  };

  const handleMenuItemSaved = () => {
    if (selectedRestaurant) {
      fetchMenuItems(selectedRestaurant.id);
    }
    setShowMenuItemForm(false);
    setEditingMenuItem(null);
  };

  const handleEditMenuItem = (item: DatabaseMenuItem) => {
    setEditingMenuItem(item);
    setShowMenuItemForm(true);
  };

  const handleDeleteMenuItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Menu item deleted');
      if (selectedRestaurant) {
        fetchMenuItems(selectedRestaurant.id);
      }
    } catch (error: any) {
      toast.error('Failed to delete menu item');
    }
  };

  const goBack = () => {
    if (currentView === 'menu-management') {
      setCurrentView('restaurants');
      setSelectedRestaurant(null);
      setShowMenuItemForm(false);
      setEditingMenuItem(null);
    } else {
      setCurrentView('restaurants');
      setEditingRestaurant(null);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            {currentView === 'restaurants' ? (
              <Button variant="outline" asChild>
                <Link to="/admin">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Admin
                </Link>
              </Button>
            ) : (
              <Button variant="outline" onClick={goBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            <div>
              <h1 className="text-3xl font-bold">
                {currentView === 'restaurants' && 'Restaurant Management'}
                {currentView === 'restaurant-form' && (editingRestaurant ? 'Edit Restaurant' : 'Add New Restaurant')}
                {currentView === 'menu-management' && `Menu Management - ${selectedRestaurant?.name}`}
              </h1>
              <p className="text-muted-foreground">
                {currentView === 'restaurants' && 'Manage your restaurants and their menus'}
                {currentView === 'restaurant-form' && 'Configure restaurant details'}
                {currentView === 'menu-management' && 'Manage menu items for this restaurant'}
              </p>
            </div>
          </div>
          <Button onClick={signOut} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Content */}
        {currentView === 'restaurants' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Restaurants</h2>
              <Button onClick={() => setCurrentView('restaurant-form')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Restaurant
              </Button>
            </div>
            
            <RestaurantsList 
              restaurants={restaurants}
              onManageMenu={handleManageMenu}
              onEdit={handleEditRestaurant}
            />
          </div>
        )}

        {currentView === 'restaurant-form' && (
          <RestaurantForm 
            restaurant={editingRestaurant}
            onSaved={handleRestaurantSaved}
            onCancel={goBack}
          />
        )}

        {currentView === 'menu-management' && selectedRestaurant && (
          <div className="space-y-6">
            {showMenuItemForm ? (
              <MenuItemForm 
                item={editingMenuItem}
                restaurantId={selectedRestaurant.id}
                onSave={handleMenuItemSaved}
                onCancel={() => {
                  setShowMenuItemForm(false);
                  setEditingMenuItem(null);
                }}
              />
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold">Menu Items</h2>
                  <Button onClick={() => setShowMenuItemForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Menu Item
                  </Button>
                </div>
                
                <MenuItemsList 
                  items={menuItems}
                  onEdit={handleEditMenuItem}
                  onDelete={handleDeleteMenuItem}
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}