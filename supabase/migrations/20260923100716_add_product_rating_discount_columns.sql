/*
# Add rating, original_price, discount columns to products

## Overview
Adds three new columns to the products table to support ratings, original prices,
and discount display. Also backfills existing 12 products with sensible defaults.

## Modified Tables

### products
- `rating` (numeric(2,1), default 4.0) — product rating from 1.0 to 5.0
- `original_price` (numeric(10,2), nullable) — original price before discount
- `discount` (int, default 0) — discount percentage (0-90)

## Notes
- Existing products get rating=4.0, original_price=NULL, discount=0
- The `price` column remains the current/selling price
- original_price is nullable because not all products have discounts
*/

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS rating numeric(2,1) DEFAULT 4.0,
  ADD COLUMN IF NOT EXISTS original_price numeric(10,2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS discount int DEFAULT 0;

-- Backfill existing products with a rating if they don't have one
UPDATE products SET rating = 4.0 WHERE rating IS NULL;
UPDATE products SET discount = 0 WHERE discount IS NULL;
