-- 005 — Notifications, preferences, push subscriptions
create table if not exists public.notifications (
  id                  uuid primary key default gen_random_uuid(),
  recipient_id        uuid not null references public.profiles(id) on delete cascade,
  type                text not null,
  title               text not null,
  body                text,
  related_order_id    uuid references public.orders(id),
  related_entity_type text,
  related_entity_id   uuid,
  priority            notification_priority not null default 'normal',
  is_read             boolean not null default false,
  read_at             timestamptz,
  push_status         text default 'pending',
  push_attempted_at   timestamptz,
  created_at          timestamptz not null default now()
);
create index idx_notif_recipient on public.notifications(recipient_id, created_at desc);
create index idx_notif_unread on public.notifications(recipient_id) where is_read = false;

create table if not exists public.notification_preferences (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  category   text not null,
  enabled    boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (user_id, category)
);

create table if not exists public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  endpoint   text not null,
  p256dh     text,
  auth       text,
  created_at timestamptz not null default now()
);
create index idx_push_user on public.push_subscriptions(user_id);
