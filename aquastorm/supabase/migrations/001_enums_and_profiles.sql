-- 001 — Enums, profiles, role enforcement
create type user_role as enum ('customer', 'vendor', 'manager', 'owner');
create type order_status as enum ('placed', 'available', 'accepted', 'preparing', 'out_for_delivery', 'delivered', 'cancelled', 'failed', 'payment_issue', 'disputed');
create type payment_method as enum ('cash', 'transfer');
create type payment_status as enum ('pending', 'confirmed', 'flagged', 'resolved_clean', 'resolved_fraud');
create type order_visibility_mode as enum ('manager_only', 'manager_and_all_vendors', 'manager_and_selected_vendors');
create type conversation_status as enum ('open', 'closed');
create type rating_direction as enum ('customer_to_vendor', 'vendor_to_customer');
create type ledger_entry_type as enum ('earned', 'cashout', 'urgent_fee', 'admin_adjustment', 'reversal', 'refund');
create type cashout_status as enum ('processing', 'manager_validated', 'rejected', 'paid');
create type inventory_tx_type as enum ('stock_in', 'reserve', 'release', 'delivery', 'damage_loss', 'adjustment');
create type notification_priority as enum ('normal', 'high', 'urgent');
create type audit_action as enum ('login', 'role_change', 'vendor_create', 'vendor_remove', 'vendor_remove_request', 'manager_action', 'inventory_adjust', 'rating_moderate', 'payment_confirm', 'payment_flag', 'receipt_delete', 'cashout_validate', 'cashout_pay', 'cashout_reject', 'config_change', 'owner_view_communication', 'owner_view_receipt', 'staff_provision', 'setting_change');
create type manager_action_type as enum ('vendor_removal', 'customer_management', 'setting_change', 'rating_moderation', 'other');
create type manager_action_status as enum ('pending', 'approved', 'rejected');

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text not null,
  phone       text,
  role        user_role not null default 'customer',
  is_active   boolean not null default true,
  bank_name   text,
  account_name text,
  account_number text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_profiles_role on public.profiles(role);
create index idx_profiles_email on public.profiles(email);

create table if not exists public.customers (
  profile_id     uuid primary key references public.profiles(id) on delete cascade,
  room_number    text not null,
  hostel_block   text,
  phone_confirmed boolean not null default false,
  aggregate_rating numeric(3,2) not null default 0,
  rating_count     integer not null default 0,
  created_at     timestamptz not null default now()
);

create table if not exists public.vendors (
  profile_id       uuid primary key references public.profiles(id) on delete cascade,
  is_approved      boolean not null default false,
  bank_name        text,
  account_number   text,
  account_name     text,
  aggregate_rating numeric(3,2) not null default 0,
  rating_count     integer not null default 0,
  created_at       timestamptz not null default now(),
  approved_at      timestamptz,
  approved_by      uuid references public.profiles(id)
);

create table if not exists public.managers (
  profile_id    uuid primary key references public.profiles(id) on delete cascade,
  permissions   jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);

create table if not exists public.owners (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$ begin
  new.updated_at = now();
  return new;
end$$;

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated
  before update on public.profiles
  for each row execute function public.set_updated_at();
