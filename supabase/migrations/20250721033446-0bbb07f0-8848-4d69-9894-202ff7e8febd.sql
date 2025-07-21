-- Create an admin user (you'll need to sign up with this email first)
-- This is just creating the profile with admin role, the actual user signup happens through the UI
INSERT INTO public.profiles (id, email, role) 
VALUES ('00000000-0000-0000-0000-000000000000', 'admin@example.com', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';