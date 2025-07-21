import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { DatabaseMenuItem } from '@/types/menu';

interface MenuItemsListProps {
  items: DatabaseMenuItem[];
  onEdit: (item: DatabaseMenuItem) => void;
  onDelete: (id: string) => void;
}

const categoryLabels: Record<string, string> = {
  appetizers: 'Appetizers',
  entrees: 'Entrees', 
  desserts: 'Desserts'
};

const categoryColors: Record<string, string> = {
  appetizers: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  entrees: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  desserts: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
};

export function MenuItemsList({ items, onEdit, onDelete }: MenuItemsListProps) {
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, DatabaseMenuItem[]>);

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">No menu items found. Create your first menu item to get started.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedItems).map(([category, categoryItems]) => (
        <div key={category}>
          <h3 className="text-xl font-semibold mb-4 capitalize">
            {categoryLabels[category as keyof typeof categoryLabels]}
          </h3>
          <div className="grid gap-4">
            {categoryItems.map((item) => (
              <Card key={item.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        <Badge className={categoryColors[item.category] || 'bg-gray-100 text-gray-800'}>
                          {categoryLabels[item.category] || item.category}
                        </Badge>
                        {!item.is_available && (
                          <Badge variant="secondary">
                            <EyeOff className="w-3 h-3 mr-1" />
                            Unavailable
                          </Badge>
                        )}
                      </div>
                      <p className="text-2xl font-bold text-primary">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(item)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this menu item?')) {
                            onDelete(item.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{item.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Image:</p>
                      <p className="text-muted-foreground">
                        {item.image_url ? (
                          <span className="text-green-600 flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            Uploaded
                          </span>
                        ) : (
                          <span className="text-muted-foreground">No image</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">3D Model:</p>
                      <p className="text-muted-foreground">
                        {item.model_url ? (
                          <span className="text-green-600 flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            Available
                          </span>
                        ) : (
                          <span className="text-muted-foreground">No model</span>
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}