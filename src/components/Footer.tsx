import { Link } from 'react-router-dom';
import { ShoppingBag, Mail, Twitter, Instagram, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-gray-900">
                Lunora
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">
              Thoughtfully curated products for modern living. Quality you can
              feel, design you'll love.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Shop</h4>
            <ul className="mt-3 space-y-2">
              <li>
                <Link to="/shop" className="text-sm text-gray-500 hover:text-gray-900">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/shop?featured=true" className="text-sm text-gray-500 hover:text-gray-900">
                  Featured
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Electronics" className="text-sm text-gray-500 hover:text-gray-900">
                  Electronics
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Fashion" className="text-sm text-gray-500 hover:text-gray-900">
                  Fashion
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Beauty" className="text-sm text-gray-500 hover:text-gray-900">
                  Beauty
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Footwear" className="text-sm text-gray-500 hover:text-gray-900">
                  Footwear
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Home%20%26%20Kitchen" className="text-sm text-gray-500 hover:text-gray-900">
                  Home & Kitchen
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Grocery" className="text-sm text-gray-500 hover:text-gray-900">
                  Grocery
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Company</h4>
            <ul className="mt-3 space-y-2">
              <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900">About</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900">Careers</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900">Press</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900">Sustainability</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Connect</h4>
            <div className="mt-3 flex gap-3">
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-900 hover:text-white">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-900 hover:text-white">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-900 hover:text-white">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-900 hover:text-white">
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-gray-100 pt-6">
          <p className="text-center text-xs text-gray-400">
            © 2026 Lunora. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
