import { Truck } from 'lucide-react';
import { formatPrice } from '@/lib/format';

const FREE_SHIPPING_THRESHOLD = 5000;

export default function FreeShippingBar({ subtotal }: { subtotal: number }) {
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
      <div className="flex items-center gap-2">
        <Truck className="h-4 w-4 text-gray-600" />
        {remaining > 0 ? (
          <p className="text-sm text-gray-600">
            Add <span className="font-semibold text-gray-900">{formatPrice(remaining)}</span> more for{' '}
            <span className="font-semibold text-gray-900">FREE shipping</span>
          </p>
        ) : (
          <p className="text-sm font-semibold text-emerald-600">
            You've unlocked FREE shipping!
          </p>
        )}
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
