import { useState } from 'react';
import { Sparkles } from 'lucide-react';
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
        
        <p className="text-muted-foreground text-sm mb-6 line-clamp-2 leading-relaxed">
          {item.shortDescription}
        </p>

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

      {/* Expanded Content Modal - 3D View Only */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl">
            <div className="relative p-6">
              {/* Close Button */}
              <Button 
                variant="ghost" 
                size="sm"
                className="absolute top-4 right-4 z-10 bg-black/20 hover:bg-black/40 text-white rounded-full"
                onClick={toggleExpanded}
              >
                ✕
              </Button>

              {/* Header */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">{item.name}</h2>
                <p className="text-xl font-semibold text-foreground">{item.price}</p>
              </div>

              {/* 3D Model Viewer */}
              <div className="w-full h-96 bg-muted rounded-xl overflow-hidden border-2 border-border shadow-inner">
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
      )}
    </div>
  );
};