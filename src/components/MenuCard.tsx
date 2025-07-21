import { useState } from 'react';
import { Star, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
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
  const [imageError, setImageError] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Generate a mock rating for demo purposes
  const rating = 4.5 + Math.random() * 0.5;
  const reviewCount = Math.floor(Math.random() * 50) + 1;

  return (
    <div className="group bg-card border border-border rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden">
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        {!imageError ? (
          <img 
            src={`https://images.unsplash.com/photo-${1500000000000 + Math.abs(item.id.split('').reduce((a, b) => (a + b.charCodeAt(0)) * 31, 0) % 1000000000)}?w=400&h=300&fit=crop&q=80`}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <span className="text-6xl opacity-30">🍽️</span>
          </div>
        )}
        
        {/* Overlay Badges */}
        <div className="absolute top-4 left-4">
          <Badge className="bg-primary text-primary-foreground font-semibold px-3 py-1 rounded-full shadow-lg">
            <Sparkles className="h-3 w-3 mr-1" />
            3D VIEW
          </Badge>
        </div>
        
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="bg-black/70 text-white font-bold px-3 py-1 rounded-full backdrop-blur-sm">
            {item.price}
          </Badge>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button 
            variant="secondary" 
            className="bg-white/90 text-black hover:bg-white font-semibold rounded-full px-6 py-2"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpanded();
            }}
          >
            View Details
          </Button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-1">
          {item.name}
        </h3>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed">
          {item.shortDescription}
        </p>

        {/* Rating */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                  )}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-foreground">
              {rating.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">
              ({reviewCount} reviews)
            </span>
          </div>
        </div>

        {/* Price and CTA */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground">Starting at</span>
            <div className="text-2xl font-bold text-foreground">{item.price}</div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpanded();
            }}
            className="rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            Details
          </Button>
        </div>
      </div>

      {/* Expanded Content Modal */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="relative">
              {/* Close Button */}
              <Button 
                variant="ghost" 
                size="sm"
                className="absolute top-4 right-4 z-10 bg-black/20 hover:bg-black/40 text-white rounded-full"
                onClick={toggleExpanded}
              >
                ✕
              </Button>

              {/* Header Image */}
              <div className="h-64 relative overflow-hidden rounded-t-2xl">
                {!imageError ? (
                  <img 
                    src={`https://images.unsplash.com/photo-${1500000000000 + Math.abs(item.id.split('').reduce((a, b) => (a + b.charCodeAt(0)) * 31, 0) % 1000000000)}?w=800&h=400&fit=crop&q=80`}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <span className="text-8xl opacity-30">🍽️</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h2 className="text-3xl font-bold mb-2">{item.name}</h2>
                  <p className="text-xl opacity-90">{item.price}</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Description</h3>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      {item.fullDescription}
                    </p>

                    {/* Dietary Tags */}
                    {item.dietaryTags.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-medium mb-3">Dietary Information</h4>
                        <div className="flex flex-wrap gap-2">
                          {item.dietaryTags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="rounded-full">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Allergens */}
                    {item.allergens.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-medium mb-3">Contains Allergens</h4>
                        <div className="flex flex-wrap gap-2">
                          {item.allergens.map((allergen, index) => (
                            <Badge key={index} variant="destructive" className="rounded-full">
                              {allergen}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3D Model Viewer */}
                  <div>
                    <h4 className="font-medium mb-4">3D Interactive View</h4>
                    <div className="w-full h-80 bg-muted rounded-xl overflow-hidden border-2 border-border shadow-inner">
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};