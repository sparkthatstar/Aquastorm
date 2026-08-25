-- 022 — Manager Permissions & Dispatch Control
create or replace function public.has_permission(p_permission text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$   select
    case
      when exists (select 1 from public.profiles where id = auth.uid() and role = 'owner') then true
      when exists (
        select 1 from public.managers
        where profile_id = auth.uid()
        and (permissions ->> p_permission) = 'true'
      ) then true
      else false
    end;
 $$;

create or replace function public.update_order_visibility(
  p_order_id uuid,
  p_mode order_visibility_mode,
  p_vendor_ids uuid[] default null
) returns boolean
language plpgsql security definer set search_path = public as $$ begin
  if not public.has_permission('can_assign_orders') then
    raise exception 'You do not have permission to assign vendors';
  end if;

  update public.orders set visibility_mode = p_mode where id = p_order_id;

  if p_mode = 'manager_and_selected_vendors' and p_vendor_ids is not null then
    delete from public.order_eligible_vendors where order_id = p_order_id;
    insert into public.order_eligible_vendors (order_id, vendor_id)
    select p_order_id, unnest(p_vendor_ids);
  end if;

  return true;
end$$;

create or replace function public.update_manager_permissions(
  p_manager_id uuid,
  p_permissions jsonb
) returns boolean
language plpgsql security definer set search_path = public as $$ begin
  if not public.is_owner() then
    raise exception 'Only the owner can update permissions';
  end if;

  update public.managers
    set permissions = p_permissions
    where profile_id = p_manager_id;

  if not found then
    raise exception 'Manager not found';
  end if;

  insert into public.audit_logs (actor_id, action, target_type, target_id, metadata)
  values (auth.uid(), 'config_change', 'profile', p_manager_id, jsonb_build_object('permissions', p_permissions));

  return true;
end$$;
