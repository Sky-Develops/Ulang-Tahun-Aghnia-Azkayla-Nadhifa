create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id text primary key,
  name text not null,
  age integer not null default 2,
  birth_date date not null,
  city text not null,
  bio text not null,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.settings (
  id text primary key,
  website_title text not null,
  music_url text not null,
  theme text not null default 'ocean',
  forms_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('photo', 'video')),
  url text not null,
  title text not null,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.wishes (
  id uuid primary key default gen_random_uuid(),
  name text,
  message text not null,
  approved boolean not null default true,
  pinned boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.guests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  relation text not null,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists settings_set_updated_at on public.settings;
create trigger settings_set_updated_at
before update on public.settings
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.settings enable row level security;
alter table public.gallery enable row level security;
alter table public.wishes enable row level security;
alter table public.guests enable row level security;

drop policy if exists "Public can read profiles" on public.profiles;
create policy "Public can read profiles"
on public.profiles for select
to anon, authenticated
using (true);

drop policy if exists "Public can read settings" on public.settings;
create policy "Public can read settings"
on public.settings for select
to anon, authenticated
using (true);

drop policy if exists "Public can read gallery" on public.gallery;
create policy "Public can read gallery"
on public.gallery for select
to anon, authenticated
using (true);

drop policy if exists "Public can read approved wishes" on public.wishes;
create policy "Public can read approved wishes"
on public.wishes for select
to anon
using (approved = true);

drop policy if exists "Authenticated can read all wishes" on public.wishes;
create policy "Authenticated can read all wishes"
on public.wishes for select
to authenticated
using (true);

drop policy if exists "Public can create wishes" on public.wishes;
create policy "Public can create wishes"
on public.wishes for insert
to anon, authenticated
with check (true);

drop policy if exists "Public can create guests" on public.guests;
create policy "Public can create guests"
on public.guests for insert
to anon, authenticated
with check (true);

drop policy if exists "Admin can manage profiles" on public.profiles;
create policy "Admin can manage profiles"
on public.profiles for all
to authenticated
using ((select auth.jwt() ->> 'email') = 'tegarmi839@gmail.com')
with check ((select auth.jwt() ->> 'email') = 'tegarmi839@gmail.com');

drop policy if exists "Admin can manage settings" on public.settings;
create policy "Admin can manage settings"
on public.settings for all
to authenticated
using ((select auth.jwt() ->> 'email') = 'tegarmi839@gmail.com')
with check ((select auth.jwt() ->> 'email') = 'tegarmi839@gmail.com');

drop policy if exists "Admin can manage gallery" on public.gallery;
create policy "Admin can manage gallery"
on public.gallery for all
to authenticated
using ((select auth.jwt() ->> 'email') = 'tegarmi839@gmail.com')
with check ((select auth.jwt() ->> 'email') = 'tegarmi839@gmail.com');

drop policy if exists "Admin can manage wishes" on public.wishes;
create policy "Admin can manage wishes"
on public.wishes for all
to authenticated
using ((select auth.jwt() ->> 'email') = 'tegarmi839@gmail.com')
with check ((select auth.jwt() ->> 'email') = 'tegarmi839@gmail.com');

drop policy if exists "Admin can read guests" on public.guests;
create policy "Admin can read guests"
on public.guests for select
to authenticated
using ((select auth.jwt() ->> 'email') = 'tegarmi839@gmail.com');

insert into public.profiles (id, name, age, birth_date, city, bio)
values ('main', 'Kayla', 2, '2023-01-15', 'Surabaya, Indonesia', 'Baby Shark doo doo doo...')
on conflict (id) do nothing;

insert into public.settings (id, website_title, music_url, theme, forms_enabled)
values ('main', 'Kayla''s 2nd Birthday', '/audio/baby-shark.mp3', 'ocean', true)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'profiles'
  ) then
    alter publication supabase_realtime add table public.profiles;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'settings'
  ) then
    alter publication supabase_realtime add table public.settings;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'gallery'
  ) then
    alter publication supabase_realtime add table public.gallery;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'wishes'
  ) then
    alter publication supabase_realtime add table public.wishes;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'guests'
  ) then
    alter publication supabase_realtime add table public.guests;
  end if;
end $$;

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public can read media" on storage.objects;
create policy "Public can read media"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'media');

drop policy if exists "Admin can upload media" on storage.objects;
create policy "Admin can upload media"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'media'
  and (select auth.jwt() ->> 'email') = 'tegarmi839@gmail.com'
);

drop policy if exists "Admin can update media" on storage.objects;
create policy "Admin can update media"
on storage.objects for update
to authenticated
using (
  bucket_id = 'media'
  and (select auth.jwt() ->> 'email') = 'tegarmi839@gmail.com'
)
with check (
  bucket_id = 'media'
  and (select auth.jwt() ->> 'email') = 'tegarmi839@gmail.com'
);

drop policy if exists "Admin can delete media" on storage.objects;
create policy "Admin can delete media"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'media'
  and (select auth.jwt() ->> 'email') = 'tegarmi839@gmail.com'
);
