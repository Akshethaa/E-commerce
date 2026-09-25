import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, ShoppingBag, Check, Star, Heart } from 'lucide-react';
import { supabase, type Product, type Review } from '@/lib/supabase';
import { formatPrice } from '@/lib/format';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { useRecentlyViewed } from '@/context/RecentlyViewedContext';
import ProductCard from '@/components/ProductCard';
import WishlistButton from '@/components/WishlistButton';
import DeliveryEstimator from '@/components/DeliveryEstimator';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { user } = useAuth();
  const { addRecentlyViewed, recentProducts } = useRecentlyViewed();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      supabase.from('products').select('*').eq('id', id).maybeSingle(),
      supabase.from('reviews').select('*').eq('product_id', id).order('created_at', { ascending: false }),
    ]).then(([{ data: prod }, { data: revs }]) => {
      const p = prod as Product | null;
      setProduct(p);
      setReviews((revs ?? []) as Review[]);
      setLoading(false);
      if (p) {
        addRecentlyViewed(p.id);
        supabase
          .from('products')
          .select('*')
          .eq('category', p.category)
          .neq('id', p.id)
          .limit(4)
          .then(({ data: rel }) => setRelated(rel ?? []));
      }
    });
  }, [id]);

  const handleAddToCart = () => {
    if (!product || product.stock <= 0) return;
    addToCart(product, quantity);
    showToast(`${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    if (!product || product.stock <= 0) return;
    addToCart(product, quantity);
    navigate('/checkout');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !product) return;
    setSubmittingReview(true);
    const { error } = await supabase.from('reviews').insert({
      product_id: product.id,
      user_id: user.id,
      rating: reviewForm.rating,
      title: reviewForm.title || null,
      comment: reviewForm.comment || null,
    });
    setSubmittingReview(false);
    if (error) {
      showToast('Could not submit review', 'error');
    } else {
      showToast('Review submitted!');
      setReviewForm({ rating: 5, title: '', comment: '' });
      supabase
        .from('reviews')
        .select('*')
        .eq('product_id', product.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => setReviews((data ?? []) as Review[]));
    }
  };

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : Number(product?.rating ?? 0);

  const recentFiltered = recentProducts.filter((p) => p.id !== id).slice(0, 4);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
            <div className="h-6 w-1/3 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
            <div className="h-24 w-full animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Product not found</h1>
        <Link
          to="/shop"
          className="mt-4 inline-block rounded-full bg-gray-900 px-6 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-gray-900"
        >
          Back to Shop
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

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
          {product.discount > 0 && (
            <span className="absolute right-4 top-4 rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white">
              {product.discount}% OFF
            </span>
          )}
          <div className="absolute left-4 top-4">
            <WishlistButton productId={product.id} />
          </div>
        </div>

        <div className="flex flex-col">
          <p className="text-sm font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
            {product.category}
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {product.name}
          </h1>

          <div className="mt-2 flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.round(avgRating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {avgRating.toFixed(1)}
            </span>
            <span className="text-sm text-gray-400">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
          </div>

          <div className="mt-3 flex items-baseline gap-3">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatPrice(Number(product.price))}
            </p>
            {product.original_price && Number(product.original_price) > Number(product.price) && (
              <span className="text-lg text-gray-400 line-through dark:text-gray-600">
                {formatPrice(Number(product.original_price))}
              </span>
            )}
            {product.discount > 0 && (
              <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-sm font-bold text-red-600 dark:bg-red-950 dark:text-red-400">
                {product.discount}% off
              </span>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2">
            {product.stock > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                <Check className="h-4 w-4" /> In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700 dark:bg-red-950 dark:text-red-400">
                Out of Stock
              </span>
            )}
          </div>

          <p className="mt-5 leading-relaxed text-gray-600 dark:text-gray-400">{product.description}</p>

          {product.stock > 0 && (
            <div className="mt-6">
              <label className="text-sm font-medium text-gray-900 dark:text-white">Quantity</label>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex h-10 w-10 items-center justify-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center text-base font-semibold text-gray-900 dark:text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="flex h-10 w-10 items-center justify-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="flex items-center gap-2 rounded-full border border-gray-900 px-7 py-3.5 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white dark:text-white dark:hover:bg-gray-800"
            >
              <ShoppingBag className="h-4 w-4" /> Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
              className="flex items-center gap-2 rounded-full bg-gray-900 px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
            >
              Buy Now
            </button>
          </div>

          <DeliveryEstimator className="mt-6" />

          <div className="mt-6 border-t border-gray-100 pt-6 dark:border-gray-800">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Returns</p>
                <p className="mt-0.5 font-medium text-gray-700 dark:text-gray-300">30-day window</p>
              </div>
              <div>
                <p className="text-gray-400">Warranty</p>
                <p className="mt-0.5 font-medium text-gray-700 dark:text-gray-300">2-year coverage</p>
              </div>
              <div>
                <p className="text-gray-400">Free Shipping</p>
                <p className="mt-0.5 font-medium text-gray-700 dark:text-gray-300">On orders over ₹5,000</p>
              </div>
              <div>
                <p className="text-gray-400">Support</p>
                <p className="mt-0.5 font-medium text-gray-700 dark:text-gray-300">24/7 assistance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews section */}
      <div className="mt-16">
        <h2 className="mb-6 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Customer Reviews
        </h2>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {reviews.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400">No reviews yet. Be the first!</p>
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700'}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  {review.title && (
                    <p className="mt-2 font-semibold text-gray-900 dark:text-white">{review.title}</p>
                  )}
                  {review.comment && (
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{review.comment}</p>
                  )}
                </div>
              ))
            )}
          </div>

          <div>
            {user ? (
              <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Write a Review</h3>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Rating</label>
                    <div className="mt-1 flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoveredStar(star)}
                          onMouseLeave={() => setHoveredStar(0)}
                          onClick={() => setReviewForm((f) => ({ ...f, rating: star }))}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              star <= (hoveredStar || reviewForm.rating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title (optional)</label>
                    <input
                      type="text"
                      value={reviewForm.title}
                      onChange={(e) => setReviewForm((f) => ({ ...f, title: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      placeholder="Summary of your experience"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Comment (optional)</label>
                    <textarea
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                      rows={3}
                      className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      placeholder="Tell others about this product..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="w-full rounded-full bg-gray-900 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 text-center dark:border-gray-800 dark:bg-gray-900">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <Link to="/login" className="font-semibold text-gray-900 underline dark:text-white">Sign in</Link> to leave a review
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">You might also like</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {recentFiltered.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Recently Viewed</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {recentFiltered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
