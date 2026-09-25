import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  detectSessionInUrl: true,
  },
});

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price: number | null;
  image_url: string;
  category: string;
  stock: number;
  featured: boolean;
  rating: number;
  discount: number;
  created_at: string;
};

export type WishlistItem = {
  id: string;
  product_id: string;
  user_id: string;
  created_at: string;
  product: Product;
};

export type Review = {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  created_at: string;
};

export type Coupon = {
  id: string;
  code: string;
  discount_type: 'percentage' | 'flat';
  discount_value: number;
  min_order: number;
  active: boolean;
  created_at: string;
};

export type FlashSale = {
  id: string;
  title: string;
  discount_percentage: number;
  starts_at: string;
  ends_at: string;
  active: boolean;
  created_at: string;
};

export type Order = {
  id: string;
  user_id: string;
  status: string;
  total: number;
  shipping_address: string;
  shipping_city: string;
  shipping_zip: string;
  shipping_country: string;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  price: number;
  quantity: number;
};

export type OrderWithItems = Order & {
  order_items: OrderItem[];
};

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
};
