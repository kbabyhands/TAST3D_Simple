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
              id: parseInt(item.id.replace(/-/g, '').substring(0, 8), 16),
              name: item.name,
              description: item.description,
              price: `$${item.price.toFixed(2)}`,
              modelUrl: item.model_url || '/3d-models/truffle-arancini.html'
            }))
        },
        { 
          section: 'Entrees', 
          items: menuItems
            .filter(item => item.category === 'entrees')
            .map(item => ({
              id: parseInt(item.id.replace(/-/g, '').substring(0, 8), 16),
              name: item.name,
              description: item.description,
              price: `$${item.price.toFixed(2)}`,
              modelUrl: item.model_url || '/3d-models/wagyu-ribeye.html'
            }))
        },
        { 
          section: 'Desserts', 
          items: menuItems
            .filter(item => item.category === 'desserts')
            .map(item => ({
              id: parseInt(item.id.replace(/-/g, '').substring(0, 8), 16),
              name: item.name,
              description: item.description,
              price: `$${item.price.toFixed(2)}`,
              modelUrl: item.model_url || '/3d-models/chocolate-souffle.html'
            }))
        }
      ]
    : menuData;

  return (
    <div className="min-h-screen bg-gradient-warm">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <MenuHeader />
          </div>
          <Link to="/auth">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Admin
            </Button>
          </Link>
        </div>
        
        <main>
          {sectionsToRender.map((section) => (
            <MenuSection 
              key={section.section}
              section={section.section}
              items={section.items}
            />
          ))}
        </main>
        
        <footer className="text-center mt-12 sm:mt-16 pb-6">
          <p className="text-muted-foreground text-sm">
            Tap any dish to explore in 3D
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
