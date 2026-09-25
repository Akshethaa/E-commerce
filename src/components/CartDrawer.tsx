import { Link } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/format';
import FreeShippingBar from '@/components/FreeShippingBar';

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    subtotal,
    totalItems,
  } = useCart();

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={closeCart}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <ShoppingBag className="h-5 w-5" />
            Your Cart ({totalItems})
          </h2>
          <button
            onClick={closeCart}
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
              <ShoppingBag className="h-8 w-8 text-gray-300" />
            </div>
            <p className="text-center text-gray-500">
              Your cart is empty. Start shopping to find something you love.
            </p>
            <Link
              to="/shop"
              onClick={closeCart}
              className="rounded-full bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-3 border-b border-gray-50 pb-4"
                  >
                    <Link
                      to={`/product/${item.product.id}`}
                      onClick={closeCart}
                      className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-50"
                    >
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    </Link>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between">
                        <Link
                          to={`/product/${item.product.id}`}
                          onClick={closeCart}
                          className="text-sm font-semibold text-gray-900 hover:underline"
                        >
                          {item.product.name}
                        </Link>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-gray-400 transition-colors hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatPrice(Number(item.product.price))}
                      </p>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-1 rounded-full border border-gray-200">
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity - 1)
                            }
                            className="flex h-7 w-7 items-center justify-center text-gray-600 hover:text-gray-900"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity + 1)
                            }
                            className="flex h-7 w-7 items-center justify-center text-gray-600 hover:text-gray-900"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <span className="text-sm font-bold text-gray-900">
                          {formatPrice(Number(item.product.price) * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100 px-5 py-4">
              <FreeShippingBar subtotal={subtotal} />
              <div className="mb-3 mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-500">Subtotal</span>
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="mb-3 text-xs text-gray-400">
                Shipping and taxes calculated at checkout.
              </p>
              <div className="flex gap-2">
                <Link
                  to="/cart"
                  onClick={closeCart}
                  className="flex-1 rounded-full border border-gray-200 py-3 text-center text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50"
                >
                  View Cart
                </Link>
                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="flex-1 rounded-full bg-gray-900 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-gray-800"
                >
                  Checkout
                </Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
