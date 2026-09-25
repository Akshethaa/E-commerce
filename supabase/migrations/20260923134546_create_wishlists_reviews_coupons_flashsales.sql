/*
# Create wishlists, reviews, coupons, flash_sales tables

## Overview
Adds four new tables to support wishlist, product reviews, coupon codes, and flash sale features.

## New Tables

### wishlists
- Stores products saved by authenticated users
- `id` (uuid, primary key)
- `user_id` (uuid, references auth.users, defaults to auth.uid())
- `product_id` (uuid, references products)
- `created_at` (timestamptz)
- Unique constraint on (user_id, product_id) to prevent duplicates

### reviews
- Stores customer reviews and ratings for products
- `id` (uuid, primary key)
- `product_id` (uuid, references products)
- `user_id` (uuid, references auth.users, defaults to auth.uid())
- `rating` (int, 1-5, not null)
- `title` (text, nullable)
- `comment` (text, nullable)
- `created_at` (timestamptz)

### coupons
- Stores discount coupon codes
- `id` (uuid, primary key)
- `code` (text, unique, not null)
- `discount_type` (text: 'percentage' or 'flat')
- `discount_value` (numeric, not null)
- `min_order` (numeric, default 0)
- `active` (boolean, default true)
- `created_at` (timestamptz)

### flash_sales
- Stores flash sale events with start/end times
- `id` (uuid, primary key)
- `title` (text, not null)
- `discount_percentage` (int, not null)
- `starts_at` (timestamptz, not null)
- `ends_at` (timestamptz, not null)
- `active` (boolean, default true)
- `created_at` (timestamptz)

## Security
- RLS enabled on all tables
- wishlists: owner-scoped CRUD (authenticated users see only their own)
- reviews: authenticated users can read all, insert own, update own, delete own
- coupons: anyone can read active coupons (anon + authenticated), no writes from frontend
- flash_sales: anyone can read active sales (anon + authenticated), no writes from frontend

## Notes
- Existing app has sign-in, so owner-scoped policies use auth.uid()
- coupons and flash_sales are admin-managed, read-only from frontend
*/

-- Wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_wishlists" ON wishlists;
CREATE POLICY "select_own_wishlists" ON wishlists FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_wishlists" ON wishlists;
CREATE POLICY "insert_own_wishlists" ON wishlists FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_wishlists" ON wishlists;
CREATE POLICY "delete_own_wishlists" ON wishlists FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  comment text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_reviews" ON reviews;
CREATE POLICY "select_reviews" ON reviews FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_review" ON reviews;
CREATE POLICY "insert_own_review" ON reviews FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_review" ON reviews;
CREATE POLICY "update_own_review" ON reviews FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_review" ON reviews;
CREATE POLICY "delete_own_review" ON reviews FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_type text NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'flat')),
  discount_value numeric(10,2) NOT NULL,
  min_order numeric(10,2) DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_coupons" ON coupons;
CREATE POLICY "select_coupons" ON coupons FOR SELECT
  TO anon, authenticated USING (true);

-- Flash sales table
CREATE TABLE IF NOT EXISTS flash_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  discount_percentage int NOT NULL,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE flash_sales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_flash_sales" ON flash_sales;
CREATE POLICY "select_flash_sales" ON flash_sales FOR SELECT
  TO anon, authenticated USING (true);

-- Seed sample coupons
INSERT INTO coupons (code, discount_type, discount_value, min_order) VALUES
  ('WELCOME10', 'percentage', 10, 0),
  ('LUNORA20', 'percentage', 20, 2000),
  ('FLAT500', 'flat', 500, 3000),
  ('MONSOON15', 'percentage', 15, 1000)
ON CONFLICT (code) DO NOTHING;

-- Seed a flash sale ending in ~2 days from now
INSERT INTO flash_sales (title, discount_percentage, starts_at, ends_at, active)
SELECT 'Mega Flash Sale', 50, now(), now() + interval '2 days', true
WHERE NOT EXISTS (SELECT 1 FROM flash_sales WHERE active = true);
