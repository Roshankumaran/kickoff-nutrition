-- PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC NOT NULL,
    mrp NUMERIC,
    stock INTEGER DEFAULT 0,
    image TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    rating NUMERIC DEFAULT 4.5,
    reviews INTEGER DEFAULT 0,
    badge TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    total_amount NUMERIC NOT NULL,
    payment_id TEXT,
    status TEXT DEFAULT 'pending',
    products JSONB, -- For backward compatibility or detailed snapshot
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ORDER_ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    quantity INTEGER NOT NULL,
    price NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ENABLE RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- POLICIES FOR PRODUCTS
-- Public can read active products
CREATE POLICY "Public can read active products" ON public.products
    FOR SELECT USING (is_active = true);

-- Admins can do everything
-- Replace the emails with your admin emails
CREATE POLICY "Admins can manage products" ON public.products
    FOR ALL USING (
        auth.jwt() ->> 'email' IN (
            'asraffmohamed33@gmail.com',
            'roshanrapido@gmail.com',
            'kickoffnutrition244@gmail.com'
        )
    );

-- POLICIES FOR ORDERS
-- Users can read their own orders
CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders" ON public.orders
    FOR SELECT USING (
        auth.jwt() ->> 'email' IN (
            'asraffmohamed33@gmail.com',
            'roshanrapido@gmail.com',
            'kickoffnutrition244@gmail.com'
        )
    );

-- STORAGE BUCKET
-- Note: You must create the 'products' bucket manually in the Supabase Dashboard
-- and set its policy to public read and admin write.
