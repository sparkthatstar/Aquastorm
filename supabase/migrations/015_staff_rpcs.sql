-- 015 — Staff RPCs: Promote Vendor & Update Visibility
create or replace function public.update_order_visibility(
  p_order_id uuid, p_mode order_visibility_mode, p_vendor_ids uuid[] default null
) returns boolean
language plpgsql security definer set search_path = public as $$ begin
  if not public.is_staff() then
    raise exception 'Only staff can update visibility';
  end if;

  update public.orders set visibility_mode = p_mode where id = p_order_id;

  if p_mode = 'manager_and_selected_vendors' and p_vendor_ids is not null then
    delete from public.order_eligible_vendors where order_id = p_order_id;
    insert into public.order_eligible_vendors (order_id, vendor_id)
    select p_order_id, unnest(p_vendor_ids);
  end if;

  return true;
end$$;

create or replace function public.adjust_inventory(
  p_vendor_id uuid, p_quantity integer, p_note text
) returns boolean
language plpgsql security definer set search_path = public as $$ begin
  if not public.is_staff() then
    raise exception 'Only staff can adjust inventory';
  end if;

  update public.inventory
    set available = available + p_quantity
    where vendor_id = p_vendor_id;

  insert into public.inventory_transactions (inventory_id, tx_type, quantity, performed_by, note)
  select id, 'adjustment', p_quantity, auth.uid(), p_note
  from public.inventory where vendor_id = p_vendor_id;

  return true;
end$$;
