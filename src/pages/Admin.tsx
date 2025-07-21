import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { MenuItemForm } from '@/components/admin/MenuItemForm';
import { MenuItemsList } from '@/components/admin/MenuItemsList';
import { DatabaseMenuItem } from '@/types/menu';
import { Restaurant } from '@/types/restaurant';

export default function Admin() {
  const { user, signOut, isAdmin, loading } = useAuth();
  const [menuItems, setMenuItems] = useState<DatabaseMenuItem[]>([]);
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<DatabaseMenuItem | null>(null);
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
    }
  }, [user, isAdmin, loading]);

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
    fetchMenuItems();
    setShowForm(false);
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
      fetchMenuItems();
    } catch (error: any) {
      toast.error('Failed to delete menu item');
    }
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
            <div className="text-center py-8">
              <Button 
                onClick={() => window.location.href = '/admin/restaurants'} 
                className="bg-primary hover:bg-primary/90"
              >
                Manage Restaurants & Menus
              </Button>
              <p className="text-muted-foreground mt-4">
                Click here to access the full restaurant management interface
              </p>
            </div>
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