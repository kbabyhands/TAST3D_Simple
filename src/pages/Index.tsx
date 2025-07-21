import { MenuHeader } from '@/components/MenuHeader';
import { MenuSection } from '@/components/MenuSection';
import { menuData } from '@/data/menuData';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-warm">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
        <MenuHeader />
        
        <main>
          {menuData.map((section) => (
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
