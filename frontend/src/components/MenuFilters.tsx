import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDown, X, Filter } from 'lucide-react';

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
  const [categoryPopoverOpen, setCategoryPopoverOpen] = useState(false);
  const [allergenPopoverOpen, setAllergenPopoverOpen] = useState(false);

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

  const getCategoryDisplayText = () => {
    if (selectedCategories.length === 0) {
      return 'All Categories';
    } else if (selectedCategories.length === 1) {
      return selectedCategories[0].charAt(0).toUpperCase() + selectedCategories[0].slice(1);
    } else {
      return `${selectedCategories.length} Categories Selected`;
    }
  };

  const getAllergenDisplayText = () => {
    if (selectedAllergens.length === 0) {
      return 'No Allergen Restrictions';
    } else if (selectedAllergens.length === 1) {
      return `Avoid ${selectedAllergens[0]}`;
    } else {
      return `Avoid ${selectedAllergens.length} Allergens`;
    }
  };

  return (
    <Card className="mb-8 bg-background/80 backdrop-blur-sm border-border/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
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

        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Category Filter Dropdown */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Food Type
            </label>
            <Popover open={categoryPopoverOpen} onOpenChange={setCategoryPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between h-10 px-3 py-2 text-sm"
                  role="combobox"
                  aria-expanded={categoryPopoverOpen}
                >
                  {getCategoryDisplayText()}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-4" align="start">
                <div className="space-y-2">
                  <p className="text-sm font-medium mb-3">Select food categories:</p>
                  <div
                    className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm cursor-pointer"
                    onClick={() => onCategoryChange([])}
                  >
                    <div className="flex items-center justify-center w-4 h-4 border border-input rounded-sm">
                      {selectedCategories.length === 0 && (
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      )}
                    </div>
                    <span className="text-sm">All Categories</span>
                  </div>
                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => handleCategoryToggle(category)}
                      />
                      <label
                        htmlFor={`category-${category}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer capitalize"
                      >
                        {category}
                      </label>
                    </div>
                  ))}
                  {selectedCategories.length > 0 && (
                    <div className="pt-2 mt-3 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCategoryChange([])}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Clear Category Filters
                      </Button>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Allergen Filter Dropdown */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Allergen Restrictions
            </label>
            <Popover open={allergenPopoverOpen} onOpenChange={setAllergenPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between h-10 px-3 py-2 text-sm"
                  role="combobox"
                  aria-expanded={allergenPopoverOpen}
                >
                  {getAllergenDisplayText()}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-4" align="start">
                <div className="space-y-2">
                  <p className="text-sm font-medium mb-3">Select allergens to avoid:</p>
                  <div
                    className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm cursor-pointer"
                    onClick={() => onAllergenChange([])}
                  >
                    <div className="flex items-center justify-center w-4 h-4 border border-input rounded-sm">
                      {selectedAllergens.length === 0 && (
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      )}
                    </div>
                    <span className="text-sm">No Restrictions</span>
                  </div>
                  {allergens.map((allergen) => (
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
                  {selectedAllergens.length > 0 && (
                    <div className="pt-2 mt-3 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAllergenChange([])}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Clear Allergen Filters
                      </Button>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="pt-4 border-t border-border/50">
            <p className="text-sm text-muted-foreground mb-2">Active filters:</p>
            <div className="flex flex-wrap gap-1">
              {selectedCategories.map((category) => (
                <Badge key={`filter-${category}`} variant="secondary" className="text-xs capitalize">
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