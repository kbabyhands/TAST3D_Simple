export interface DatabaseMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string | null;
  model_url: string | null;
  is_available: boolean;
  allergens: string[] | null;
  created_at?: string;
  updated_at?: string;
}

export type MenuCategory = 'appetizers' | 'entrees' | 'desserts';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  image_url: string | null;
  model_url: string | null;
  is_available: boolean;
}