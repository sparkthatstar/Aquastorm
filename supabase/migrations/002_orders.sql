-- 002 — Orders, status history, visibility, payments, receipts
create table if not exists public.orders (
  id                 uuid primary key default gen_random_uuid(),
  customer_id        uuid not null references public.profiles(id) on delete restrict,
  vendor_id          uuid references public.profiles(id) on delete restrict,
  quantity_ordered   integer not null check (quantity_ordered > 0),
  quantity_delivered integer,
  comment            text,
  payment_method     payment_method not null,
  status             order_status not null default 'placed',
  visibility_mode    order_visibility_mode not null default 'manager_only',
  unit_price         numeric(10,2) not null default 0,
  total_amount       numeric(12,2) not null default 0,
  points_awarded     boolean not null default false,
  created_at         timestamptz not null default now(),
  accepted_at        timestamptz,
  delivered_at       timestamptz,
  cancelled_at       timestamptz,
  constraint chk_qty_delivered check (quantity_delivered is null or quantity_delivered >= 0),
  constraint chk_qty_delivered_le_ordered check (quantity_delivered is null or quantity_delivered <= quantity_ordered)
);

create index idx_orders_customer on public.orders(customer_id);
create index idx_orders_vendor on public.orders(vendor_id);
create index idx_orders_status on public.orders(status);
create index idx_orders_created on public.orders(created_at desc);

create table if not exists public.order_status_history (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders(id) on delete cascade,
  status     order_status not null,
  changed_by uuid references public.profiles(id),
  changed_at timestamptz not null default now(),
  note       text
);
create index idx_osh_order on public.order_status_history(order_id);

create table if not exists public.order_eligible_vendors (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  vendor_id   uuid not null references public.profiles(id) on delete cascade,
  snapshot_at timestamptz not null default now(),
  unique(order_id, vendor_id)
);
create index idx_oev_order on public.order_eligible_vendors(order_id);
create index idx_oev_vendor on public.order_eligible_vendors(vendor_id);

create table if not exists public.payments (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null unique references public.orders(id) on delete restrict,
  method        payment_method not null,
  amount        numeric(12,2) not null,
  status        payment_status not null default 'pending',
  confirmed_by  uuid references public.profiles(id),
  confirmed_at  timestamptz,
  flagged_by    uuid references public.profiles(id),
  flagged_at    timestamptz,
  flag_reason   text,
  resolved_by   uuid references public.profiles(id),
  resolved_at   timestamptz,
  resolution_note text,
  created_at    timestamptz not null default now()
);
create index idx_payments_order on public.payments(order_id);
create index idx_payments_status on public.payments(status);

create table if not exists public.payment_receipts (
  id                uuid primary key default gen_random_uuid(),
  payment_id        uuid not null references public.payments(id) on delete restrict,
  storage_path      text not null,
  original_filename text,
  content_type      text,
  file_size_bytes   integer,
  uploaded_by       uuid not null references public.profiles(id),
  uploaded_at       timestamptz not null default now(),
  reviewed          boolean not null default false,
  reviewed_by       uuid references public.profiles(id),
  reviewed_at       timestamptz,
  is_protected      boolean not null default false,
  retention_expires_at timestamptz,
  deleted_at        timestamptz,
  deleted_by        uuid references public.profiles(id)
);
create index idx_receipts_payment on public.payment_receipts(payment_id);
create index idx_receipts_protected on public.payment_receipts(is_protected);
