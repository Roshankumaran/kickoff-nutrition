-- Drop the old orders table if it exists to ensure the new schema is applied
DROP TABLE IF EXISTS public.orders CASCADE;

CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    user_email TEXT,
    customer_name TEXT,
    phone TEXT,

    address_line TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT,

    payment_method TEXT,
    payment_status TEXT,
    order_status TEXT,

    subtotal NUMERIC,
    shipping NUMERIC,
    total NUMERIC,

    items JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Authenticated users can insert their own orders
CREATE POLICY "Users can insert own orders" 
ON public.orders FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Authenticated users can view their own orders
CREATE POLICY "Users can view own orders" 
ON public.orders FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Admins can do everything
CREATE POLICY "Admins can manage orders" 
ON public.orders FOR ALL 
TO authenticated 
USING (
    auth.jwt() ->> 'email' IN (
        'asraffmohamed33@gmail.com',
        'roshanrapido@gmail.com',
        'kickoffnutrition244@gmail.com'
    )
);
