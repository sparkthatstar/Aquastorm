-- 009 — Triggers: new-user profile creation, role enforcement
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$ declare
  v_role user_role;
  v_full_name text;
  v_phone text;
begin
  v_role := coalesce((new.app_metadata->>'role')::user_role, 'customer'::user_role);
  v_full_name := coalesce(new.user_metadata->>'full_name', new.email);
  v_phone := new.user_metadata->>'phone';

  insert into public.profiles (id, email, full_name, phone, role)
  values (new.id, new.email, v_full_name, v_phone, v_role);

  if v_role = 'customer' then
    insert into public.customers (profile_id, room_number, hostel_block, phone_confirmed)
    values (new.id, coalesce(new.user_metadata->>'room_number', 'UNKNOWN'), new.user_metadata->>'hostel_block', true);
  elsif v_role = 'vendor' then
    insert into public.vendors (profile_id, is_approved) values (new.id, false);
    insert into public.inventory (vendor_id, available, reserved, delivered, damaged) values (new.id, 0, 0, 0, 0);
  elsif v_role = 'manager' then
    insert into public.managers (profile_id, permissions) values (new.id, '{}'::jsonb);
  elsif v_role = 'owner' then
    insert into public.owners (profile_id) values (new.id);
  end if;

  update public.staff_invites set used_at = now() where email = new.email and used_at is null;
  return new;
end$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$ begin
  if new.role <> old.role then
    if current_user = 'authenticated' and not exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner'
    ) then
      raise exception 'Role escalation is not permitted';
    end if;
  end if;
  return new;
end$$;

drop trigger if exists trg_prevent_role_escalation on public.profiles;
create trigger trg_prevent_role_escalation
  before update of role on public.profiles
  for each row execute function public.prevent_role_escalation();

create or replace function public.record_order_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$ begin
  if new.status <> old.status then
    insert into public.order_status_history (order_id, status, changed_by)
    values (new.id, new.status, auth.uid());
  end if;
  return new;
end$$;

drop trigger if exists trg_order_status_change on public.orders;
create trigger trg_order_status_change
  after update of status on public.orders
  for each row execute function public.record_order_status_change();
