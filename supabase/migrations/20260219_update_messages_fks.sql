-- Drop existing constraints
alter table public.messages drop constraint if exists messages_sender_id_fkey;
alter table public.messages drop constraint if exists messages_receiver_id_fkey;

-- Add new constraints referencing public.profiles
-- This enables `select(..., profiles:sender_id(...))` joins via PostgREST
alter table public.messages
  add constraint messages_sender_id_fkey
  foreign key (sender_id)
  references public.profiles(id);

alter table public.messages
  add constraint messages_receiver_id_fkey
  foreign key (receiver_id)
  references public.profiles(id);
