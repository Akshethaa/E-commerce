import { Heart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Link } from 'react-router-dom';

type Props = {
  productId: string;
  size?: 'sm' | 'md';
  className?: string;
};

export default function WishlistButton({ productId, size = 'md', className = '' }: Props) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const { showToast } = useToast();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      showToast('Please sign in to use your wishlist', 'error');
      return;
    }
    const wasAdded = isWishlisted(productId);
    await toggleWishlist(productId);
    showToast(wasAdded ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const wished = isWishlisted(productId);
  const sizeClass = size === 'sm' ? 'h-8 w-8' : 'h-9 w-9';
  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

  if (!user) {
    return (
      <Link
        to="/login"
        onClick={(e) => e.stopPropagation()}
        className={`flex ${sizeClass} items-center justify-center rounded-full bg-white text-gray-400 shadow-sm transition-colors hover:text-red-500 ${className}`}
      >
        <Heart className={iconSize} />
      </Link>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`flex ${sizeClass} items-center justify-center rounded-full bg-white shadow-sm transition-colors ${className} ${
        wished ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
      }`}
      aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart className={`${iconSize} ${wished ? 'fill-red-500' : ''}`} />
    </button>
  );
}
