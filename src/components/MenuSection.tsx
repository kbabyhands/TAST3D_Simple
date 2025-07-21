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
    <section className="mb-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
          {section}
        </h2>
        <p className="text-muted-foreground text-lg">
          {section === "Featured Items" ? "Highest rated dishes" : "Crafted with premium ingredients"}
        </p>
        <div className="h-1 w-24 bg-gradient-to-r from-primary to-primary-glow rounded-full mx-auto mt-4"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item) => (
          <MenuCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
};