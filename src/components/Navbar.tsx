import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, LayoutDashboard, Package, Heart, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useTheme } from '@/context/ThemeContext';
import SmartSearch from '@/components/SmartSearch';

export default function Navbar() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const { totalItems, openCart } = useCart();
  const { wishlistIds } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-900/80">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900 dark:bg-white">
              <ShoppingBag className="h-5 w-5 text-white dark:text-gray-900" />
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
              Lunora
            </span>
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <Link
              to="/shop"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Shop
            </Link>
            <Link
              to="/shop?featured=true"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Featured
            </Link>
            {user && (
              <Link
                to="/orders"
                className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                My Orders
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Admin
              </Link>
            )}
          </div>
        </div>

        <div className="hidden flex-1 justify-center px-4 sm:flex">
          <SmartSearch />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {user && (
            <Link
              to="/wishlist"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlistIds.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
                  {wishlistIds.length}
                </span>
              )}
            </Link>
          )}

          <button
            onClick={openCart}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            aria-label="Open cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-900 px-1 text-[11px] font-bold text-white dark:bg-white dark:text-gray-900">
                {totalItems}
              </span>
            )}
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex h-10 items-center gap-2 rounded-full pl-1 pr-3 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white dark:bg-white dark:text-gray-900">
                  {(profile?.full_name || user.email || 'U')[0].toUpperCase()}
                </div>
                <span className="hidden text-sm font-medium text-gray-700 dark:text-gray-300 sm:block">
                  {profile?.full_name || 'Account'}
                </span>
              </button>
              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-lg dark:border-gray-800 dark:bg-gray-900">
                    <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {profile?.full_name || 'Account'}
                      </p>
                      <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      to="/orders"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <Package className="h-4 w-4" /> My Orders
                    </Link>
                    <Link
                      to="/wishlist"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <Heart className="h-4 w-4" /> My Wishlist
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        <LayoutDashboard className="h-4 w-4" /> Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <User className="h-4 w-4" /> Sign In
              </Link>
              <Link
                to="/signup"
                className="hidden h-10 items-center rounded-full bg-gray-900 px-5 text-sm font-medium text-white transition-colors hover:bg-gray-800 sm:flex dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile search */}
      <div className="border-t border-gray-100 px-4 py-3 sm:hidden dark:border-gray-800">
        <SmartSearch />
      </div>
    </header>
  );
}
