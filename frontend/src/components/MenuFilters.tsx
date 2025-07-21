import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Utensils, AlertTriangle, X } from 'lucide-react';

interface MenuFiltersProps {
  categories: string[];
  allergens: string[];
  selectedCategories: string[];
  selectedAllergens: string[];
  onCategoryChange: (categories: string[]) => void;
  onAllergenChange: (allergens: string[]) => void;
  onClearFilters: () => void;
}

export const MenuFilters = ({
  categories,
  allergens,
  selectedCategories,
  selectedAllergens,
  onCategoryChange,
  onAllergenChange,
  onClearFilters,
}: MenuFiltersProps) => {
  const [showAllAllergens, setShowAllAllergens] = useState(false);

  const handleCategoryToggle = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoryChange(selectedCategories.filter(c => c !== category));
    } else {
      onCategoryChange([...selectedCategories, category]);
    }
  };

  const handleAllergenToggle = (allergen: string) => {
    if (selectedAllergens.includes(allergen)) {
      onAllergenChange(selectedAllergens.filter(a => a !== allergen));
    } else {
      onAllergenChange([...selectedAllergens, allergen]);
    }
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedAllergens.length > 0;
  const displayedAllergens = showAllAllergens ? allergens : allergens.slice(0, 6);

  return (
    <Card className="mb-8 bg-background/80 backdrop-blur-sm border-border/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Filter Menu</h3>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        {/* Food Type Filters */}
        {categories.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wide">
              Food Type
            </h4>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategories.includes(category) ? "default" : "outline"}
                  className="cursor-pointer transition-all duration-200 hover:scale-105 capitalize"
                  onClick={() => handleCategoryToggle(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Allergen Filters */}
        {allergens.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Allergens to Avoid
              </h4>
            </div>
            <div className="space-y-2">
              {displayedAllergens.map((allergen) => (
                <div key={allergen} className="flex items-center space-x-2">
                  <Checkbox
                    id={`allergen-${allergen}`}
                    checked={selectedAllergens.includes(allergen)}
                    onCheckedChange={() => handleAllergenToggle(allergen)}
                  />
                  <label
                    htmlFor={`allergen-${allergen}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {allergen}
                  </label>
                </div>
              ))}
              
              {allergens.length > 6 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllAllergens(!showAllAllergens)}
                  className="text-primary hover:text-primary/80 p-0 h-auto font-normal"
                >
                  {showAllAllergens ? 'Show Less' : `Show ${allergens.length - 6} More`}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="mt-6 pt-4 border-t border-border/50">
            <p className="text-sm text-muted-foreground mb-2">Active filters:</p>
            <div className="flex flex-wrap gap-1">
              {selectedCategories.map((category) => (
                <Badge key={`filter-${category}`} variant="secondary" className="text-xs">
                  {category}
                </Badge>
              ))}
              {selectedAllergens.map((allergen) => (
                <Badge key={`filter-${allergen}`} variant="destructive" className="text-xs">
                  No {allergen}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};