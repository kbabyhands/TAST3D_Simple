import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuCardProps {
  item: {
    id: string;
    name: string;
    shortDescription: string;
    fullDescription: string;
    price: string;
    dietaryTags: string[];
    allergens: string[];
    playCanvasUrl: string;
  };
}

export const MenuCard = ({ item }: MenuCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={cn(
        "bg-gradient-card border border-border rounded-lg shadow-card overflow-hidden transition-all duration-300 cursor-pointer",
        isExpanded && "shadow-medium scale-[1.02]"
      )}
      onClick={toggleExpanded}
    >
      {/* Card Header - Always Visible */}
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 line-clamp-2">
              {item.name}
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base line-clamp-2">
              {item.shortDescription}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-lg sm:text-xl font-bold text-primary">
              {item.price}
            </span>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 animate-fade-in">
          {/* Divider */}
          <div className="h-px bg-border mb-4"></div>

          {/* Full Description */}
          <div className="mb-4">
            <p className="text-foreground text-sm sm:text-base leading-relaxed">
              {item.fullDescription}
            </p>
          </div>

          {/* Dietary Tags */}
          {item.dietaryTags.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-foreground mb-2">Dietary Information</h4>
              <div className="flex flex-wrap gap-2">
                {item.dietaryTags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-accent text-accent-foreground text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Allergen Information */}
          {item.allergens.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-foreground mb-2">Contains Allergens</h4>
              <div className="flex flex-wrap gap-2">
                {item.allergens.map((allergen, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-warm-accent text-primary text-xs rounded-full border border-border"
                  >
                    {allergen}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 3D Model Viewer */}
          <div className="mb-2">
            <h4 className="text-sm font-medium text-foreground mb-3">3D View</h4>
            <div className="w-full h-48 sm:h-64 bg-muted rounded-lg overflow-hidden border border-border">
              <iframe
                src={item.playCanvasUrl}
                className="w-full h-full"
                title={`${item.name} 3D Model`}
                style={{ border: 'none' }}
                loading="lazy"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};