import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase, type Product } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

type WishlistContextValue = {
  wishlistIds: string[];
  toggleWishlist: (productId: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
  loading: boolean;
};

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setWishlistIds([]);
      setLoading(false);
      return;
    }

    supabase
      .from('wishlists')
      .select('product_id')
      .eq('user_id', user.id)
      .then(({ data }) => {
        setWishlistIds((data ?? []).map((w) => w.product_id));
        setLoading(false);
      });
  }, [user]);

  const toggleWishlist = async (productId: string) => {
    if (!user) return;
    const isAdded = wishlistIds.includes(productId);
    if (isAdded) {
      await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
      setWishlistIds((prev) => prev.filter((id) => id !== productId));
    } else {
      await supabase
        .from('wishlists')
        .insert({ user_id: user.id, product_id: productId });
      setWishlistIds((prev) => [...prev, productId]);
    }
  };

  const isWishlisted = (productId: string) => wishlistIds.includes(productId);

  return (
    <WishlistContext.Provider
      value={{ wishlistIds, toggleWishlist, isWishlisted, loading }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}

export async function fetchWishlistProducts(userId: string): Promise<Product[]> {
  const { data } = await supabase
    .from('wishlists')
    .select('product:products(*)')
    .eq('user_id', userId);
  return (data ?? []).map((w) => w.product as unknown as Product);
}
