-- 013 — Customer order creation RPC
create or replace function public.create_customer_order(
  p_quantity integer, p_payment_method payment_method, p_comment text default null
) returns uuid
language plpgsql security definer set search_path = public as $$ declare
  v_order_id uuid;
  v_unit_price numeric(10,2);
  v_total numeric(12,2);
  v_visibility order_visibility_mode;
begin
  if p_quantity <= 0 then raise exception 'Quantity must be greater than zero'; end if;

  select coalesce((select (value->>'value')::numeric from public.system_settings where key = 'unit_price_per_bag'), 450.00) into v_unit_price;
  v_total := v_unit_price * p_quantity;

  select coalesce((select (value->>'value')::order_visibility_mode from public.system_settings where key = 'default_order_visibility'), 'manager_and_all_vendors'::order_visibility_mode) into v_visibility;

  insert into public.orders (customer_id, quantity_ordered, payment_method, comment, status, visibility_mode, unit_price, total_amount)
  values (auth.uid(), p_quantity, p_payment_method, p_comment, 'placed', v_visibility, v_unit_price, v_total) returning id into v_order_id;

  insert into public.payments (order_id, method, amount, status) values (v_order_id, p_payment_method, v_total, 'pending');

  perform public.create_notification(
    (select id from public.profiles where role = 'manager' limit 1),
    'new_order', 'New Order Placed', format('A customer just ordered %s bags of water.', p_quantity), v_order_id, 'order', v_order_id, 'high'
  );

  return v_order_id;
end$$;
