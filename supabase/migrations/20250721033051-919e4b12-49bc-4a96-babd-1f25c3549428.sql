-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create menu_items table to store menu data
CREATE TABLE public.menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('appetizers', 'entrees', 'desserts')),
  image_url TEXT,
  model_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on menu_items
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Create storage bucket for HTML model files
INSERT INTO storage.buckets (id, name, public) VALUES ('models', 'models', true);

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true);

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for menu_items (public read, admin write)
CREATE POLICY "Anyone can view menu items" ON public.menu_items
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage menu items" ON public.menu_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Storage policies for models bucket
CREATE POLICY "Anyone can view model files" ON storage.objects
  FOR SELECT USING (bucket_id = 'models');

CREATE POLICY "Admins can upload model files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'models' AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update model files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'models' AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete model files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'models' AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Storage policies for images bucket
CREATE POLICY "Anyone can view image files" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Admins can upload image files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'images' AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update image files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'images' AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete image files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'images' AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample menu items
INSERT INTO public.menu_items (name, description, price, category, model_url) VALUES
('Truffle Arancini', 'Crispy risotto balls filled with truffle and aged parmesan, served with saffron aioli', 18.00, 'appetizers', '/3d-models/truffle-arancini.html'),
('Pan-Seared Scallops', 'Diver scallops with cauliflower purée, pancetta crisps, and microgreens', 24.00, 'appetizers', '/3d-models/scallops.html'),
('Wagyu Ribeye', '12oz dry-aged wagyu with roasted bone marrow, seasonal vegetables, and red wine jus', 89.00, 'entrees', '/3d-models/wagyu-ribeye.html'),
('Burrata & Peach', 'Creamy burrata with grilled peaches, prosciutto, arugula, and balsamic reduction', 26.00, 'appetizers', '/3d-models/burrata-peach.html'),
('Dark Chocolate Soufflé', 'Warm chocolate soufflé with vanilla bean ice cream and gold leaf', 16.00, 'desserts', '/3d-models/chocolate-souffle.html'),
('Classic Tiramisu', 'Traditional Italian tiramisu with ladyfingers, mascarpone, and coffee', 14.00, 'desserts', '/3d-models/tiramisu.html');