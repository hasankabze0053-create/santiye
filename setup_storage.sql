
-- 1. Create the storage bucket 'construction-documents' if it doesn't exist
insert into storage.buckets (id, name, public)
values ('construction-documents', 'construction-documents', true)
on conflict (id) do nothing;

-- 2. POLICIES
-- We use DO blocks to avoid errors if policies don't exist yet, 
-- or we just drop them first to be sure.

-- Policy: Allow Authenticated Users to UPLOAD files
drop policy if exists "Authenticated users can upload construction docs" on storage.objects;
create policy "Authenticated users can upload construction docs"
on storage.objects for insert
with check (
  bucket_id = 'construction-documents' 
  and auth.role() = 'authenticated'
);

-- Policy: Allow Everyone to VIEW files
drop policy if exists "Anyone can view construction documents" on storage.objects;
create policy "Anyone can view construction documents"
on storage.objects for select
using (bucket_id = 'construction-documents');

-- Policy: Users can update/delete their own files
drop policy if exists "Users can update own files" on storage.objects;
create policy "Users can update own files"
on storage.objects for update
using (auth.uid() = owner)
with check (bucket_id = 'construction-documents');

drop policy if exists "Users can delete own files" on storage.objects;
create policy "Users can delete own files"
on storage.objects for delete
using (auth.uid() = owner and bucket_id = 'construction-documents');
