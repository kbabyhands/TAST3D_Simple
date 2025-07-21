import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MenuSection } from '@/components/MenuSection';
import { MenuFilters } from '@/components/MenuFilters';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { DatabaseMenuItem } from '@/types/menu';
import { Restaurant } from '@/types/restaurant';

export default function RestaurantMenu() {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<DatabaseMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);

  useEffect(() => {
    if (!restaurantId) {
      toast.error('Restaurant not found');
      setLoading(false);
      return;
    }

    fetchRestaurantAndMenu();
  }, [restaurantId]);

  const fetchRestaurantAndMenu = async () => {
    try {
      // Fetch restaurant details
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .eq('is_active', true)
        .single();

      if (restaurantError) {
        toast.error('Restaurant not found or inactive');
        setLoading(false);
        return;
      }

      setRestaurant(restaurantData);

      // Fetch menu items for this restaurant
      const { data: menuData, error: menuError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_available', true)
        .order('category', { ascending: true });

      if (menuError) throw menuError;

      setMenuItems(menuData || []);
    } catch (error: any) {
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Restaurant Not Found</h1>
            <p className="text-muted-foreground">
              The restaurant you're looking for doesn't exist or is currently inactive.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get all unique categories and allergens for filters
  const allCategories = useMemo(() => {
    return Array.from(new Set(menuItems.map(item => item.category)));
  }, [menuItems]);

  const allAllergens = useMemo(() => {
    const allergenSet = new Set<string>();
    menuItems.forEach(item => {
      if (item.allergens) {
        item.allergens.forEach(allergen => allergenSet.add(allergen));
      }
    });
    return Array.from(allergenSet).sort();
  }, [menuItems]);

  // Filter menu items based on selected filters
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(item => {
      // Filter by category
      if (selectedCategories.length > 0 && !selectedCategories.includes(item.category)) {
        return false;
      }
      
      // Filter by allergens (exclude items that contain selected allergens)
      if (selectedAllergens.length > 0 && item.allergens) {
        const hasSelectedAllergens = selectedAllergens.some(allergen => 
          item.allergens!.includes(allergen)
        );
        if (hasSelectedAllergens) {
          return false;
        }
      }
      
      return true;
    });
  }, [menuItems, selectedCategories, selectedAllergens]);

  // Group filtered menu items by category
  const groupedItems = filteredMenuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, DatabaseMenuItem[]>);

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedAllergens([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        {/* Custom Header for Restaurant */}
        <header className="relative h-[50vh] flex items-center justify-center text-center mb-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{
              backgroundImage: `url(${restaurant.header_image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&h=1200&fit=crop'})`
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto px-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
              {restaurant.name}
            </h1>
            <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              {restaurant.description || 'Welcome to our restaurant'}
            </p>
          </div>
        </header>
        
        {/* Show filters only if there are menu items */}
        {menuItems.length > 0 && (
          <MenuFilters
            categories={allCategories}
            allergens={allAllergens}
            selectedCategories={selectedCategories}
            selectedAllergens={selectedAllergens}
            onCategoryChange={setSelectedCategories}
            onAllergenChange={setSelectedAllergens}
            onClearFilters={handleClearFilters}
          />
        )}
        
        {menuItems.length === 0 ? (
          <Card className="max-w-md mx-auto mt-8">
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-semibold mb-4">No Menu Items Available</h2>
              <p className="text-muted-foreground">
                This restaurant hasn't added any menu items yet.
              </p>
            </CardContent>
          </Card>
        ) : Object.keys(groupedItems).length === 0 ? (
          <Card className="max-w-md mx-auto mt-8">
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-semibold mb-4">No Items Match Your Filters</h2>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters to see more menu items.
              </p>
              <button
                onClick={handleClearFilters}
                className="text-primary hover:text-primary/80 font-medium underline"
              >
                Clear all filters
              </button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-12 mt-8">
            {Object.entries(groupedItems).map(([category, items]) => (
              <MenuSection
                key={category}
                section={category}
                items={items.map(item => ({
                  id: item.id,
                  name: item.name,
                  shortDescription: item.description,
                  fullDescription: item.description,
                  price: `$${Number(item.price).toFixed(2)}`,
                  dietaryTags: [],
                  allergens: item.allergens || [],
                  playCanvasUrl: item.model_url || ''
                }))}
              />
            ))}
          </div>
        )}

        {restaurant.address && (
          <Card className="mt-12 max-w-2xl mx-auto">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Location & Contact</h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>{restaurant.address}</p>
                {restaurant.phone && <p>Phone: {restaurant.phone}</p>}
                {restaurant.email && <p>Email: {restaurant.email}</p>}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}