import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase, type Product } from '@/lib/supabase';

type RecentlyViewedContextValue = {
  recentIds: string[];
  addRecentlyViewed: (productId: string) => void;
  recentProducts: Product[];
};

const RecentlyViewedContext = createContext<RecentlyViewedContextValue | undefined>(undefined);
const STORAGE_KEY = 'lunora-recently-viewed';
const MAX_ITEMS = 8;

export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setRecentIds(JSON.parse(stored));
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  const addRecentlyViewed = (productId: string) => {
    setRecentIds((prev) => {
      const filtered = prev.filter((id) => id !== productId);
      const updated = [productId, ...filtered].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    if (recentIds.length === 0) {
      setRecentProducts([]);
      return;
    }
    supabase
      .from('products')
      .select('*')
      .in('id', recentIds)
      .then(({ data }) => {
        const products = data ?? [];
        const sorted = recentIds
          .map((id) => products.find((p) => p.id === id))
          .filter((p): p is Product => p !== undefined);
        setRecentProducts(sorted);
      });
  }, [recentIds]);

  return (
    <RecentlyViewedContext.Provider
      value={{ recentIds, addRecentlyViewed, recentProducts }}
    >
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const ctx = useContext(RecentlyViewedContext);
  if (!ctx) throw new Error('useRecentlyViewed must be used within RecentlyViewedProvider');
  return ctx;
}
