-- 008 — Audit logs, system settings, manager action requests, suspicious flags, staff invites
create table if not exists public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references public.profiles(id) on delete set null,
  action      audit_action not null,
  target_type text,
  target_id   uuid,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index idx_audit_actor on public.audit_logs(actor_id);
create index idx_audit_action on public.audit_logs(action);
create index idx_audit_created on public.audit_logs(created_at desc);

create table if not exists public.system_settings (
  key         text primary key,
  value       jsonb not null,
  description text,
  updated_by  uuid references public.profiles(id),
  updated_at  timestamptz not null default now()
);

create table if not exists public.manager_action_requests (
  id            uuid primary key default gen_random_uuid(),
  manager_id    uuid not null references public.profiles(id) on delete restrict,
  action_type   manager_action_type not null,
  target_id     uuid,
  status        manager_action_status not null default 'pending',
  owner_id      uuid references public.profiles(id),
  decided_at    timestamptz,
  metadata      jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);
create index idx_mar_status on public.manager_action_requests(status);
create index idx_mar_manager on public.manager_action_requests(manager_id);

create table if not exists public.suspicious_flags (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  flagged_by  uuid not null references public.profiles(id),
  reason      text not null,
  status      text not null default 'open',
  resolved_by uuid references public.profiles(id),
  resolved_at timestamptz,
  resolution_note text,
  created_at  timestamptz not null default now()
);
create index idx_susp_order on public.suspicious_flags(order_id);
create index idx_susp_status on public.suspicious_flags(status);

create table if not exists public.staff_invites (
  email       text primary key,
  role        user_role not null,
  invited_by  uuid not null references public.profiles(id),
  created_at  timestamptz not null default now(),
  used_at     timestamptz
);
