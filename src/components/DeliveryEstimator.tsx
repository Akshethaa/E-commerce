import { Truck } from 'lucide-react';

function getEstimatedDelivery(): { min: string; max: string } {
  const now = new Date();
  const minDate = new Date(now);
  minDate.setDate(now.getDate() + 3);
  const maxDate = new Date(now);
  maxDate.setDate(now.getDate() + 7);

  const format = (d: Date) =>
    d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

  return { min: format(minDate), max: format(maxDate) };
}

export default function DeliveryEstimator({ className = '' }: { className?: string }) {
  const { min, max } = getEstimatedDelivery();

  return (
    <div className={`flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 ${className}`}>
      <Truck className="h-5 w-5 shrink-0 text-gray-600" />
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          Estimated Delivery
        </p>
        <p className="text-sm font-semibold text-gray-900">
          {min} — {max}
        </p>
      </div>
    </div>
  );
}
