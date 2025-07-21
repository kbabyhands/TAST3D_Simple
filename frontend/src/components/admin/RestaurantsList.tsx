import { Restaurant } from "@/types/restaurant";
import { RestaurantCard } from "./RestaurantCard";

interface RestaurantsListProps {
  restaurants: Restaurant[];
  onManageMenu: (restaurant: Restaurant) => void;
  onEdit: (restaurant: Restaurant) => void;
  onDelete: (restaurant: Restaurant) => void;
}

export function RestaurantsList({ restaurants, onManageMenu, onEdit, onDelete }: RestaurantsListProps) {
  if (restaurants.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No restaurants found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {restaurants.map((restaurant) => (
        <RestaurantCard
          key={restaurant.id}
          restaurant={restaurant}
          onManageMenu={onManageMenu}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}