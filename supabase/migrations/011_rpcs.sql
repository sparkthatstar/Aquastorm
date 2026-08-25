-- 011 — SECURITY DEFINER RPCs
create or replace function public.create_notification(
  p_recipient_id uuid, p_type text, p_title text, p_body text default null,
  p_related_order_id uuid default null, p_related_entity_type text default null,
  p_related_entity_id uuid default null, p_priority notification_priority default 'normal'
) returns uuid
language plpgsql security definer set search_path = public as $$ declare v_id uuid;
begin
  insert into public.notifications (recipient_id, type, title, body, related_order_id, related_entity_type, related_entity_id, priority)
  values (p_recipient_id, p_type, p_title, p_body, p_related_order_id, p_related_entity_type, p_related_entity_id, p_priority)
  returning id into v_id;
  return v_id;
end$$;

create or replace function public.accept_order(p_order_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$ declare
  v_order record;
  v_vendor_exists boolean := false;
  v_user_role user_role;
begin
  select role into v_user_role from public.profiles where id = auth.uid();
  if v_user_role not in ('vendor', 'manager') then
    raise exception 'Only vendors and managers can accept orders';
  end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'Order not found'; end if;
  if v_order.status not in ('placed', 'available') then return false; end if;

  if v_order.visibility_mode = 'manager_and_selected_vendors' then
    select exists(select 1 from public.order_eligible_vendors oev where oev.order_id = p_order_id and oev.vendor_id = auth.uid()) into v_vendor_exists;
    if not v_vendor_exists and v_user_role = 'vendor' then raise exception 'You are not eligible for this order'; end if;
  elsif v_order.visibility_mode = 'manager_only' and v_user_role = 'vendor' then
    raise exception 'This order is manager-only';
  end if;

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

  perform public.create_notification(v_order.customer_id, 'order_accepted', 'Order Accepted', 'Your order has been accepted by a vendor and is being prepared.', p_order_id, 'order', p_order_id);
  return true;
end$$;

create or replace function public.award_points_for_delivery(p_order_id uuid, p_quantity_delivered integer)
returns integer language plpgsql security definer set search_path = public as $$ declare
  v_order record;
  v_rate integer;
  v_points integer;
  v_ledger_id uuid;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'Order not found'; end if;
  if v_order.points_awarded then raise exception 'Points already awarded for this order'; end if;
  if p_quantity_delivered > v_order.quantity_ordered then raise exception 'Delivered quantity cannot exceed ordered quantity'; end if;
  if p_quantity_delivered < 0 then raise exception 'Delivered quantity cannot be negative'; end if;

  select coalesce(
    (select rate from public.vendor_point_rates where vendor_id = v_order.vendor_id),
    (select (value->>'value')::integer from public.system_settings where key = 'default_points_per_bag'),
    50
  ) into v_rate;

  v_points := p_quantity_delivered * v_rate;

  insert into public.aqua_points_ledger (vendor_id, entry_type, amount, reference_type, reference_id, created_by, note)
  values (v_order.vendor_id, 'earned', v_points, 'order', p_order_id, auth.uid(), format('Awarded %s points for %s bags delivered (order %s)', v_points, p_quantity_delivered, p_order_id))
  returning id into v_ledger_id;

  update public.orders
    set quantity_delivered = p_quantity_delivered, points_awarded = true, status = 'delivered', delivered_at = now()
    where id = p_order_id;

  update public.inventory
    set reserved = reserved - p_quantity_delivered, delivered = delivered + p_quantity_delivered
    where vendor_id = v_order.vendor_id;

  insert into public.inventory_transactions (inventory_id, tx_type, quantity, reference_order_id, performed_by, note)
  select i.id, 'delivery', p_quantity_delivered, p_order_id, auth.uid(), 'Delivery completed'
  from public.inventory i where i.vendor_id = v_order.vendor_id;

  perform public.create_notification(v_order.vendor_id, 'points_earned', 'Aqua Points Earned', format('You earned %s Aqua Points for delivering %s bags.', v_points, p_quantity_delivered), p_order_id, 'order', p_order_id);
  return v_points;
end$$;

create or replace function public.request_cashout(p_points integer, p_is_urgent boolean)
returns uuid language plpgsql security definer set search_path = public as $$ declare
  v_balance integer;
  v_total_deduct integer;
  v_ledger_id uuid;
  v_cashout_id uuid;
  v_urgent_fee integer := 0;
begin
  if p_points < 1000 then raise exception 'Minimum cash-out is 1000 Aqua Points'; end if;
  if p_is_urgent then v_urgent_fee := 5; end if;
  v_total_deduct := p_points + v_urgent_fee;

  select coalesce(sum(amount), 0) into v_balance from public.aqua_points_ledger where vendor_id = auth.uid();
  if v_balance < v_total_deduct then raise exception 'Insufficient points. Balance: %, Required: %', v_balance, v_total_deduct; end if;

  insert into public.aqua_points_ledger (vendor_id, entry_type, amount, reference_type, reference_id, created_by, note)
  values (auth.uid(), 'cashout', -p_points, 'cashout', null, auth.uid(), format('Cash-out request: %s points', p_points))
  returning id into v_ledger_id;

  if p_is_urgent then
    insert into public.aqua_points_ledger (vendor_id, entry_type, amount, reference_type, reference_id, created_by, note)
    values (auth.uid(), 'urgent_fee', -5, 'cashout', v_ledger_id, auth.uid(), 'Urgent processing fee');
  end if;

  insert into public.cashout_requests (vendor_id, points_amount, urgent_fee, is_urgent, status, ledger_entry_id)
  values (auth.uid(), p_points, v_urgent_fee, p_is_urgent, 'processing', v_ledger_id)
  returning id into v_cashout_id;

  update public.aqua_points_ledger set reference_id = v_cashout_id where id = v_ledger_id;

  perform public.create_notification((select id from public.profiles where role = 'manager' limit 1), 'cashout_request', 'Cash-Out Request', format('Vendor requested cash-out of %s points%s.', p_points, case when p_is_urgent then ' [URGENT]' else '' end), null, 'cashout', v_cashout_id, case when p_is_urgent then 'urgent' else 'high' end);
  perform public.create_notification((select id from public.profiles where role = 'owner' limit 1), 'cashout_request', 'Cash-Out Request', format('Vendor requested cash-out of %s points%s.', p_points, case when p_is_urgent then ' [URGENT]' else '' end), null, 'cashout', v_cashout_id, case when p_is_urgent then 'urgent' else 'high' end);
  return v_cashout_id;
end$$;

create or replace function public.validate_cashout(p_cashout_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$ begin
  if not public.is_staff() then raise exception 'Only staff can validate cash-outs'; end if;
  update public.cashout_requests set status = 'manager_validated', manager_validated_by = auth.uid(), manager_validated_at = now() where id = p_cashout_id and status = 'processing';
  if not found then raise exception 'Cash-out not found or not in processing state'; end if;
  perform public.create_notification((select id from public.profiles where role = 'owner' limit 1), 'cashout_validated', 'Cash-Out Validated', 'A cash-out request has been validated by a manager and is ready for payment.', null, 'cashout', p_cashout_id, 'high');
  return true;
end$$;

create or replace function public.pay_cashout(p_cashout_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$ declare v_cashout record;
begin
  if not public.is_owner() then raise exception 'Only the owner can mark cash-outs as paid'; end if;
  select * into v_cashout from public.cashout_requests where id = p_cashout_id for update;
  if not found then raise exception 'Cash-out not found'; end if;
  if v_cashout.status = 'paid' then raise exception 'Cash-out already paid'; end if;
  if v_cashout.status = 'rejected' then raise exception 'Cash-out was rejected'; end if;

  update public.cashout_requests set status = 'paid', owner_paid_by = auth.uid(), owner_paid_at = now() where id = p_cashout_id;
  insert into public.audit_logs (actor_id, action, target_type, target_id, metadata) values (auth.uid(), 'cashout_pay', 'cashout', p_cashout_id, jsonb_build_object('points', v_cashout.points_amount, 'vendor_id', v_cashout.vendor_id));
  perform public.create_notification(v_cashout.vendor_id, 'cashout_paid', 'Cash-Out Paid', format('Your cash-out of %s points has been paid.', v_cashout.points_amount), null, 'cashout', p_cashout_id, 'high');
  return true;
end$$;

create or replace function public.reject_cashout(p_cashout_id uuid, p_reason text)
returns boolean language plpgsql security definer set search_path = public as $$ declare v_cashout record;
begin
  if not public.is_owner() then raise exception 'Only the owner can reject cash-outs'; end if;
  select * into v_cashout from public.cashout_requests where id = p_cashout_id for update;
  if not found then raise exception 'Cash-out not found'; end if;
  if v_cashout.status = 'paid' then raise exception 'Cannot reject a paid cash-out'; end if;
  if v_cashout.status = 'rejected' then raise exception 'Cash-out already rejected'; end if;

  insert into public.aqua_points_ledger (vendor_id, entry_type, amount, reference_type, reference_id, created_by, note)
  values (v_cashout.vendor_id, 'refund', v_cashout.points_amount + v_cashout.urgent_fee, 'cashout', p_cashout_id, auth.uid(), format('Refund: cash-out %s rejected (%s)', p_cashout_id, p_reason));

  update public.cashout_requests set status = 'rejected', rejected_by = auth.uid(), rejected_at = now(), rejection_reason = p_reason where id = p_cashout_id;
  insert into public.audit_logs (actor_id, action, target_type, target_id, metadata) values (auth.uid(), 'cashout_reject', 'cashout', p_cashout_id, jsonb_build_object('reason', p_reason, 'vendor_id', v_cashout.vendor_id));
  perform public.create_notification(v_cashout.vendor_id, 'cashout_rejected', 'Cash-Out Rejected', format('Your cash-out request was rejected. Reason: %s. Points have been refunded.', p_reason), null, 'cashout', p_cashout_id, 'high');
  return true;
end$$;

create or replace function public.submit_rating(p_order_id uuid, p_stars integer, p_reason text default null, p_direction rating_direction default null)
returns uuid language plpgsql security definer set search_path = public as $$ declare
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
  else raise exception 'You are not a participant in this order'; end if;

  select role into v_ratee_role from public.profiles where id = v_ratee_id;
  if v_ratee_id = v_rater_id then raise exception 'Cannot rate yourself'; end if;
  if exists (select 1 from public.ratings where order_id = p_order_id and direction = v_actual_direction) then raise exception 'Rating already submitted for this order'; end if;

  select coalesce((select (value->>'value')::integer from public.system_settings where key = 'low_rating_threshold'), 2) into v_low_threshold;
  if p_stars <= v_low_threshold and (p_reason is null or trim(p_reason) = '') then raise exception 'A reason is required for low ratings'; end if;

  insert into public.ratings (order_id, rater_id, ratee_id, direction, stars, reason)
  values (p_order_id, v_rater_id, v_ratee_id, v_actual_direction, p_stars, p_reason) returning id into v_rating_id;

  if v_actual_direction = 'customer_to_vendor' and v_ratee_role = 'vendor' then
    select avg(stars)::numeric(3,2), count(*)::integer into v_new_aggregate, v_new_count from public.ratings where ratee_id = v_ratee_id and direction = 'customer_to_vendor';
    update public.vendors set aggregate_rating = v_new_aggregate, rating_count = v_new_count where profile_id = v_ratee_id;
    if p_stars <= v_low_threshold then
      perform public.create_notification((select id from public.profiles where role = 'manager' limit 1), 'low_rating', 'Low Rating Received', format('A vendor received a %s-star rating. Reason: %s', p_stars, p_reason), p_order_id, 'rating', v_rating_id, 'high');
    end if;
  elsif v_actual_direction = 'vendor_to_customer' and v_ratee_role = 'customer' then
    select avg(stars)::numeric(3,2), count(*)::integer into v_new_aggregate, v_new_count from public.ratings where ratee_id = v_ratee_id and direction = 'vendor_to_customer';
    update public.customers set aggregate_rating = v_new_aggregate, rating_count = v_new_count where profile_id = v_ratee_id;
  end if;

  return v_rating_id;
end$$;

create or replace function public.flag_suspicious_payment(p_order_id uuid, p_reason text)
returns uuid language plpgsql security definer set search_path = public as $$ declare
  v_flag_id uuid;
  v_payment_id uuid;
begin
  if not exists (select 1 from public.orders where id = p_order_id and vendor_id = auth.uid()) then
    raise exception 'Only the assigned vendor can flag this order';
  end if;

  update public.payments
    set status = 'flagged', flagged_by = auth.uid(), flagged_at = now(), flag_reason = p_reason
    where order_id = p_order_id returning id into v_payment_id;

  update public.payment_receipts set is_protected = true where payment_id = v_payment_id;

  insert into public.suspicious_flags (order_id, flagged_by, reason, status)
  values (p_order_id, auth.uid(), p_reason, 'open') returning id into v_flag_id;

  insert into public.audit_logs (actor_id, action, target_type, target_id, metadata)
  values (auth.uid(), 'payment_flag', 'order', p_order_id, jsonb_build_object('reason', p_reason));

  perform public.create_notification((select id from public.profiles where role = 'owner' limit 1), 'suspicious_payment', 'Suspicious Payment Flagged', format('A vendor flagged a suspicious payment for order %s. Reason: %s', p_order_id, p_reason), p_order_id, 'flag', v_flag_id, 'urgent');
  return v_flag_id;
end$$;

create or replace function public.provision_staff_account(p_email text, p_full_name text, p_phone text default null, p_role user_role, p_metadata jsonb default '{}'::jsonb)
returns boolean language plpgsql security definer set search_path = public as $$ begin
  if p_role not in ('vendor', 'manager', 'owner') then raise exception 'Cannot provision customer accounts via this function'; end if;
  insert into public.staff_invites (email, role, invited_by) values (p_email, p_role, null) on conflict (email) do update set role = excluded.role, created_at = now(), used_at = null;
  return true;
end$$;

create or replace function public.request_vendor_removal(p_vendor_id uuid, p_reason text)
returns uuid language plpgsql security definer set search_path = public as $$ declare v_id uuid;
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'manager') then
    raise exception 'Only managers can request vendor removal';
  end if;

  insert into public.manager_action_requests (manager_id, action_type, target_id, status, metadata)
  values (auth.uid(), 'vendor_removal', p_vendor_id, 'pending', jsonb_build_object('reason', p_reason)) returning id into v_id;

  perform public.create_notification((select id from public.profiles where role = 'owner' limit 1), 'vendor_removal_request', 'Vendor Removal Request', format('A manager has requested removal of vendor %s.', p_vendor_id), null, 'action_request', v_id, 'high');
  insert into public.audit_logs (actor_id, action, target_type, target_id, metadata) values (auth.uid(), 'vendor_remove_request', 'vendor', p_vendor_id, jsonb_build_object('reason', p_reason));
  return v_id;
end$$;

create or replace function public.write_audit_log(p_action audit_action, p_target_type text default null, p_target_id uuid default null, p_metadata jsonb default '{}'::jsonb)
returns uuid language plpgsql security definer set search_path = public as $$ declare v_id uuid;
begin
  insert into public.audit_logs (actor_id, action, target_type, target_id, metadata) values (auth.uid(), p_action, p_target_type, p_target_id, p_metadata) returning id into v_id;
  return v_id;
end$$;

create or replace function public.get_vendor_points_balance(p_vendor_id uuid default null)
returns integer language plpgsql security definer set search_path = public as $$ declare
  v_vendor uuid := coalesce(p_vendor_id, auth.uid());
  v_balance integer;
begin
  if p_vendor_id is not null and p_vendor_id <> auth.uid() and not public.is_staff() then raise exception 'Not authorized'; end if;
  select coalesce(sum(amount), 0) into v_balance from public.aqua_points_ledger where vendor_id = v_vendor;
  return v_balance;
end$$;
