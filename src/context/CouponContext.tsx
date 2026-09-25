import { createContext, useContext, useState, type ReactNode } from 'react';
import { supabase, type Coupon } from '@/lib/supabase';

type CouponContextValue = {
  appliedCoupon: Coupon | null;
  couponError: string | null;
  applyCoupon: (code: string, subtotal: number) => Promise<void>;
  removeCoupon: () => void;
  discountAmount: (subtotal: number) => number;
};

const CouponContext = createContext<CouponContextValue | undefined>(undefined);

export function CouponProvider({ children }: { children: ReactNode }) {
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const applyCoupon = async (code: string, subtotal: number) => {
    setCouponError(null);
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .eq('active', true)
      .maybeSingle();

    if (!data) {
      setAppliedCoupon(null);
      setCouponError('Invalid coupon code');
      return;
    }

    if (subtotal < Number(data.min_order)) {
      setAppliedCoupon(null);
      setCouponError(`Minimum order of ₹${Number(data.min_order).toLocaleString('en-IN')} required`);
      return;
    }

    setAppliedCoupon(data as Coupon);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  const discountAmount = (subtotal: number): number => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discount_type === 'percentage') {
      return (subtotal * Number(appliedCoupon.discount_value)) / 100;
    }
    return Number(appliedCoupon.discount_value);
  };

  return (
    <CouponContext.Provider
      value={{ appliedCoupon, couponError, applyCoupon, removeCoupon, discountAmount }}
    >
      {children}
    </CouponContext.Provider>
  );
}

export function useCoupon() {
  const ctx = useContext(CouponContext);
  if (!ctx) throw new Error('useCoupon must be used within CouponProvider');
  return ctx;
}
