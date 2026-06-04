-- Crea la tabella prodotti (se non esiste già)
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  price integer not null,
  category text not null check (category in ('fumetti', 'libri', 'videogiochi', 'oggetti')),
  condition text not null check (condition in ('nuovo', 'ottimo', 'buono', 'discreto')),
  stock integer not null default 1,
  images text[] not null default '{}',
  sold boolean not null default false,
  created_at timestamptz default now()
);

-- Abilita RLS
alter table products enable row level security;

-- Elimina le policy esistenti e ricreale
drop policy if exists "Chiunque può leggere i prodotti" on products;
drop policy if exists "Solo admin può modificare" on products;

create policy "Chiunque può leggere i prodotti"
  on products for select
  using (true);

create policy "Solo admin può modificare"
  on products for all
  using (auth.role() = 'service_role');

-- Crea storage bucket (se non esiste)
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict do nothing;

-- Elimina le policy storage esistenti e ricreale
drop policy if exists "Upload immagini pubblico" on storage.objects;
drop policy if exists "Lettura immagini pubblica" on storage.objects;

create policy "Upload immagini pubblico"
  on storage.objects for insert
  with check (bucket_id = 'products');

create policy "Lettura immagini pubblica"
  on storage.objects for select
  using (bucket_id = 'products');
