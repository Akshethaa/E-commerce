import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, ShieldCheck, RotateCcw, Sparkles } from 'lucide-react';
import { supabase, type Product } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import FlashSaleCountdown from '@/components/FlashSaleCountdown';
import { useRecentlyViewed } from '@/context/RecentlyViewedContext';

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { recentProducts } = useRecentlyViewed();

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .eq('featured', true)
      .limit(4)
      .then(({ data }) => {
        setFeatured(data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-medium text-gray-600 shadow-sm dark:bg-gray-800 dark:text-gray-300">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              New collection just dropped
            </div>
            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
              Products designed for the way you live.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
              Discover thoughtfully crafted essentials — from premium electronics to timeless home goods. Curated for quality, built to last.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="group flex items-center gap-2 rounded-full bg-gray-900 px-7 py-3.5 text-sm font-medium text-white transition-all hover:bg-gray-800 hover:shadow-lg dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
              >
                Shop Collection
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/shop?featured=true"
                className="flex items-center rounded-full border border-gray-300 bg-white px-7 py-3.5 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
              >
                View Featured
              </Link>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-20 top-10 hidden h-96 w-96 rounded-full bg-amber-200/30 blur-3xl dark:bg-amber-500/10 lg:block" />
        <div className="pointer-events-none absolute -bottom-20 left-10 hidden h-72 w-72 rounded-full bg-blue-200/20 blur-3xl dark:bg-blue-500/10 lg:block" />
      </section>

      {/* Flash Sale Countdown */}
      <FlashSaleCountdown />

      {/* Trust badges */}
      <section className="border-b border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-10 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            { icon: Truck, title: 'Free Shipping', desc: 'On all orders over ₹5,000' },
            { icon: ShieldCheck, title: '2-Year Warranty', desc: 'On every product' },
            { icon: RotateCcw, title: '30-Day Returns', desc: 'No questions asked' },
          ].map((badge) => (
            <div key={badge.title} className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800">
                <badge.icon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{badge.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Featured Products</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Handpicked favorites our customers love</p>
          </div>
          <Link
            to="/shop"
            className="flex items-center gap-1 text-sm font-medium text-gray-900 transition-all hover:gap-2 dark:text-white"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Recently Viewed */}
      {recentProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Recently Viewed</h2>
            <Link to="/shop" className="flex items-center gap-1 text-sm font-medium text-gray-900 transition-all hover:gap-2 dark:text-white">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {recentProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Category banners */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {[
            { name: 'Electronics', desc: 'Cutting-edge tech for everyday life', color: 'bg-blue-50 dark:bg-blue-950' },
            { name: 'Fashion', desc: 'Styles for every occasion', color: 'bg-rose-50 dark:bg-rose-950' },
            { name: 'Beauty', desc: 'Glow from head to toe', color: 'bg-pink-50 dark:bg-pink-950' },
            { name: 'Footwear', desc: 'Step out in comfort', color: 'bg-amber-50 dark:bg-amber-950' },
            { name: 'Home & Kitchen', desc: 'Elevate your living space', color: 'bg-emerald-50 dark:bg-emerald-950' },
            { name: 'Accessories', desc: 'Finishing touches that matter', color: 'bg-indigo-50 dark:bg-indigo-950' },
          ].map((cat) => (
            <Link
              key={cat.name}
              to={`/shop?category=${encodeURIComponent(cat.name)}`}
              className={`group flex h-44 flex-col justify-end overflow-hidden rounded-2xl ${cat.color} p-6 transition-all hover:shadow-md`}
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{cat.name}</h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{cat.desc}</p>
              <span className="mt-3 flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-white">
                Shop now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
