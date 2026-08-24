-- 003 — Inventory
create table if not exists public.inventory (
  id          uuid primary key default gen_random_uuid(),
  vendor_id   uuid not null unique references public.profiles(id) on delete cascade,
  available   integer not null default 0 check (available >= 0),
  reserved    integer not null default 0 check (reserved >= 0),
  delivered   integer not null default 0 check (delivered >= 0),
  damaged     integer not null default 0 check (damaged >= 0),
  updated_at  timestamptz not null default now()
);
create index idx_inventory_vendor on public.inventory(vendor_id);

create table if not exists public.inventory_transactions (
  id              uuid primary key default gen_random_uuid(),
  inventory_id    uuid not null references public.inventory(id) on delete cascade,
  tx_type         inventory_tx_type not null,
  quantity        integer not null,
  reference_order_id uuid references public.orders(id),
  performed_by    uuid not null references public.profiles(id),
  performed_at    timestamptz not null default now(),
  note            text
);
create index idx_invtx_inventory on public.inventory_transactions(inventory_id);
create index idx_invtx_order on public.inventory_transactions(reference_order_id);
