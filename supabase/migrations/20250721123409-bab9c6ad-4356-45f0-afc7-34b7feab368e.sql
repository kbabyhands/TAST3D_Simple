-- Add allergens column to menu_items table
ALTER TABLE public.menu_items 
ADD COLUMN allergens TEXT[] DEFAULT '{}';

-- Add some sample allergen data to existing items
UPDATE public.menu_items 
SET allergens = CASE 
  WHEN category = 'appetizers' THEN ARRAY['Gluten', 'Dairy']
  WHEN category = 'entrees' THEN ARRAY['Shellfish', 'Nuts']
  WHEN category = 'desserts' THEN ARRAY['Dairy', 'Eggs', 'Gluten']
  ELSE ARRAY[]::TEXT[]
END;