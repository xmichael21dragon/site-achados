-- ====================================================================
-- ACHADINHOS DA TERRA - SCHEMA COMPLETO PARA O SUPABASE (POSTGRESQL)
-- Portal de Ofertas e Cupons no modelo Promobit
-- ====================================================================

-- 1. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Ofertas (Deals)
CREATE TABLE IF NOT EXISTS public.deals (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    store TEXT NOT NULL,
    original_price NUMERIC(10, 2) NOT NULL,
    promo_price NUMERIC(10, 2) NOT NULL,
    discount_percentage INTEGER DEFAULT 0,
    payment_conditions TEXT DEFAULT 'em 1x no Pix ou Cartão',
    coupon_code TEXT,
    affiliate_url TEXT NOT NULL,
    raw_url TEXT,
    category TEXT DEFAULT 'Geral',
    temperature INTEGER DEFAULT 100,
    upvotes INTEGER DEFAULT 1,
    downvotes INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    is_expired BOOLEAN DEFAULT FALSE,
    is_hot BOOLEAN DEFAULT FALSE,
    free_shipping BOOLEAN DEFAULT FALSE,
    posted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source TEXT DEFAULT 'oracle-cloud',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Cupons de Desconto
CREATE TABLE IF NOT EXISTS public.coupons (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    store TEXT NOT NULL,
    code TEXT NOT NULL,
    discount_description TEXT NOT NULL,
    min_spend NUMERIC(10, 2) DEFAULT 0,
    category TEXT DEFAULT 'Todo o site',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    affiliate_url TEXT NOT NULL,
    verified BOOLEAN DEFAULT TRUE,
    rules TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de Comentários
CREATE TABLE IF NOT EXISTS public.comments (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    deal_id TEXT REFERENCES public.deals(id) ON DELETE CASCADE,
    author TEXT NOT NULL DEFAULT 'Membro Promobit',
    content TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabela de Alerta de Desejos (Wishlist)
CREATE TABLE IF NOT EXISTS public.wishlist_alerts (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    keyword TEXT NOT NULL,
    max_price NUMERIC(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabela de Logs do Robô da Oracle Cloud
CREATE TABLE IF NOT EXISTS public.bot_logs (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    type TEXT NOT NULL DEFAULT 'info',
    message TEXT NOT NULL,
    deal_title TEXT,
    store TEXT
);

-- Índices de Performance para Buscas Rápidas
CREATE INDEX IF NOT EXISTS idx_deals_posted_at ON public.deals (posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_deals_category ON public.deals (category);
CREATE INDEX IF NOT EXISTS idx_deals_store ON public.deals (store);
CREATE INDEX IF NOT EXISTS idx_deals_is_hot ON public.deals (is_hot);
CREATE INDEX IF NOT EXISTS idx_coupons_store ON public.coupons (store);

-- ====================================================================
-- POLÍTICAS DE SEGURANÇA (Row Level Security - RLS)
-- Permite leitura pública no Vercel e gravação segura via Anon/Service-Role
-- ====================================================================

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_logs ENABLE ROW LEVEL SECURITY;

-- Leitura pública para todos os visitantes do site
CREATE POLICY "Permitir leitura pública de ofertas" ON public.deals
    FOR SELECT USING (true);

CREATE POLICY "Permitir inserção e atualização de ofertas" ON public.deals
    FOR ALL USING (true);

CREATE POLICY "Permitir leitura pública de cupons" ON public.coupons
    FOR SELECT USING (true);

CREATE POLICY "Permitir inserção de cupons" ON public.coupons
    FOR ALL USING (true);

CREATE POLICY "Permitir leitura e escrita de comentários" ON public.comments
    FOR ALL USING (true);

CREATE POLICY "Permitir alertas de desejos" ON public.wishlist_alerts
    FOR ALL USING (true);

CREATE POLICY "Permitir logs do robô" ON public.bot_logs
    FOR ALL USING (true);

-- ====================================================================
-- SEEDS INICIAIS (OFERTAS POPULARES BRASIL)
-- ====================================================================

INSERT INTO public.deals (id, title, description, image_url, store, original_price, promo_price, discount_percentage, payment_conditions, coupon_code, affiliate_url, category, temperature, upvotes, downvotes, comments_count, is_hot, free_shipping, source)
VALUES
('d1', 'Apple iPhone 16 (128 GB) – Preto com Chip A18 e Câmera Fusion de 48 MP', 'Menor preço dos últimos 60 dias! Compatível com Apple Intelligence.', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80', 'Amazon', 7799.00, 5999.00, 23, 'em até 10x de R$ 599,90 sem juros ou R$ 5.399 no Pix', 'IPHONE100', 'https://www.amazon.com.br/dp/B0DGJ9B88Y?tag=achadinhos-20', 'Celulares', 342, 412, 12, 48, TRUE, TRUE, 'oracle-cloud'),
('d2', 'Console PlayStation 5 Slim Edição Digital com 2 Jogos (Returnal + Ratchet & Clank)', 'Acompanha 1TB SSD interno e controle DualSense sem fio.', 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&auto=format&fit=crop&q=80', 'Mercado Livre', 3999.90, 3249.00, 19, 'em 10x sem juros no cartão ou Pix', 'PLAY50', 'https://www.mercadolivre.com.br/p/MLB283749?matt_tool=achadinhos_ml', 'Games', 520, 560, 15, 89, TRUE, TRUE, 'oracle-cloud'),
('d3', 'Fritadeira Elétrica Sem Óleo Air Fryer Mondial Family 4 Litros Inox AFN-40-BI', 'Cesto quadrado antiaderente Duraflon, timer de 60 minutos.', 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&auto=format&fit=crop&q=80', 'Magalu', 349.90, 199.90, 43, 'em 1x no Pix ou boleto', 'MAGALU20', 'https://www.magazineluiza.com.br/air-fryer-mondial?parceiro=achadinhosdaterra', 'Casa e Cozinha', 288, 310, 8, 31, TRUE, TRUE, 'oracle-cloud')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.coupons (id, store, code, discount_description, min_spend, category, expires_at, affiliate_url, verified, rules)
VALUES
('c1', 'Mercado Livre', 'ACHADOS40', 'R$ 40 OFF em compras acima de R$ 200', 200, 'Todo o site', NOW() + INTERVAL '3 days', 'https://www.mercadolivre.com.br/cupons?matt_tool=achadinhos_ml', TRUE, 'Válido para produtos selecionados com selo Full.'),
('c2', 'Amazon', 'PRIME20', 'R$ 20 OFF na primeira compra no App Amazon', 100, 'Aplicativo', NOW() + INTERVAL '7 days', 'https://www.amazon.com.br/b?node=17877530011&tag=achadinhos-20', TRUE, 'Exclusivo para membros Prime.')
ON CONFLICT (id) DO NOTHING;
