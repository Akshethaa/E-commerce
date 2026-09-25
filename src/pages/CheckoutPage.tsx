import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useCoupon } from '@/context/CouponContext';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/format';

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { appliedCoupon, discountAmount, removeCoupon } = useCoupon();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({
    address: '',
    city: '',
    zip: '',
    country: 'India',
  });

  const discount = discountAmount(subtotal);
  const discountedSubtotal = subtotal - discount;
  const shipping = discountedSubtotal >= 5000 ? 0 : 199;
  const tax = discountedSubtotal * 0.08;
  const total = discountedSubtotal + shipping + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in to complete your order', 'error');
      navigate('/login');
      return;
    }
    if (!form.address || !form.city || !form.zip) {
      showToast('Please fill in all shipping fields', 'error');
      return;
    }

    setProcessing(true);
    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          status: 'pending',
          total: total,
          shipping_address: form.address,
          shipping_city: form.city,
          shipping_zip: form.zip,
          shipping_country: form.country,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        price: Number(item.product.price),
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      setSuccess(order.id);
      clearCart();
      removeCoupon();
      showToast('Order placed successfully!');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to place order', 'error');
    } finally {
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950">
          <Check className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">Order Confirmed!</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Thank you for your purchase. We've received your order and will send a confirmation shortly.
        </p>
        <div className="mt-4 rounded-xl bg-gray-50 px-6 py-3 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Order Number</p>
          <p className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
            {success.slice(0, 8).toUpperCase()}
          </p>
        </div>
        <div className="mt-8 flex gap-3">
          <Link to="/orders" className="rounded-full bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-900">
            View My Orders
          </Link>
          <Link to="/shop" className="rounded-full border border-gray-200 px-6 py-3 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your cart is empty</h1>
        <Link to="/shop" className="mt-6 rounded-full bg-gray-900 px-6 py-3 text-sm font-medium text-white dark:bg-white dark:text-gray-900">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/cart" className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Back to Cart
      </Link>
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {!user && (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                You need to be signed in to complete your order.{' '}
                <Link to="/login" className="font-semibold underline">Sign in here</Link>
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Shipping Address</h2>
              <div className="grid gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Street Address</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="123 MG Road"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      placeholder="Mumbai"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">PIN Code</label>
                    <input
                      type="text"
                      value={form.zip}
                      onChange={(e) => setForm({ ...form, zip: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      placeholder="400001"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Country</label>
                  <select
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option>India</option>
                    <option>United States</option>
                    <option>United Kingdom</option>
                    <option>Canada</option>
                    <option>Australia</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Payment Method</h2>
              <div className="rounded-xl border-2 border-gray-900 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-gray-900 text-xs font-bold text-white dark:bg-white dark:text-gray-900">
                    CARD
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Credit / Debit Card</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Secure payment processing</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Card number" className="col-span-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-gray-900 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" />
                  <input type="text" placeholder="MM / YY" className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-gray-900 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" />
                  <input type="text" placeholder="CVC" className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-gray-900 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" />
                </div>
                <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">This is a demo store — no real payment will be processed.</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={processing || !user}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-gray-900 py-4 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
            >
              {processing ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
              ) : (
                `Place Order — ${formatPrice(total)}`
              )}
            </button>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-20 rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Order Summary</h2>
            <div className="mb-4 space-y-3">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-50 dark:bg-gray-800">
                    <img src={item.product.image_url} alt={item.product.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 line-clamp-1 dark:text-white">{item.product.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Qty {item.quantity} × {formatPrice(Number(item.product.price))}</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatPrice(Number(item.product.price) * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-2 border-t border-gray-100 pt-4 text-sm dark:border-gray-800">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-emerald-600 dark:text-emerald-400">Coupon discount</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">−{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Shipping</span>
                <span className="font-medium text-gray-900 dark:text-white">{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Tax</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-2 dark:border-gray-800">
                <span className="font-bold text-gray-900 dark:text-white">Total</span>
                <span className="font-bold text-gray-900 dark:text-white">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
