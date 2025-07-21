-- Add header_image_url column to restaurants table
ALTER TABLE public.restaurants 
ADD COLUMN header_image_url TEXT;