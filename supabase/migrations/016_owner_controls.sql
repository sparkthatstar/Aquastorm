-- 016 — Owner Controls & Vendor Removal RPCs
create or replace function public.update_order_visibility(
  p_order_id uuid, p_mode order_visibility_mode, p_vendor_ids uuid[] default null
) returns boolean
language plpgsql security definer set search_path = public as $$ begin
  if not public.is_owner() then
    raise exception 'Only the Owner can change order visibility';
  end if;

  update public.orders set visibility_mode = p_mode where id = p_order_id;

  if p_mode = 'manager_and_selected_vendors' and p_vendor_ids is not null then
    delete from public.order_eligible_vendors where order_id = p_order_id;
    insert into public.order_eligible_vendors (order_id, vendor_id)
    select p_order_id, unnest(p_vendor_ids);
  end if;

  return true;
end$$;

create or replace function public.resolve_vendor_removal(
  p_request_id uuid, p_approve boolean
) returns boolean
language plpgsql security definer set search_path = public as $$ declare
  v_request record;
begin
  if not public.is_owner() then
    raise exception 'Only the Owner can approve vendor removals';
  end if;

  select * into v_request from public.manager_action_requests where id = p_request_id and status = 'pending';
  if not found then
    raise exception 'Request not found or already resolved';
  end if;

  update public.manager_action_requests
    set status = case when p_approve then 'approved' else 'rejected' end,
        owner_id = auth.uid(),
        decided_at = now()
    where id = p_request_id;

  if p_approve then
    update public.profiles set is_active = false where id = v_request.target_id;
    update public.vendors set is_approved = false where profile_id = v_request.target_id;
  end if;

  insert into public.audit_logs (actor_id, action, target_type, target_id, metadata)
  values (auth.uid(), 'vendor_remove', 'profile', v_request.target_id, 
    jsonb_build_object('approved', p_approve, 'manager_requester', v_request.manager_id));

  return true;
end$$;
