-- Adiciona suporte a múltiplos banners
ALTER TABLE public.app_config ADD COLUMN IF NOT EXISTS banners jsonb NOT NULL DEFAULT '[]'::jsonb;