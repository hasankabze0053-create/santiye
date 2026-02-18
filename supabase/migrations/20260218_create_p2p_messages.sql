-- Mesajlaşma tablosu
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references auth.users(id) not null,
  receiver_id uuid references auth.users(id) not null,
  request_id uuid references public.construction_requests(id),
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Güvenlik ayarları (RLS)
alter table public.messages enable row level security;

-- Herkes kendi mesajlarını görebilsin
drop policy if exists "Users can see their own messages" on public.messages;
create policy "Users can see their own messages"
on public.messages for select
using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- Sadece kendi adına mesaj atabilsin
drop policy if exists "Users can send messages" on public.messages;
create policy "Users can send messages"
on public.messages for insert
with check (auth.uid() = sender_id);

-- Gerekli indexler
create index if not exists messages_sender_id_idx on public.messages(sender_id);
create index if not exists messages_receiver_id_idx on public.messages(receiver_id);
create index if not exists messages_request_id_idx on public.messages(request_id);

-- Realtime izni
alter publication supabase_realtime add table messages;
