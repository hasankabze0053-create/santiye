-- Create INSERT policy for admins
drop policy if exists "Enable insert for admins" on public.screen_section_config;
create policy "Enable insert for admins" on public.screen_section_config for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);

-- Re-create UPDATE policy with USING and WITH CHECK
drop policy if exists "Enable update for admins" on public.screen_section_config;
create policy "Enable update for admins" on public.screen_section_config for update 
using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
)
with check (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);

-- Enable delete for admins just in case
drop policy if exists "Enable delete for admins" on public.screen_section_config;
create policy "Enable delete for admins" on public.screen_section_config for delete using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);
