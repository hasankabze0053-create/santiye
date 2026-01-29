-- BU SCRIPT SADECE TRIGGER'I DÜZELTİR
-- Supabase SQL Editor'de bunu çalıştır.

-- 1. Trigger Fonksiyonunu En Basit Hale Getiriyoruz
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER 
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, user_type)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data ->> 'full_name',
    'individual' -- Varsayılan olarak bireysel atıyoruz, Enum cast hatasını önlemek için.
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;
    
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- 2. Trigger'ı Yeniden Bağlıyoruz
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
