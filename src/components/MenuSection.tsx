import { MenuCard } from './MenuCard';

interface MenuItem {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  price: string;
  dietaryTags: string[];
  allergens: string[];
  playCanvasUrl: string;
}

interface MenuSectionProps {
  section: string;
  items: MenuItem[];
}

export const MenuSection = ({ section, items }: MenuSectionProps) => {
  return (
    <section className="mb-8 sm:mb-12">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-2">
          {section}
        </h2>
        <div className="h-1 w-16 sm:w-20 bg-gradient-to-r from-primary to-primary-glow rounded-full"></div>
      </div>
      
      <div className="grid gap-4 sm:gap-6">
        {items.map((item) => (
          <MenuCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
};