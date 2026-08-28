-- =================================================================
-- HAZEN E-COMMERCE DATABASE SCHEMA (SUPABASE / POSTGRESQL)
-- =================================================================

-- 1. Create Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image TEXT NOT NULL,
  featured BOOLEAN DEFAULT FALSE,
  product_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Products Table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  short_description TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL,
  sale_price NUMERIC,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  category TEXT NOT NULL,
  category_name TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC DEFAULT 5.0,
  review_count INTEGER DEFAULT 0,
  badge TEXT,
  featured BOOLEAN DEFAULT FALSE,
  flash_sale BOOLEAN DEFAULT FALSE,
  variants JSONB NOT NULL DEFAULT '[]'::jsonb,
  bundle_offers JSONB DEFAULT '[]'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  specifications JSONB DEFAULT '{}'::jsonb,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  customer_city TEXT,
  delivery_zone TEXT NOT NULL DEFAULT 'dhaka',
  delivery_fee NUMERIC NOT NULL DEFAULT 60,
  subtotal NUMERIC NOT NULL,
  discount NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'COD',
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  courier_name TEXT,
  tracking_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for instant phone number or order id tracking
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- 4. Create Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'primary',
  store_name TEXT NOT NULL DEFAULT 'Hazen',
  tagline TEXT,
  logo_url TEXT,
  hotline TEXT,
  whatsapp_number TEXT,
  support_email TEXT,
  announcement_bar_text TEXT,
  announcement_bar_active BOOLEAN DEFAULT TRUE,
  dhaka_delivery_fee NUMERIC DEFAULT 60,
  outside_dhaka_delivery_fee NUMERIC DEFAULT 120,
  suburbs_delivery_fee NUMERIC DEFAULT 100,
  free_shipping_threshold NUMERIC DEFAULT 2500,
  hero_banners JSONB DEFAULT '[]'::jsonb,
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords JSONB DEFAULT '[]'::jsonb,
  social_links JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public read policies (Customers can view products, categories, site settings)
CREATE POLICY "Public Read Categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public Read Products" ON products FOR SELECT USING (true);
CREATE POLICY "Public Read Settings" ON site_settings FOR SELECT USING (true);

-- Public order creation & lookup policies (No customer auth needed)
CREATE POLICY "Public Create Orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Lookup Orders" ON orders FOR SELECT USING (true);

-- Admin Full Access (authenticated users)
CREATE POLICY "Admin Full Categories" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Full Products" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Full Orders" ON orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Full Settings" ON site_settings FOR ALL USING (auth.role() = 'authenticated');
