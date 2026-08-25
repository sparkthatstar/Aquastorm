-- 020 — Auto-deduct points & release inventory on cancellation
create or replace function public.handle_order_cancellation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$ declare
  v_rate integer;
  v_revoke_amount integer;
  v_qty_to_release integer;
begin
  if new.status in ('cancelled', 'failed') and old.status not in ('cancelled', 'failed') then
    
    if new.vendor_id is not null then
      
      if new.points_awarded = false then
        v_qty_to_release := new.quantity_ordered - coalesce(new.quantity_delivered, 0);
        
        if v_qty_to_release > 0 then
          update public.inventory
            set available = available + v_qty_to_release,
                reserved = reserved - v_qty_to_release
            where vendor_id = new.vendor_id;
          
          insert into public.inventory_transactions (inventory_id, tx_type, quantity, reference_order_id, performed_by, note)
          select id, 'release', v_qty_to_release, new.id, auth.uid(), 'Order cancelled/failed'
          from public.inventory where vendor_id = new.vendor_id;
        end if;
      end if;

      if new.points_awarded = true then
        select coalesce(
          (select rate from public.vendor_point_rates where vendor_id = new.vendor_id),
          (select (value->>'value')::integer from public.system_settings where key = 'default_points_per_bag'),
          50
        ) into v_rate;
        
        v_revoke_amount := coalesce(new.quantity_delivered, 0) * v_rate;
        
        if v_revoke_amount > 0 then
          insert into public.aqua_points_ledger (vendor_id, entry_type, amount, reference_type, reference_id, created_by, note)
          values (
            new.vendor_id, 'reversal', -v_revoke_amount, 'order', new.id, 
            coalesce(auth.uid(), (select id from public.profiles where role = 'owner' limit 1)), 
            format('Reversal: Order %s cancelled/failed', new.id)
          );
          
          perform public.create_notification(
            new.vendor_id, 'points_reversed', 'Points Reversed', 
            format('%s Aqua Points were reversed due to order %s being cancelled.', v_revoke_amount, new.id),
            new.id, 'order', new.id, 'high'
          );
        end if;
      end if;
    end if;
  end if;
  
  return new;
end$$;

drop trigger if exists trg_order_cancellation on public.orders;
create trigger trg_order_cancellation
  after update of status on public.orders
  for each row execute function public.handle_order_cancellation();
