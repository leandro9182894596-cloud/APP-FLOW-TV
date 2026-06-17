-- Adiciona campos de pagamento ao app_config
ALTER TABLE public.app_config ADD COLUMN IF NOT EXISTS payment_info jsonb;
ALTER TABLE public.app_config ADD COLUMN IF NOT EXISTS payment_status text;
