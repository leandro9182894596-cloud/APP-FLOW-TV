-- Criação das tabelas para Flow TV
-- Execute esse SQL no painel do Supabase (SQL Editor)

-- Tabela profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (id)
);

-- Tabela dns_connections
CREATE TABLE IF NOT EXISTS public.dns_connections (
    id UUID NOT NULL DEFAULT GEN_RANDOM_UUID(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    dns_url TEXT NOT NULL,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (id)
);

-- Tabela favorites
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID NOT NULL DEFAULT GEN_RANDOM_UUID(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL CHECK (content_type IN ('live', 'movie', 'series')),
    content_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    poster TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE(user_id, content_type, content_id)
);

-- Tabela watch_history
CREATE TABLE IF NOT EXISTS public.watch_history (
    id UUID NOT NULL DEFAULT GEN_RANDOM_UUID(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL CHECK (content_type IN ('movie', 'series')),
    content_id INTEGER NOT NULL,
    episode_id TEXT,
    title TEXT NOT NULL,
    poster TEXT,
    position INTEGER NOT NULL DEFAULT 0,
    duration INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE(user_id, content_type, content_id)
);

-- Tabela settings
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID NOT NULL DEFAULT GEN_RANDOM_UUID(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    logo TEXT,
    background TEXT,
    banners JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE(user_id)
);

-- Tabela iptv_cache (opcional)
CREATE TABLE IF NOT EXISTS public.iptv_cache (
    id UUID NOT NULL DEFAULT GEN_RANDOM_UUID(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL CHECK (content_type IN ('live', 'movie', 'series')),
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE(user_id, content_type)
);

-- Políticas de Segurança (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dns_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iptv_cache ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Usuários podem ver o próprio perfil"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar o próprio perfil"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Políticas para dns_connections
CREATE POLICY "Usuários podem ver suas próprias conexões DNS"
    ON public.dns_connections FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias conexões DNS"
    ON public.dns_connections FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias conexões DNS"
    ON public.dns_connections FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias conexões DNS"
    ON public.dns_connections FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para favorites
CREATE POLICY "Usuários podem ver seus próprios favoritos"
    ON public.favorites FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios favoritos"
    ON public.favorites FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios favoritos"
    ON public.favorites FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para watch_history
CREATE POLICY "Usuários podem ver seu próprio histórico"
    ON public.watch_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seu próprio histórico"
    ON public.watch_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seu próprio histórico"
    ON public.watch_history FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seu próprio histórico"
    ON public.watch_history FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para settings
CREATE POLICY "Usuários podem ver suas próprias configurações"
    ON public.settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias configurações"
    ON public.settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias configurações"
    ON public.settings FOR UPDATE
    USING (auth.uid() = user_id);

-- Políticas para iptv_cache
CREATE POLICY "Usuários podem ver seu próprio cache"
    ON public.iptv_cache FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seu próprio cache"
    ON public.iptv_cache FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seu próprio cache"
    ON public.iptv_cache FOR UPDATE
    USING (auth.uid() = user_id);

-- Trigger para criar perfil automaticamente ao criar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
