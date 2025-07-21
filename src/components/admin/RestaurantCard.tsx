import { Restaurant } from "@/types/restaurant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Mail, Menu, Trash2 } from "lucide-react";

interface RestaurantCardProps {
  restaurant: Restaurant;
  onManageMenu: (restaurant: Restaurant) => void;
  onEdit: (restaurant: Restaurant) => void;
  onDelete: (restaurant: Restaurant) => void;
}

export function RestaurantCard({ restaurant, onManageMenu, onEdit, onDelete }: RestaurantCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{restaurant.name}</CardTitle>
            <Badge variant={restaurant.is_active ? "default" : "secondary"} className="mt-2">
              {restaurant.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {restaurant.description && (
          <p className="text-muted-foreground">{restaurant.description}</p>
        )}
        
        <div className="space-y-2">
          {restaurant.address && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{restaurant.address}</span>
            </div>
          )}
          
          {restaurant.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{restaurant.phone}</span>
            </div>
          )}
          
          {restaurant.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{restaurant.email}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4">
          <Button 
            onClick={() => onManageMenu(restaurant)}
            className="flex-1"
          >
            <Menu className="h-4 w-4 mr-2" />
            Manage Menu
          </Button>
          <Button 
            variant="outline" 
            onClick={() => onEdit(restaurant)}
          >
            Edit
          </Button>
          <Button 
            variant="destructive" 
            size="icon"
            onClick={() => onDelete(restaurant)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}