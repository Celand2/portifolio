create table public.contact_messages (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254),
  subject text not null check (char_length(subject) between 1 and 160),
  message text not null check (char_length(message) between 1 and 5000)
);

alter table public.contact_messages enable row level security;

revoke all on table public.contact_messages from anon, authenticated;
grant insert on table public.contact_messages to service_role;
grant usage, select on sequence public.contact_messages_id_seq to service_role;
