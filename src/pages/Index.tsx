import { useState, useEffect } from 'react';
import { MenuHeader } from '@/components/MenuHeader';
import { MenuSection } from '@/components/MenuSection';
import { menuData } from '@/data/menuData';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { DatabaseMenuItem } from '@/types/menu';

const Index = () => {
  const [menuItems, setMenuItems] = useState<DatabaseMenuItem[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Use database items if available, otherwise fallback to static data
  const hasDbItems = menuItems.length > 0;
  const sectionsToRender = hasDbItems 
    ? [
        { 
          section: 'Appetizers', 
          items: menuItems
            .filter(item => item.category === 'appetizers')
            .map(item => ({
              id: item.id,
              name: item.name,
              shortDescription: item.description.substring(0, 120) + '...',
              fullDescription: item.description,
              price: `$${item.price.toFixed(2)}`,
              dietaryTags: [],
              allergens: [],
              playCanvasUrl: item.model_url || '/3d-models/truffle-arancini.html'
            }))
        },
        { 
          section: 'Entrees', 
          items: menuItems
            .filter(item => item.category === 'entrees')
            .map(item => ({
              id: item.id,
              name: item.name,
              shortDescription: item.description.substring(0, 120) + '...',
              fullDescription: item.description,
              price: `$${item.price.toFixed(2)}`,
              dietaryTags: [],
              allergens: [],
              playCanvasUrl: item.model_url || '/3d-models/wagyu-ribeye.html'
            }))
        },
        { 
          section: 'Desserts', 
          items: menuItems
            .filter(item => item.category === 'desserts')
            .map(item => ({
              id: item.id,
              name: item.name,
              shortDescription: item.description.substring(0, 120) + '...',
              fullDescription: item.description,
              price: `$${item.price.toFixed(2)}`,
              dietaryTags: [],
              allergens: [],
              playCanvasUrl: item.model_url || '/3d-models/chocolate-souffle.html'
            }))
        }
      ].filter(section => section.items.length > 0)
    : menuData;

  return (
    <div className="min-h-screen bg-background">
      <MenuHeader />
      
      <main className="container mx-auto px-4 pb-16">
        {sectionsToRender.map((section) => (
          <MenuSection 
            key={section.section}
            section={section.section}
            items={section.items}
          />
        ))}
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
