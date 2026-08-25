-- 014 — Add aggregate rating to customers & update rating RPC
alter table public.customers
  add column if not exists aggregate_rating numeric(3,2) not null default 0,
  add column if not exists rating_count integer not null default 0;

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
  else raise exception 'You are not a participant in this order'; end if;

  select role into v_ratee_role from public.profiles where id = v_ratee_id;
  if v_ratee_id = v_rater_id then raise exception 'Cannot rate yourself'; end if;
  if exists (select 1 from public.ratings where order_id = p_order_id and direction = v_actual_direction) then
    raise exception 'Rating already submitted for this order';
  end if;

  select coalesce((select (value->>'value')::integer from public.system_settings where key = 'low_rating_threshold'), 2) into v_low_threshold;
  if p_stars <= v_low_threshold and (p_reason is null or trim(p_reason) = '') then
    raise exception 'A reason is required for low ratings';
  end if;

  insert into public.ratings (order_id, rater_id, ratee_id, direction, stars, reason)
  values (p_order_id, v_rater_id, v_ratee_id, v_actual_direction, p_stars, p_reason) returning id into v_rating_id;

  if v_actual_direction = 'customer_to_vendor' and v_ratee_role = 'vendor' then
    select avg(stars)::numeric(3,2), count(*)::integer into v_new_aggregate, v_new_count
    from public.ratings where ratee_id = v_ratee_id and direction = 'customer_to_vendor';
    update public.vendors set aggregate_rating = v_new_aggregate, rating_count = v_new_count where profile_id = v_ratee_id;
    if p_stars <= v_low_threshold then
      perform public.create_notification((select id from public.profiles where role = 'manager' limit 1), 'low_rating', 'Low Rating Received', format('A vendor received a %s-star rating.', p_stars), p_order_id, 'rating', v_rating_id, 'high');
    end if;
  elsif v_actual_direction = 'vendor_to_customer' and v_ratee_role = 'customer' then
    select avg(stars)::numeric(3,2), count(*)::integer into v_new_aggregate, v_new_count
    from public.ratings where ratee_id = v_ratee_id and direction = 'vendor_to_customer';
    update public.customers set aggregate_rating = v_new_aggregate, rating_count = v_new_count where profile_id = v_ratee_id;
  end if;

  return v_rating_id;
end$$;
