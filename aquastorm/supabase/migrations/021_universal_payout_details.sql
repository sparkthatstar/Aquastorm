-- 021 — Universal Payout Details on Profiles
alter table public.profiles
  add column if not exists bank_name text,
  add column if not exists account_name text,
  add column if not exists account_number text;

drop function if exists public.change_user_role(uuid, user_role);

create or replace function public.change_user_role(
  p_user_id uuid,
  p_new_role user_role,
  p_bank_name text default null,
  p_account_name text default null,
  p_account_number text default null
) returns boolean
language plpgsql security definer set search_path = public as $$ declare
  v_current_role user_role;
begin
  if not public.is_owner() then
    raise exception 'Only the owner can change user roles';
  end if;

  if p_new_role = 'owner' then
    raise exception 'Cannot promote to Owner via this function';
  end if;

  select role into v_current_role from public.profiles where id = p_user_id;
  if not found then
    raise exception 'User not found';
  end if;

  if v_current_role = p_new_role then
    raise exception 'User is already this role';
  end if;

  update public.profiles 
  set role = p_new_role,
      bank_name = coalesce(p_bank_name, bank_name),
      account_name = coalesce(p_account_name, account_name),
      account_number = coalesce(p_account_number, account_number)
  where id = p_user_id;

  if v_current_role = 'customer' then
    delete from public.customers where profile_id = p_user_id;
  elsif v_current_role = 'vendor' then
    delete from public.vendors where profile_id = p_user_id;
  elsif v_current_role = 'manager' then
    delete from public.managers where profile_id = p_user_id;
  end if;

  if p_new_role = 'customer' then
    insert into public.customers (profile_id, room_number, hostel_block, phone_confirmed)
    values (p_user_id, 'UNKNOWN', null, true) on conflict do nothing;
  elsif p_new_role = 'vendor' then
    insert into public.vendors (profile_id, is_approved, approved_by, approved_at)
    values (p_user_id, true, auth.uid(), now()) on conflict do nothing;
    insert into public.inventory (vendor_id, available, reserved, delivered, damaged)
    values (p_user_id, 0, 0, 0, 0) on conflict do nothing;
  elsif p_new_role = 'manager' then
    insert into public.managers (profile_id, permissions)
    values (p_user_id, '{}'::jsonb) on conflict do nothing;
  end if;

  insert into public.audit_logs (actor_id, action, target_type, target_id, metadata)
  values (auth.uid(), 'role_change', 'profile', p_user_id,
    jsonb_build_object('old_role', v_current_role, 'new_role', p_new_role, 'bank_details_updated', p_bank_name is not null));

  return true;
end$$;
