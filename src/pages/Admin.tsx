import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Plus, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { MenuItemForm } from '@/components/admin/MenuItemForm';
import { MenuItemsList } from '@/components/admin/MenuItemsList';
import { RestaurantsList } from '@/components/admin/RestaurantsList';
import { RestaurantForm } from '@/components/admin/RestaurantForm';
import { DatabaseMenuItem } from '@/types/menu';
import { Restaurant } from '@/types/restaurant';

type RestaurantView = 'list' | 'form' | 'menu-management';

export default function Admin() {
  const { user, signOut, isAdmin, loading } = useAuth();
  const [menuItems, setMenuItems] = useState<DatabaseMenuItem[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [restaurantView, setRestaurantView] = useState<RestaurantView>('list');
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<DatabaseMenuItem | null>(null);
  const [showMenuItemForm, setShowMenuItemForm] = useState(false);
  const [loadingItems, setLoadingItems] = useState(true);

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
      fetchCurrentRestaurant();
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
    }
  };

  const fetchCurrentRestaurant = async () => {
    try {
      // Get the first restaurant for backward compatibility
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .limit(1)
        .single();

      if (restaurantError) throw restaurantError;
      setCurrentRestaurant(restaurantData);

      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurantData.id)
        .order('category', { ascending: true });

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error: any) {
      toast.error('Failed to load menu items');
    } finally {
      setLoadingItems(false);
    }
  };

  const fetchMenuItems = async () => {
    if (!currentRestaurant) return;
    
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .order('category', { ascending: true });

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error: any) {
      toast.error('Failed to load menu items');
    }
  };

  const handleItemSaved = () => {
    if (selectedRestaurant) {
      fetchMenuItemsForRestaurant(selectedRestaurant.id);
    } else {
      fetchMenuItems();
    }
    setShowForm(false);
    setShowMenuItemForm(false);
    setEditingItem(null);
  };

  const handleEdit = (item: DatabaseMenuItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Menu item deleted');
      
      if (selectedRestaurant) {
        fetchMenuItemsForRestaurant(selectedRestaurant.id);
      } else {
        fetchMenuItems();
      }
    } catch (error: any) {
      toast.error('Failed to delete menu item');
    }
  };

  // Restaurant management functions
  const fetchMenuItemsForRestaurant = async (restaurantId: string) => {
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
    setRestaurantView('list');
    setEditingRestaurant(null);
  };

  const handleEditRestaurant = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
    setRestaurantView('form');
  };

  const handleManageMenu = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setRestaurantView('menu-management');
    fetchMenuItemsForRestaurant(restaurant.id);
  };

  const handleMenuItemEdit = (item: DatabaseMenuItem) => {
    setEditingItem(item);
    setShowMenuItemForm(true);
  };

  const handleMenuItemDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Menu item deleted');
      if (selectedRestaurant) {
        fetchMenuItemsForRestaurant(selectedRestaurant.id);
      }
    } catch (error: any) {
      toast.error('Failed to delete menu item');
    }
  };

  const handleDeleteRestaurant = async (restaurant: Restaurant) => {
    try {
      const { error } = await supabase
        .from('restaurants')
        .delete()
        .eq('id', restaurant.id);

      if (error) throw error;
      
      toast.success('Restaurant deleted');
      fetchRestaurants();
    } catch (error: any) {
      toast.error('Failed to delete restaurant');
    }
  };

  const goBackToRestaurants = () => {
    setRestaurantView('list');
    setSelectedRestaurant(null);
    setShowMenuItemForm(false);
    setEditingItem(null);
    setEditingRestaurant(null);
  };

  if (loading || loadingItems) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading admin portal...</p>
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
          <div>
            <h1 className="text-3xl font-bold">Admin Portal</h1>
            <p className="text-muted-foreground">Manage your restaurant menu</p>
          </div>
          <Button onClick={signOut} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Content */}
        <Tabs defaultValue="restaurants" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
            <TabsTrigger value="menu">Menu Management</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="restaurants" className="space-y-6">
            {restaurantView === 'list' && (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold">Restaurants</h2>
                  <Button onClick={() => setRestaurantView('form')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Restaurant
                  </Button>
                </div>
                
                <RestaurantsList 
                  restaurants={restaurants}
                  onManageMenu={handleManageMenu}
                  onEdit={handleEditRestaurant}
                  onDelete={handleDeleteRestaurant}
                />
              </>
            )}

            {restaurantView === 'form' && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Button variant="outline" onClick={goBackToRestaurants}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Restaurants
                  </Button>
                  <h2 className="text-2xl font-semibold">
                    {editingRestaurant ? 'Edit Restaurant' : 'Add New Restaurant'}
                  </h2>
                </div>
                
                <RestaurantForm 
                  restaurant={editingRestaurant}
                  onSaved={handleRestaurantSaved}
                  onCancel={goBackToRestaurants}
                />
              </div>
            )}

            {restaurantView === 'menu-management' && selectedRestaurant && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Button variant="outline" onClick={goBackToRestaurants}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Restaurants
                  </Button>
                  <div>
                    <h2 className="text-2xl font-semibold">Menu Management - {selectedRestaurant.name}</h2>
                    <p className="text-muted-foreground">Manage menu items for this restaurant</p>
                  </div>
                </div>

                {showMenuItemForm ? (
                  <MenuItemForm 
                    item={editingItem}
                    restaurantId={selectedRestaurant.id}
                    onSave={handleItemSaved}
                    onCancel={() => {
                      setShowMenuItemForm(false);
                      setEditingItem(null);
                    }}
                  />
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold">Menu Items</h3>
                      <Button onClick={() => setShowMenuItemForm(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Menu Item
                      </Button>
                    </div>
                    
                    <MenuItemsList 
                      items={menuItems}
                      onEdit={handleMenuItemEdit}
                      onDelete={handleMenuItemDelete}
                    />
                  </>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="menu" className="space-y-6">
            {showForm ? (
              <MenuItemForm 
                item={editingItem}
                restaurantId={currentRestaurant?.id || ''}
                onSave={handleItemSaved}
                onCancel={() => {
                  setShowForm(false);
                  setEditingItem(null);
                }}
              />
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold">Menu Items</h2>
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Menu Item
                  </Button>
                </div>
                
                <MenuItemsList 
                  items={menuItems}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </>
            )}
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>
                  Manage your account and application settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Account Information</h3>
                    <p className="text-sm text-muted-foreground">
                      Email: {user.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Role: Administrator
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}