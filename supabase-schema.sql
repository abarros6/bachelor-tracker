-- Run this in the Supabase SQL editor

-- Participants
create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_admin boolean not null default false
);

-- Tables (cost splits)
create table if not exists tables (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  total_cost numeric,
  created_by uuid references participants(id),
  created_at timestamptz not null default now()
);

-- Payments
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  table_id uuid references tables(id) on delete cascade,
  participant_id uuid references participants(id),
  has_paid boolean not null default false,
  paid_at timestamptz,
  notes text
);

-- Itinerary items
create table if not exists itinerary_items (
  id uuid primary key default gen_random_uuid(),
  day date not null,
  time text not null,
  title text not null,
  description text,
  emoji text,
  sort_order integer not null default 0
);

-- Suggestions
create table if not exists suggestions (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references participants(id),
  content text not null,
  created_at timestamptz not null default now(),
  is_resolved boolean not null default false
);

-- Disable RLS for all tables (private party app)
alter table participants disable row level security;
alter table tables disable row level security;
alter table payments disable row level security;
alter table itinerary_items disable row level security;
alter table suggestions disable row level security;

-- Enable realtime for payments
alter publication supabase_realtime add table payments;
