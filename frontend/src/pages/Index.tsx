import { useState, useEffect, useMemo } from 'react';
import { MenuHeader } from '@/components/MenuHeader';
import { MenuSection } from '@/components/MenuSection';
import { MenuFilters } from '@/components/MenuFilters';
import { Card, CardContent } from '@/components/ui/card';
import { menuData } from '@/data/menuData';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { DatabaseMenuItem } from '@/types/menu';

const Index = () => {
  const [menuItems, setMenuItems] = useState<DatabaseMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true)
        .order('category', { ascending: true });

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      // Fallback to static data if database fails
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Use database items if available, otherwise use static data
  const hasDbItems = menuItems.length > 0;
  const allMenuItems = hasDbItems ? menuItems : [];

  // For static fallback data, convert to the same format
  const staticMenuItems = useMemo(() => menuData.flatMap(section =>
    section.items.map(item => ({
      id: item.id,
      name: item.name,
      description: item.fullDescription,
      price: parseFloat(item.price.replace('$', '')),
      category: section.section.toLowerCase(),
      image_url: null,
      model_url: item.playCanvasUrl,
      is_available: true,
      allergens: item.allergens,
      restaurant_id: 'default'
    }))
  ), []);

  const itemsToUse = hasDbItems ? allMenuItems : staticMenuItems;

  // Get all unique categories and allergens for filters
  const allCategories = useMemo(() => {
    return Array.from(new Set(itemsToUse.map(item => item.category)));
  }, [itemsToUse]);

  const allAllergens = useMemo(() => {
    const allergenSet = new Set<string>();
    itemsToUse.forEach(item => {
      if (item.allergens) {
        item.allergens.forEach(allergen => allergenSet.add(allergen));
      }
    });
    return Array.from(allergenSet).sort();
  }, [itemsToUse]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading menu...</p>
        </div>
      </div>
    );
  }

  // Filter menu items based on selected filters
  const filteredMenuItems = useMemo(() => {
    return itemsToUse.filter(item => {
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
  }, [itemsToUse, selectedCategories, selectedAllergens]);

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedAllergens([]);
  };

  // Group filtered items by category for display
  const sectionsToRender = hasDbItems 
    ? [
        { 
          section: 'Appetizers', 
          items: filteredMenuItems
            .filter(item => item.category === 'appetizers')
            .map(item => ({
              id: item.id,
              name: item.name,
              shortDescription: item.description.substring(0, 120) + '...',
              fullDescription: item.description,
              price: `$${item.price.toFixed(2)}`,
              dietaryTags: [],
              allergens: item.allergens || [],
              playCanvasUrl: item.model_url || '/3d-models/truffle-arancini.html'
            }))
        },
        { 
          section: 'Entrees', 
          items: filteredMenuItems
            .filter(item => item.category === 'entrees')
            .map(item => ({
              id: item.id,
              name: item.name,
              shortDescription: item.description.substring(0, 120) + '...',
              fullDescription: item.description,
              price: `$${item.price.toFixed(2)}`,
              dietaryTags: [],
              allergens: item.allergens || [],
              playCanvasUrl: item.model_url || '/3d-models/wagyu-ribeye.html'
            }))
        },
        { 
          section: 'Desserts', 
          items: filteredMenuItems
            .filter(item => item.category === 'desserts')
            .map(item => ({
              id: item.id,
              name: item.name,
              shortDescription: item.description.substring(0, 120) + '...',
              fullDescription: item.description,
              price: `$${item.price.toFixed(2)}`,
              dietaryTags: [],
              allergens: item.allergens || [],
              playCanvasUrl: item.model_url || '/3d-models/chocolate-souffle.html'
            }))
        }
      ].filter(section => section.items.length > 0)
    : menuData
        .map(section => ({
          ...section,
          items: section.items.filter(item => {
            // Filter by category for static data
            if (selectedCategories.length > 0 && !selectedCategories.includes(section.section.toLowerCase())) {
              return false;
            }
            
            // Filter by allergens for static data
            if (selectedAllergens.length > 0) {
              const hasSelectedAllergens = selectedAllergens.some(allergen => 
                item.allergens.includes(allergen)
              );
              if (hasSelectedAllergens) {
                return false;
              }
            }
            
            return true;
          })
        }))
        .filter(section => section.items.length > 0);

  return (
    <div className="min-h-screen bg-background">
      <MenuHeader />
      
      <main className="container mx-auto px-4 pb-16">
        {/* Show filters */}
        {(itemsToUse.length > 0 || menuData.length > 0) && (
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

        {sectionsToRender.length === 0 ? (
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
          sectionsToRender.map((section) => (
            <MenuSection 
              key={section.section}
              section={section.section}
              items={section.items}
            />
          ))
        )}
      </main>
      
      <footer className="text-center pb-8 space-y-4">
        <p className="text-muted-foreground">
          Tap any dish to explore in 3D
        </p>
        <div>
          <Link to="/auth">
            <Button variant="ghost" size="sm" className="text-xs">
              <Settings className="w-3 h-3 mr-1" />
              Admin
            </Button>
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Index;
