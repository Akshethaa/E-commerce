import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchWishlistProducts } from '@/context/WishlistContext';
import { type Product } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';

export default function WishlistPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchWishlistProducts(user.id).then((prods) => {
      setProducts(prods);
      setLoading(false);
    });
  }, [user]);

  if (!user) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
          <Heart className="h-10 w-10 text-gray-300" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-gray-900">Sign in to view your wishlist</h1>
        <Link
          to="/login"
          className="mt-6 rounded-full bg-gray-900 px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-gray-900">My Wishlist</h1>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-20 text-center">
          <Heart className="h-12 w-12 text-gray-300" />
          <p className="mt-4 text-gray-500">Your wishlist is empty.</p>
          <Link
            to="/shop"
            className="mt-4 rounded-full bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
