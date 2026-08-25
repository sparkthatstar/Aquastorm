-- 017 — Universal Role Transition RPC (Owner Only)
drop function if exists public.change_user_role(uuid, user_role);

create or replace function public.change_user_role(
  p_user_id uuid, p_new_role user_role
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

  update public.profiles set role = p_new_role where id = p_user_id;

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
    jsonb_build_object('old_role', v_current_role, 'new_role', p_new_role));

  return true;
end$$;
