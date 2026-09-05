-- =================================================================
-- HAZEN E-COMMERCE DATABASE SCHEMA (SUPABASE / POSTGRESQL)
-- Safe & Idempotent: Can be run multiple times without data loss
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
  sku TEXT,
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
  is_unlimited_stock BOOLEAN DEFAULT FALSE,
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

-- Safe Column Upgrades for Existing Products Table
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_unlimited_stock BOOLEAN DEFAULT FALSE;

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
  consignment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safe Column Upgrades for Existing Orders Table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS courier_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS consignment_id TEXT;

-- Indexes for Fast Lookups
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

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
  steadfast_enabled BOOLEAN DEFAULT TRUE,
  steadfast_api_key TEXT,
  steadfast_secret_key TEXT,
  pathao_enabled BOOLEAN DEFAULT FALSE,
  pathao_client_id TEXT,
  pathao_client_secret TEXT,
  pathao_username TEXT,
  pathao_password TEXT,
  pathao_store_id TEXT,
  pathao_sandbox BOOLEAN DEFAULT FALSE,
  facebook_pixel_id TEXT,
  facebook_access_token TEXT,
  blacklisted_phones JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safe Column Upgrades for Existing Site Settings Table
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS steadfast_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS steadfast_api_key TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS steadfast_secret_key TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS pathao_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS pathao_client_id TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS pathao_client_secret TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS pathao_username TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS pathao_password TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS pathao_store_id TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS pathao_sandbox BOOLEAN DEFAULT FALSE;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS facebook_pixel_id TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS facebook_access_token TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS blacklisted_phones JSONB DEFAULT '[]'::jsonb;

-- 5. Create Media / Storage Table
CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  size_bytes BIGINT DEFAULT 0,
  mime_type TEXT DEFAULT 'image/webp',
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Row Level Security (RLS) & Access Policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Public read policies (Customers view store catalog)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Read Categories') THEN
    CREATE POLICY "Public Read Categories" ON categories FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Read Products') THEN
    CREATE POLICY "Public Read Products" ON products FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Read Settings') THEN
    CREATE POLICY "Public Read Settings" ON site_settings FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Read Media') THEN
    CREATE POLICY "Public Read Media" ON media FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Create Orders') THEN
    CREATE POLICY "Public Create Orders" ON orders FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Lookup Orders') THEN
    CREATE POLICY "Public Lookup Orders" ON orders FOR SELECT USING (true);
  END IF;
END $$;
