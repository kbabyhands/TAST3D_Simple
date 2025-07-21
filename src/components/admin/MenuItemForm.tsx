import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Upload, X, Plus } from 'lucide-react';
import { DatabaseMenuItem, MenuCategory } from '@/types/menu';

interface MenuItemFormProps {
  item?: DatabaseMenuItem | null;
  restaurantId: string;
  onSave: () => void;
  onCancel: () => void;
}

export function MenuItemForm({ item, restaurantId, onSave, onCancel }: MenuItemFormProps) {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    description: item?.description || '',
    price: item?.price || 0,
    category: (item?.category as MenuCategory) || 'appetizers' as MenuCategory,
    is_available: item?.is_available ?? true,
    allergens: item?.allergens || [],
  });
  
  const [newAllergen, setNewAllergen] = useState('');
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [htmlFile, setHtmlFile] = useState<File | null>(null);
  const [loading, setSaving] = useState(false);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const htmlInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addAllergen = () => {
    if (newAllergen.trim() && !formData.allergens.includes(newAllergen.trim())) {
      setFormData(prev => ({
        ...prev,
        allergens: [...prev.allergens, newAllergen.trim()]
      }));
      setNewAllergen('');
    }
  };

  const removeAllergen = (allergenToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.filter(allergen => allergen !== allergenToRemove)
    }));
  };

  const handleAllergenKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addAllergen();
    }
  };

  const handleFileUpload = async (file: File, bucket: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      toast.error(`Failed to upload ${bucket === 'images' ? 'image' : 'HTML file'}`);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let imageUrl = item?.image_url;
      let modelUrl = item?.model_url;

      // Upload image if provided
      if (imageFile) {
        imageUrl = await handleFileUpload(imageFile, 'images');
        if (!imageUrl) {
          setSaving(false);
          return;
        }
      }

      // Upload HTML file if provided
      if (htmlFile) {
        modelUrl = await handleFileUpload(htmlFile, 'models');
        if (!modelUrl) {
          setSaving(false);
          return;
        }
      }

      const menuItemData = {
        ...formData,
        image_url: imageUrl,
        model_url: modelUrl,
      };

      if (item) {
        // Update existing item
        const { error } = await supabase
          .from('menu_items')
          .update(menuItemData)
          .eq('id', item.id);

        if (error) throw error;
        toast.success('Menu item updated successfully');
      } else {
        // Create new item
        const { error } = await supabase
          .from('menu_items')
          .insert([{ ...menuItemData, restaurant_id: restaurantId }]);

        if (error) throw error;
        toast.success('Menu item created successfully');
      }

      onSave();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save menu item');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{item ? 'Edit Menu Item' : 'Add New Menu Item'}</CardTitle>
        <CardDescription>
          Fill in the details for your menu item
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                placeholder="Menu item name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                required
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="appetizers">Appetizers</SelectItem>
                <SelectItem value="entrees">Entrees</SelectItem>
                <SelectItem value="desserts">Desserts</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
              placeholder="Describe your menu item..."
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Allergens</Label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newAllergen}
                  onChange={(e) => setNewAllergen(e.target.value)}
                  onKeyPress={handleAllergenKeyPress}
                  placeholder="Add allergen (e.g., Gluten, Dairy, Nuts)"
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addAllergen}
                  disabled={!newAllergen.trim() || formData.allergens.includes(newAllergen.trim())}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {formData.allergens.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.allergens.map((allergen) => (
                    <Badge 
                      key={allergen} 
                      variant="outline" 
                      className="bg-destructive/10 text-destructive border-destructive/20 pr-1"
                    >
                      {allergen}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1 hover:bg-destructive/20"
                        onClick={() => removeAllergen(allergen)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Image Upload</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => imageInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {imageFile ? imageFile.name : 'Upload Image'}
                </Button>
                {item?.image_url && !imageFile && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Current image will be kept
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>3D Model (HTML File)</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                <input
                  ref={htmlInputRef}
                  type="file"
                  accept=".html"
                  onChange={(e) => setHtmlFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => htmlInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {htmlFile ? htmlFile.name : 'Upload HTML Model'}
                </Button>
                {item?.model_url && !htmlFile && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Current model will be kept
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="available"
              checked={formData.is_available}
              onCheckedChange={(checked) => handleInputChange('is_available', checked)}
            />
            <Label htmlFor="available">Available for ordering</Label>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (item ? 'Update Item' : 'Create Item')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}