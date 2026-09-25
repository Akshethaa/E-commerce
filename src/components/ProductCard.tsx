import { Link } from 'react-router-dom';
import { Plus, Star } from 'lucide-react';
import type { Product } from '@/lib/supabase';
import { formatPrice } from '@/lib/format';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import WishlistButton from '@/components/WishlistButton';

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) {
      showToast('Out of stock', 'error');
      return;
    }
    addToCart(product, 1);
    showToast(`${product.name} added to cart`);
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all duration-300 hover:border-gray-200 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50 dark:bg-gray-800">
        <img
          src={product.image_url}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {product.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-gray-900 px-2.5 py-1 text-[11px] font-semibold text-white dark:bg-white dark:text-gray-900">
            Featured
          </span>
        )}
        {product.discount > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-[11px] font-bold text-white">
            {product.discount}% OFF
          </span>
        )}
        {product.stock <= 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-gray-900/60">
            <span className="rounded-full bg-gray-900 px-4 py-1.5 text-xs font-semibold text-white dark:bg-white dark:text-gray-900">
              Out of Stock
            </span>
          </div>
        )}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <WishlistButton productId={product.id} size="sm" />
          <button
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-900 shadow-md opacity-0 transition-all duration-300 hover:bg-gray-900 hover:text-white group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-0 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
          {product.category}
        </p>
        <h3 className="mt-1 text-sm font-semibold text-gray-900 line-clamp-1 dark:text-white">
          {product.name}
        </h3>
        <p className="mt-1 text-xs text-gray-500 line-clamp-2 dark:text-gray-400">
          {product.description}
        </p>
        <div className="mt-2 flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            {Number(product.rating).toFixed(1)}
          </span>
        </div>
        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-gray-900 dark:text-white">
              {formatPrice(Number(product.price))}
            </span>
            {product.original_price && Number(product.original_price) > Number(product.price) && (
              <span className="text-xs text-gray-400 line-through dark:text-gray-500">
                {formatPrice(Number(product.original_price))}
              </span>
            )}
          </div>
          {product.stock > 0 && product.stock <= 10 && (
            <span className="mt-1 block text-xs font-medium text-amber-600">
              Only {product.stock} left
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
