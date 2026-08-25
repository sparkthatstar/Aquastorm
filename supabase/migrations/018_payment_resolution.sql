-- 018 — Payment Resolution RPC (Owner Only)
create or replace function public.resolve_suspicious_payment(
  p_payment_id uuid, p_is_fraud boolean, p_resolution_note text
) returns boolean
language plpgsql security definer set search_path = public as $$ declare
  v_order_id uuid;
begin
  if not public.is_owner() then
    raise exception 'Only the owner can resolve suspicious payments';
  end if;

  select order_id into v_order_id from public.payments where id = p_payment_id;

  update public.payments
    set status = case when p_is_fraud then 'resolved_fraud' else 'resolved_clean' end,
        resolved_by = auth.uid(),
        resolved_at = now(),
        resolution_note = p_resolution_note
    where id = p_payment_id;

  update public.suspicious_flags
    set status = 'resolved',
        resolved_by = auth.uid(),
        resolved_at = now(),
        resolution_note = p_resolution_note
    where payment_id = p_payment_id;

  if not p_is_fraud then
    update public.payment_receipts
      set is_protected = false
      where payment_id = p_payment_id;
  end if;

  insert into public.audit_logs (actor_id, action, target_type, target_id, metadata)
  values (
    auth.uid(), 'payment_flag', 'payment', p_payment_id,
    jsonb_build_object('is_fraud', p_is_fraud, 'note', p_resolution_note, 'order_id', v_order_id)
  );

  return true;
end$$;
