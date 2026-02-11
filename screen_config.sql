-- Create Screen Section Config Table
create table if not exists public.screen_section_config (
    id text primary key, -- e.g. 'urban_expert_qa'
    screen_id text not null, -- e.g. 'UrbanTransformationScreen'
    title text not null, -- Display title for admin
    sort_order int not null default 0,
    is_visible boolean not null default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.screen_section_config enable row level security;

-- Policy: Everyone can read
drop policy if exists "Enable read access for all users" on public.screen_section_config;
create policy "Enable read access for all users" on public.screen_section_config for select using (true);

-- Policy: Only admins can update
drop policy if exists "Enable update for admins" on public.screen_section_config;
create policy "Enable update for admins" on public.screen_section_config for update using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);

-- Seed Data for Urban Transformation Screen
insert into public.screen_section_config (id, screen_id, title, sort_order, is_visible)
values 
('urban_expert_qa', 'UrbanTransformationScreen', 'Uzmana Sor', 10, true),
('urban_construction_quotes', 'UrbanTransformationScreen', 'İnşaat Teklifleri', 20, true),
('urban_process_steps', 'UrbanTransformationScreen', 'Dönüşüm Adımları', 30, true)
on conflict (id) do nothing;
