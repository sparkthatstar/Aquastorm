-- 007 — Aqua Points ledger, rates, cash-outs
create table if not exists public.aqua_points_ledger (
  id             uuid primary key default gen_random_uuid(),
  vendor_id      uuid not null references public.profiles(id) on delete restrict,
  entry_type     ledger_entry_type not null,
  amount         integer not null,
  reference_type text,
  reference_id   uuid,
  created_at     timestamptz not null default now(),
  created_by     uuid not null references public.profiles(id),
  note           text,
  constraint chk_amount_nonzero check (amount <> 0)
);
create index idx_ledger_vendor on public.aqua_points_ledger(vendor_id, created_at desc);
create index idx_ledger_ref on public.aqua_points_ledger(reference_type, reference_id);

create table if not exists public.vendor_point_rates (
  vendor_id uuid primary key references public.profiles(id) on delete cascade,
  rate      integer not null check (rate >= 0),
  set_by    uuid not null references public.profiles(id),
  set_at    timestamptz not null default now()
);

create table if not exists public.cashout_requests (
  id                    uuid primary key default gen_random_uuid(),
  vendor_id             uuid not null references public.profiles(id) on delete restrict,
  points_amount         integer not null check (points_amount >= 1000),
  urgent_fee            integer not null default 0,
  is_urgent             boolean not null default false,
  status                cashout_status not null default 'processing',
  requested_at          timestamptz not null default now(),
  manager_validated_by  uuid references public.profiles(id),
  manager_validated_at  timestamptz,
  owner_paid_by         uuid references public.profiles(id),
  owner_paid_at         timestamptz,
  rejected_by           uuid references public.profiles(id),
  rejected_at           timestamptz,
  rejection_reason      text,
  ledger_entry_id       uuid references public.aqua_points_ledger(id),
  constraint chk_urgent_fee check (
    (is_urgent = true and urgent_fee = 5) or
    (is_urgent = false and urgent_fee = 0)
  )
);
create index idx_cashout_vendor on public.cashout_requests(vendor_id, requested_at desc);
create index idx_cashout_status on public.cashout_requests(status);
