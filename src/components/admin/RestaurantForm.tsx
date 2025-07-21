import { useState } from "react";
import { Restaurant } from "@/types/restaurant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RestaurantFormProps {
  restaurant?: Restaurant;
  onSaved: () => void;
  onCancel: () => void;
}

export function RestaurantForm({ restaurant, onSaved, onCancel }: RestaurantFormProps) {
  const [formData, setFormData] = useState({
    name: restaurant?.name || "",
    description: restaurant?.description || "",
    address: restaurant?.address || "",
    phone: restaurant?.phone || "",
    email: restaurant?.email || "",
    header_image_url: restaurant?.header_image_url || "",
    is_active: restaurant?.is_active ?? true,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (restaurant) {
        const { error } = await supabase
          .from('restaurants')
          .update(formData)
          .eq('id', restaurant.id);
        
        if (error) throw error;
        toast({ title: "Restaurant updated successfully" });
      } else {
        const { error } = await supabase
          .from('restaurants')
          .insert([formData]);
        
        if (error) throw error;
        toast({ title: "Restaurant created successfully" });
      }
      
      onSaved();
    } catch (error) {
      console.error('Error saving restaurant:', error);
      toast({ 
        title: "Error saving restaurant", 
        description: "Please try again",
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{restaurant ? 'Edit Restaurant' : 'Add New Restaurant'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Restaurant Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <div>
            <ImageUpload
              value={formData.header_image_url}
              onChange={(url) => setFormData(prev => ({ ...prev, header_image_url: url }))}
              onRemove={() => setFormData(prev => ({ ...prev, header_image_url: "" }))}
              label="Header Image"
              description="Upload an image for the menu header (max 5MB, JPG/PNG)"
              maxSize={5}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : restaurant ? 'Update' : 'Create'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}