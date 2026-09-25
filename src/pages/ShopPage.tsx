import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, X, ArrowLeft, Star } from 'lucide-react';
import { supabase, type Product } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';

const CATEGORIES = ['Electronics', 'Fashion', 'Beauty', 'Footwear', 'Home & Kitchen', 'Accessories', 'Grocery', 'Home'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'discount', label: 'Biggest Discount' },
];

const PRICE_RANGES = [
  { label: 'Under ₹500', min: 0, max: 500 },
  { label: '₹500 — ₹1,000', min: 500, max: 1000 },
  { label: '₹1,000 — ₹3,000', min: 1000, max: 3000 },
  { label: '₹3,000 — ₹5,000', min: 3000, max: 5000 },
  { label: '₹5,000+', min: 5000, max: Infinity },
];

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const category = searchParams.get('category') || '';
  const featured = searchParams.get('featured') === 'true';
  const sort = searchParams.get('sort') || 'newest';
  const search = searchParams.get('q') || '';
  const priceRange = searchParams.get('priceRange') || '';
  const minRating = searchParams.get('rating') || '';
  const onSaleOnly = searchParams.get('onSale') === 'true';
  const inStockOnly = searchParams.get('inStock') === 'true';

  useEffect(() => {
    setLoading(true);
    let query = supabase.from('products').select('*');

    if (category) query = query.eq('category', category);
    if (featured) query = query.eq('featured', true);

    switch (sort) {
      case 'price-low':
        query = query.order('price', { ascending: true });
        break;
      case 'price-high':
        query = query.order('price', { ascending: false });
        break;
      case 'rating':
        query = query.order('rating', { ascending: false });
        break;
      case 'discount':
        query = query.order('discount', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    query.then(({ data }) => {
      let result = (data ?? []) as Product[];

      if (search) {
        const q = search.toLowerCase();
        result = result.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        );
      }

      if (priceRange) {
        const range = PRICE_RANGES.find((r) => r.label === priceRange);
        if (range) {
          result = result.filter((p) => {
            const price = Number(p.price);
            return price >= range.min && price < range.max;
          });
        }
      }

      if (minRating) {
        const min = parseFloat(minRating);
        result = result.filter((p) => Number(p.rating) >= min);
      }

      if (onSaleOnly) {
        result = result.filter((p) => p.discount > 0);
      }

      if (inStockOnly) {
        result = result.filter((p) => p.stock > 0);
      }

      setProducts(result);
      setLoading(false);
    });
  }, [category, featured, sort, search, priceRange, minRating, onSaleOnly, inStockOnly]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasFilters = useMemo(
    () => category || featured || search || priceRange || minRating || onSaleOnly || inStockOnly,
    [category, featured, search, priceRange, minRating, onSaleOnly, inStockOnly]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          {category ? category : featured ? 'Featured Products' : 'All Products'}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {loading
            ? 'Loading...'
            : `${products.length} ${products.length === 1 ? 'item' : 'items'} found`}
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar filters */}
        <aside className="lg:w-64 lg:shrink-0">
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 dark:border-gray-700 dark:text-gray-300"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
          </div>
          <div
            className={`${
              showFilters ? 'block' : 'hidden'
            } space-y-6 lg:block lg:sticky lg:top-20`}
          >
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Categories</h3>
              <div className="space-y-1.5">
                <button
                  onClick={() => updateParam('category', '')}
                  className={`block w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                    !category
                      ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                  }`}
                >
                  All Categories
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => updateParam('category', cat)}
                    className={`block w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                      category === cat
                        ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Price Range</h3>
              <div className="space-y-1.5">
                <button
                  onClick={() => updateParam('priceRange', '')}
                  className={`block w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                    !priceRange
                      ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                  }`}
                >
                  All Prices
                </button>
                {PRICE_RANGES.map((range) => (
                  <button
                    key={range.label}
                    onClick={() => updateParam('priceRange', range.label)}
                    className={`block w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                      priceRange === range.label
                        ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Rating</h3>
              <div className="space-y-1.5">
                <button
                  onClick={() => updateParam('rating', '')}
                  className={`block w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                    !minRating
                      ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                  }`}
                >
                  All Ratings
                </button>
                {[4.5, 4.0, 3.5].map((r) => (
                  <button
                    key={r}
                    onClick={() => updateParam('rating', r.toString())}
                    className={`flex w-full items-center gap-1.5 rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                      minRating === r.toString()
                        ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {r}+ & up
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Special</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => updateParam('featured', e.target.checked ? 'true' : '')}
                    className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                  />
                  Featured only
                </label>
                <label className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400">
                  <input
                    type="checkbox"
                    checked={onSaleOnly}
                    onChange={(e) => updateParam('onSale', e.target.checked ? 'true' : '')}
                    className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                  />
                  On sale only
                </label>
                <label className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => updateParam('inStock', e.target.checked ? 'true' : '')}
                    className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                  />
                  In stock only
                </label>
              </div>
            </div>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" /> Clear filters
              </button>
            )}
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-end">
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/3] animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-20 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">No products found.</p>
              <button
                onClick={clearFilters}
                className="mt-3 text-sm font-medium text-gray-900 underline dark:text-white"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
