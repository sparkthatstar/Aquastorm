-- 012 — Seed: system settings + default config
insert into public.system_settings (key, value, description) values
  ('default_points_per_bag', '{"value": 50}'::jsonb, 'Default Aqua Points earned per bag delivered'),
  ('low_rating_threshold', '{"value": 2}'::jsonb, 'Stars at or below this require a reason'),
  ('receipt_retention_days', '{"value": 90}'::jsonb, 'Days to retain receipt images after review'),
  ('post_delivery_chat_hours', '{"value": 72}'::jsonb, 'Hours chat remains active after delivery'),
  ('cashout_minimum_points', '{"value": 1000}'::jsonb, 'Minimum points required for cash-out'),
  ('urgent_cashout_fee', '{"value": 5}'::jsonb, 'Aqua Points deducted for urgent cash-out'),
  ('unit_price_per_bag', '{"value": 450}'::jsonb, 'Default price per bag in Naira'),
  ('default_order_visibility', '{"value": "manager_and_all_vendors"}'::jsonb, 'Default order visibility mode')
on conflict (key) do nothing;
