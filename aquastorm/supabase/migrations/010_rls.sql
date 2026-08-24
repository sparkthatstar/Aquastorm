-- 010 — Row Level Security: enable + policies
create or replace function public.current_user_role()
returns user_role language sql stable security definer set search_path = public as $$   select role from public.profiles where id = auth.uid();
 $$;

create or replace function public.is_owner()
returns boolean language sql stable security definer set search_path = public as $$   select exists (select 1 from public.profiles where id = auth.uid() and role = 'owner');
 $$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$   select exists (select 1 from public.profiles where id = auth.uid() and role in ('manager', 'owner'));
 $$;

alter table public.profiles enable row level security;
create policy "profiles_self_read" on public.profiles for select using (id = auth.uid());
create policy "profiles_self_update_nonrole" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles_staff_read" on public.profiles for select using (public.is_staff());
create policy "profiles_owner_all" on public.profiles for all using (public.is_owner()) with check (public.is_owner());

alter table public.customers enable row level security;
create policy "customers_self_read" on public.customers for select using (profile_id = auth.uid());
create policy "customers_self_insert" on public.customers for insert with check (profile_id = auth.uid());
create policy "customers_self_update" on public.customers for update using (profile_id = auth.uid());
create policy "customers_staff_read" on public.customers for select using (public.is_staff());
create policy "customers_vendor_read_assigned" on public.customers for select using (
  exists (select 1 from public.orders o where o.customer_id = customers.profile_id and o.vendor_id = auth.uid())
);

alter table public.vendors enable row level security;
create policy "vendors_self_read" on public.vendors for select using (profile_id = auth.uid());
create policy "vendors_self_update_nonbank" on public.vendors for update using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy "vendors_staff_read" on public.vendors for select using (public.is_staff());
create policy "vendors_bank_owner_only" on public.vendors for select using (public.is_owner() or profile_id = auth.uid());

alter table public.managers enable row level security;
create policy "managers_self_read" on public.managers for select using (profile_id = auth.uid());
create policy "managers_owner_all" on public.managers for all using (public.is_owner()) with check (public.is_owner());

alter table public.owners enable row level security;
create policy "owners_self_read" on public.owners for select using (profile_id = auth.uid());
create policy "owners_owner_all" on public.owners for all using (public.is_owner());

alter table public.orders enable row level security;
create policy "orders_customer_read_own" on public.orders for select using (customer_id = auth.uid());
create policy "orders_customer_insert_own" on public.orders for insert with check (customer_id = auth.uid());
create policy "orders_vendor_read_assigned_or_eligible" on public.orders for select using (
  vendor_id = auth.uid() or
  (exists (select 1 from public.order_eligible_vendors oev where oev.order_id = orders.id and oev.vendor_id = auth.uid()) and orders.visibility_mode = 'manager_and_selected_vendors') or
  (orders.visibility_mode = 'manager_and_all_vendors' and exists (select 1 from public.vendors v where v.profile_id = auth.uid() and v.is_approved = true))
);
create policy "orders_vendor_update_status" on public.orders for update using (vendor_id = auth.uid()) with check (vendor_id = auth.uid());
create policy "orders_staff_all" on public.orders for select using (public.is_staff());
create policy "orders_staff_update" on public.orders for update using (public.is_staff());

alter table public.order_status_history enable row level security;
create policy "osh_participants_read" on public.order_status_history for select using (
  exists (select 1 from public.orders o where o.id = order_status_history.order_id and (o.customer_id = auth.uid() or o.vendor_id = auth.uid() or public.is_staff()))
);
create policy "osh_insert_via_trigger" on public.order_status_history for insert with check (true);

alter table public.order_eligible_vendors enable row level security;
create policy "oev_vendor_read_own" on public.order_eligible_vendors for select using (vendor_id = auth.uid());
create policy "oev_staff_all" on public.order_eligible_vendors for select using (public.is_staff());
create policy "oev_staff_insert" on public.order_eligible_vendors for insert with check (public.is_staff());

alter table public.payments enable row level security;
create policy "payments_customer_read_own" on public.payments for select using (exists (select 1 from public.orders o where o.id = payments.order_id and o.customer_id = auth.uid()));
create policy "payments_vendor_read_assigned" on public.payments for select using (exists (select 1 from public.orders o where o.id = payments.order_id and o.vendor_id = auth.uid()));
create policy "payments_staff_read" on public.payments for select using (public.is_staff());
create policy "payments_vendor_update" on public.payments for update using (exists (select 1 from public.orders o where o.id = payments.order_id and o.vendor_id = auth.uid()));

alter table public.payment_receipts enable row level security;
create policy "receipts_customer_read_own" on public.payment_receipts for select using (uploaded_by = auth.uid());
create policy "receipts_vendor_read_assigned" on public.payment_receipts for select using (exists (select 1 from public.payments p join public.orders o on o.id = p.order_id where p.id = payment_receipts.payment_id and o.vendor_id = auth.uid()));
create policy "receipts_owner_read" on public.payment_receipts for select using (public.is_owner());
create policy "receipts_customer_insert_own" on public.payment_receipts for insert with check (uploaded_by = auth.uid());

alter table public.inventory enable row level security;
create policy "inventory_vendor_read_own" on public.inventory for select using (vendor_id = auth.uid());
create policy "inventory_staff_read" on public.inventory for select using (public.is_staff());
create policy "inventory_staff_update" on public.inventory for update using (public.is_staff());

alter table public.inventory_transactions enable row level security;
create policy "invtx_vendor_read_own" on public.inventory_transactions for select using (exists (select 1 from public.inventory i where i.id = inventory_transactions.inventory_id and i.vendor_id = auth.uid()));
create policy "invtx_staff_all" on public.inventory_transactions for select using (public.is_staff());

alter table public.conversations enable row level security;
create policy "conv_participants_read" on public.conversations for select using (customer_id = auth.uid() or vendor_id = auth.uid() or public.is_owner());
create policy "conv_participants_update" on public.conversations for update using (customer_id = auth.uid() or vendor_id = auth.uid());

alter table public.messages enable row level security;
create policy "msg_participants_read" on public.messages for select using (exists (select 1 from public.conversations c where c.id = messages.conversation_id and (c.customer_id = auth.uid() or c.vendor_id = auth.uid() or public.is_owner())));
create policy "msg_participants_insert" on public.messages for insert with check (sender_id = auth.uid() and exists (select 1 from public.conversations c where c.id = messages.conversation_id and (c.customer_id = auth.uid() or c.vendor_id = auth.uid()) and c.status = 'open'));
create policy "msg_sender_update_read" on public.messages for update using (exists (select 1 from public.conversations c where c.id = messages.conversation_id and (c.customer_id = auth.uid() or c.vendor_id = auth.uid())));

alter table public.notifications enable row level security;
create policy "notif_self_read" on public.notifications for select using (recipient_id = auth.uid());
create policy "notif_self_update" on public.notifications for update using (recipient_id = auth.uid());

alter table public.notification_preferences enable row level security;
create policy "notifpref_self_read" on public.notification_preferences for select using (user_id = auth.uid());
create policy "notifpref_self_upsert" on public.notification_preferences for insert with check (user_id = auth.uid());
create policy "notifpref_self_update" on public.notification_preferences for update using (user_id = auth.uid());

alter table public.push_subscriptions enable row level security;
create policy "push_self_read" on public.push_subscriptions for select using (user_id = auth.uid());
create policy "push_self_insert" on public.push_subscriptions for insert with check (user_id = auth.uid());
create policy "push_self_delete" on public.push_subscriptions for delete using (user_id = auth.uid());

alter table public.ratings enable row level security;
create policy "ratings_self_read_as_rater" on public.ratings for select using (rater_id = auth.uid() or ratee_id = auth.uid() or public.is_staff());

alter table public.rating_moderation enable row level security;
create policy "ratingmod_staff_read" on public.rating_moderation for select using (public.is_staff());

alter table public.complaints enable row level security;
create policy "complaints_customer_read_own" on public.complaints for select using (customer_id = auth.uid());
create policy "complaints_customer_insert_own" on public.complaints for insert with check (customer_id = auth.uid());
create policy "complaints_staff_all" on public.complaints for select using (public.is_staff());
create policy "complaints_staff_update" on public.complaints for update using (public.is_staff());

alter table public.aqua_points_ledger enable row level security;
create policy "ledger_vendor_read_own" on public.aqua_points_ledger for select using (vendor_id = auth.uid());
create policy "ledger_staff_read" on public.aqua_points_ledger for select using (public.is_staff());

alter table public.vendor_point_rates enable row level security;
create policy "vpr_vendor_read_own" on public.vendor_point_rates for select using (vendor_id = auth.uid());
create policy "vpr_staff_read" on public.vendor_point_rates for select using (public.is_staff());
create policy "vpr_owner_all" on public.vendor_point_rates for all using (public.is_owner()) with check (public.is_owner());

alter table public.cashout_requests enable row level security;
create policy "cashout_vendor_read_own" on public.cashout_requests for select using (vendor_id = auth.uid());
create policy "cashout_staff_read" on public.cashout_requests for select using (public.is_staff());

alter table public.audit_logs enable row level security;
create policy "audit_owner_read" on public.audit_logs for select using (public.is_owner());

alter table public.system_settings enable row level security;
create policy "settings_staff_read" on public.system_settings for select using (public.is_staff());
create policy "settings_owner_write" on public.system_settings for all using (public.is_owner()) with check (public.is_owner());

alter table public.manager_action_requests enable row level security;
create policy "mar_manager_read_own" on public.manager_action_requests for select using (manager_id = auth.uid());
create policy "mar_owner_all" on public.manager_action_requests for all using (public.is_owner()) with check (public.is_owner());
create policy "mar_manager_insert" on public.manager_action_requests for insert with check (manager_id = auth.uid());

alter table public.suspicious_flags enable row level security;
create policy "susp_vendor_read_own" on public.suspicious_flags for select using (flagged_by = auth.uid() or public.is_staff());
create policy "susp_vendor_insert" on public.suspicious_flags for insert with check (flagged_by = auth.uid());
create policy "susp_staff_update" on public.suspicious_flags for update using (public.is_staff());

alter table public.staff_invites enable row level security;
create policy "invites_owner_all" on public.staff_invites for all using (public.is_owner()) with check (public.is_owner());
create policy "invites_manager_read" on public.staff_invites for select using (public.is_staff());
