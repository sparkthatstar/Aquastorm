-- 006 — Ratings, moderation, complaints
create table if not exists public.ratings (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  rater_id    uuid not null references public.profiles(id) on delete cascade,
  ratee_id    uuid not null references public.profiles(id) on delete cascade,
  direction   rating_direction not null,
  stars       integer not null check (stars >= 1 and stars <= 5),
  reason      text,
  created_at  timestamptz not null default now(),
  unique(order_id, direction),
  constraint chk_no_self_rating check (rater_id <> ratee_id)
);
create index idx_ratings_ratee on public.ratings(ratee_id);
create index idx_ratings_rater on public.ratings(rater_id);

create table if not exists public.rating_moderation (
  id           uuid primary key default gen_random_uuid(),
  rating_id    uuid not null references public.ratings(id) on delete cascade,
  moderated_by uuid not null references public.profiles(id),
  action       text not null,
  note         text,
  created_at   timestamptz not null default now()
);

create table if not exists public.complaints (
  id                  uuid primary key default gen_random_uuid(),
  customer_id         uuid not null references public.profiles(id) on delete cascade,
  order_id            uuid references public.orders(id) on delete set null,
  category            text not null,
  description         text not null,
  status              text not null default 'open',
  assigned_manager_id uuid references public.profiles(id),
  resolution          text,
  created_at          timestamptz not null default now(),
  resolved_at         timestamptz
);
create index idx_complaints_customer on public.complaints(customer_id);
create index idx_complaints_status on public.complaints(status);
