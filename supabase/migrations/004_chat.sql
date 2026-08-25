-- 004 — Conversations and messages
create table if not exists public.conversations (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null unique references public.orders(id) on delete cascade,
  customer_id   uuid not null references public.profiles(id) on delete cascade,
  vendor_id     uuid not null references public.profiles(id) on delete cascade,
  status        conversation_status not null default 'open',
  opened_at     timestamptz not null default now(),
  closed_at     timestamptz,
  post_delivery_expiry timestamptz
);
create index idx_conv_customer on public.conversations(customer_id);
create index idx_conv_vendor on public.conversations(vendor_id);

create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id       uuid not null references public.profiles(id) on delete cascade,
  content         text not null check (length(trim(content)) > 0),
  sent_at         timestamptz not null default now(),
  read_at         timestamptz
);
create index idx_messages_conv on public.messages(conversation_id, sent_at);
create index idx_messages_sender on public.messages(sender_id);
