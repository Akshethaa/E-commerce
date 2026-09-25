import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ChevronRight, ArrowLeft } from 'lucide-react';
import { supabase, type OrderWithItems } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { formatPrice, formatDate } from '@/lib/format';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  paid: 'bg-blue-50 text-blue-700',
  shipped: 'bg-indigo-50 text-indigo-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-red-50 text-red-700',
};

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (!user) return;

    supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders((data as OrderWithItems[]) ?? []);
        setLoading(false);
      });
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-100" />
        <div className="mt-6 space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <Package className="h-10 w-10 text-gray-300" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-gray-900">No orders yet</h1>
        <p className="mt-2 text-gray-500">
          When you place an order, it will appear here.
        </p>
        <Link
          to="/shop"
          className="mt-6 rounded-full bg-gray-900 px-6 py-3 text-sm font-medium text-white"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-gray-900">
        My Orders
      </h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-2xl border border-gray-100 bg-white p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-50 pb-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Order #{order.id.slice(0, 8).toUpperCase()}
                </p>
                <p className="text-xs text-gray-500">
                  Placed on {formatDate(order.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                    STATUS_STYLES[order.status] || 'bg-gray-50 text-gray-700'
                  }`}
                >
                  {order.status}
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(Number(order.total))}
                </span>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {order.order_items?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-700">
                    {item.product_name}{' '}
                    <span className="text-gray-400">× {item.quantity}</span>
                  </span>
                  <span className="font-medium text-gray-900">
                    {formatPrice(Number(item.price) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-1 border-t border-gray-50 pt-3 text-xs text-gray-500">
              <span>Shipping to: {order.shipping_address}, {order.shipping_city} {order.shipping_zip}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
