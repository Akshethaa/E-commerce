import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight, ArrowLeft, Tag, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCoupon } from '@/context/CouponContext';
import { formatPrice } from '@/lib/format';
import FreeShippingBar from '@/components/FreeShippingBar';
import DeliveryEstimator from '@/components/DeliveryEstimator';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, subtotal, totalItems } = useCart();
  const { appliedCoupon, couponError, applyCoupon, removeCoupon, discountAmount } = useCoupon();
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const discount = discountAmount(subtotal);
  const discountedSubtotal = subtotal - discount;
  const shipping = discountedSubtotal >= 5000 ? 0 : discountedSubtotal > 0 ? 199 : 0;
  const tax = discountedSubtotal * 0.08;
  const total = discountedSubtotal + shipping + tax;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    await applyCoupon(couponCode, subtotal);
    setApplyingCoupon(false);
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <ShoppingBag className="h-10 w-10 text-gray-300 dark:text-gray-600" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">Your cart is empty</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Looks like you haven't added anything yet. Let's fix that.</p>
        <Link
          to="/shop"
          className="mt-6 flex items-center gap-2 rounded-full bg-gray-900 px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
        >
          Start Shopping <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        to="/shop"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Shop
      </Link>
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
        Shopping Cart ({totalItems})
      </h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.product.id}
              className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
            >
              <Link
                to={`/product/${item.product.id}`}
                className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-800"
              >
                <img src={item.product.image_url} alt={item.product.name} className="h-full w-full object-cover" />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                      {item.product.category}
                    </p>
                    <Link
                      to={`/product/${item.product.id}`}
                      className="text-base font-semibold text-gray-900 hover:underline dark:text-white"
                    >
                      {item.product.name}
                    </Link>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-gray-400 transition-colors hover:text-red-500"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="flex h-9 w-9 items-center justify-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-gray-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="flex h-9 w-9 items-center justify-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatPrice(Number(item.product.price) * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1 space-y-4">
          <FreeShippingBar subtotal={subtotal} />

          {/* Coupon code */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
              <Tag className="h-4 w-4" /> Coupon Code
            </h3>
            {appliedCoupon ? (
              <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3 dark:bg-emerald-950">
                <div>
                  <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{appliedCoupon.code}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-500">
                    {appliedCoupon.discount_type === 'percentage'
                      ? `${appliedCoupon.discount_value}% off`
                      : `₹${Number(appliedCoupon.discount_value).toLocaleString('en-IN')} off`}
                  </p>
                </div>
                <button onClick={removeCoupon} className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm uppercase tracking-wide focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={applyingCoupon || !couponCode.trim()}
                  className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-gray-900"
                >
                  Apply
                </button>
              </form>
            )}
            {couponError && (
              <p className="mt-2 text-xs text-red-500">{couponError}</p>
            )}
            <p className="mt-2 text-xs text-gray-400">Try: WELCOME10, LUNORA20, FLAT500</p>
          </div>

          {/* Order summary */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Order Summary</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-emerald-600 dark:text-emerald-400">
                    Coupon ({appliedCoupon?.code})
                  </span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    −{formatPrice(discount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Shipping</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {shipping === 0 ? 'Free' : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Tax (8%)</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatPrice(tax)}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 dark:border-gray-800">
                <div className="flex justify-between">
                  <span className="text-base font-bold text-gray-900 dark:text-white">Total</span>
                  <span className="text-base font-bold text-gray-900 dark:text-white">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
            <Link
              to="/checkout"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gray-900 py-3.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
            >
              Proceed to Checkout <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/shop"
              className="mt-3 block text-center text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              Continue Shopping
            </Link>
          </div>

          <DeliveryEstimator />
        </div>
      </div>
    </div>
  );
}
