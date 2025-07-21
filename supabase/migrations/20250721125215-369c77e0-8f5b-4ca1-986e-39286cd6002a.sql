-- Create restaurants table
CREATE TABLE public.restaurants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

-- Create policies for restaurants
CREATE POLICY "Anyone can view active restaurants" 
ON public.restaurants 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage restaurants" 
ON public.restaurants 
FOR ALL 
USING (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text))));

-- Add restaurant_id to menu_items table
ALTER TABLE public.menu_items 
ADD COLUMN restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX idx_menu_items_restaurant_id ON public.menu_items(restaurant_id);

-- Create trigger for restaurants updated_at
CREATE TRIGGER update_restaurants_updated_at
BEFORE UPDATE ON public.restaurants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert a default restaurant for existing menu items
INSERT INTO public.restaurants (name, description, address) 
VALUES ('Main Restaurant', 'Default restaurant for existing menu items', 'Main Location');

-- Update existing menu items to reference the default restaurant
UPDATE public.menu_items 
SET restaurant_id = (SELECT id FROM public.restaurants WHERE name = 'Main Restaurant' LIMIT 1)
WHERE restaurant_id IS NULL;