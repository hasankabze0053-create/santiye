
-- Kullanıcıların kendi taleplerini silmesine izin ver
-- (Eksik olan RLS kuralı)

drop policy if exists "Users can delete own requests" on public.construction_requests;

create policy "Users can delete own requests"
  on public.construction_requests for delete
  using (auth.uid() = user_id);
