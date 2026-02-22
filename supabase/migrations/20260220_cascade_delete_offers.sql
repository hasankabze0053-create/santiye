-- construction_offers tablosuna ON DELETE CASCADE ekleyerek talebin silinebilmesini sağlıyoruz
ALTER TABLE public.construction_offers 
DROP CONSTRAINT IF EXISTS construction_offers_request_id_fkey;

ALTER TABLE public.construction_offers
ADD CONSTRAINT construction_offers_request_id_fkey 
FOREIGN KEY (request_id) 
REFERENCES public.construction_requests(id) 
ON DELETE CASCADE;
