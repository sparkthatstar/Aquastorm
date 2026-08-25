-- 019 — Vending Managers, Receipt Deletion, Rating Fixes
create or replace function public.accept_order(p_order_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$ declare
  v_order record;
  v_user_role user_role;
begin
  select role into v_user_role from public.profiles where id = auth.uid();
  if v_user_role not in ('vendor', 'manager') then
    raise exception 'Only vendors and managers can accept orders';
  end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'Order not found'; end if;
  if v_order.status not in ('placed', 'available') then return false; end if;

  update public.orders
    set vendor_id = auth.uid(), status = 'accepted', accepted_at = now()
    where id = p_order_id and vendor_id is null and status in ('placed', 'available');

  if not found then return false; end if;

  insert into public.conversations (order_id, customer_id, vendor_id, status)
  values (p_order_id, v_order.customer_id, auth.uid(), 'open') on conflict (order_id) do nothing;

  insert into public.payments (order_id, method, amount, status)
  values (p_order_id, v_order.payment_method, v_order.total_amount, 'pending') on conflict (order_id) do nothing;

  if v_user_role = 'vendor' then
    insert into public.inventory_transactions (inventory_id, tx_type, quantity, reference_order_id, performed_by, note)
    select i.id, 'reserve', v_order.quantity_ordered, p_order_id, auth.uid(), 'Order accepted'
    from public.inventory i where i.vendor_id = auth.uid();

    update public.inventory
      set reserved = reserved + v_order.quantity_ordered, available = available - v_order.quantity_ordered
      where vendor_id = auth.uid();
  end if;

  perform public.create_notification(v_order.customer_id, 'order_accepted', 'Order Accepted', 'Your order has been accepted.', p_order_id, 'order', p_order_id);
  return true;
end$$;

create or replace function public.submit_rating(
  p_order_id uuid, p_stars integer, p_reason text default null, p_direction rating_direction default null
) returns uuid
language plpgsql security definer set search_path = public as $$ declare
  v_order record;
  v_rater_id uuid := auth.uid();
  v_ratee_id uuid;
  v_actual_direction rating_direction;
  v_low_threshold integer;
  v_rating_id uuid;
  v_new_aggregate numeric(3,2);
  v_new_count integer;
  v_ratee_role user_role;
begin
  select * into v_order from public.orders where id = p_order_id;
  if not found then raise exception 'Order not found'; end if;

  if v_order.customer_id = v_rater_id then
    v_actual_direction := 'customer_to_vendor'; v_ratee_id := v_order.vendor_id;
  elsif v_order.vendor_id = v_rater_id then
    v_actual_direction := 'vendor_to_customer'; v_ratee_id := v_order.customer_id;
  else raise exception 'Not a participant'; end if;

  select role into v_ratee_role from public.profiles where id = v_ratee_id;
  if v_ratee_id = v_rater_id then raise exception 'Cannot rate yourself'; end if;
  if exists (select 1 from public.ratings where order_id = p_order_id and direction = v_actual_direction) then
    raise exception 'Already rated';
  end if;

  select coalesce((select (value->>'value')::integer from public.system_settings where key = 'low_rating_threshold'), 2) into v_low_threshold;
  if p_stars <= v_low_threshold and (p_reason is null or trim(p_reason) = '') then
    raise exception 'Reason required for low ratings';
  end if;

  insert into public.ratings (order_id, rater_id, ratee_id, direction, stars, reason)
  values (p_order_id, v_rater_id, v_ratee_id, v_actual_direction, p_stars, p_reason) returning id into v_rating_id;

  if v_actual_direction = 'customer_to_vendor' and v_ratee_role = 'vendor' then
    select avg(stars)::numeric(3,2), count(*)::integer into v_new_aggregate, v_new_count
    from public.ratings where ratee_id = v_ratee_id and direction = 'customer_to_vendor';
    update public.vendors set aggregate_rating = v_new_aggregate, rating_count = v_new_count where profile_id = v_ratee_id;
    if p_stars <= v_low_threshold then
      perform public.create_notification((select id from public.profiles where role = 'manager' limit 1), 'low_rating', 'Low Rating', format('Vendor got %s stars', p_stars), p_order_id, 'rating', v_rating_id, 'high');
    end if;
  elsif v_actual_direction = 'vendor_to_customer' and v_ratee_role = 'customer' then
    select avg(stars)::numeric(3,2), count(*)::integer into v_new_aggregate, v_new_count
    from public.ratings where ratee_id = v_ratee_id and direction = 'vendor_to_customer';
    update public.customers set aggregate_rating = v_new_aggregate, rating_count = v_new_count where profile_id = v_ratee_id;
  end if;

  return v_rating_id;
end$$;

create or replace function public.delete_receipt(p_receipt_id uuid)
returns boolean
language plpgsql security definer set search_path = public as $$ begin
  if not public.is_owner() then
    raise exception 'Only owner can force delete receipts';
  end if;

  delete from public.payment_receipts where id = p_receipt_id;
  return true;
end$$;
