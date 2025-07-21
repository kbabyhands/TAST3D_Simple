export interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  header_image_url?: string | null;
  created_at?: string;
  updated_at?: string;
}