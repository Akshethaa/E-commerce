import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { supabase, type Product } from '@/lib/supabase';
import { formatPrice } from '@/lib/format';

export default function SmartSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      supabase
        .from('products')
        .select('*')
        .ilike('name', `%${query.trim()}%`)
        .limit(6)
        .then(({ data }) => {
          setSuggestions(data ?? []);
          setLoading(false);
        });
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      setQuery('');
    }
  };

  const handleSuggestionClick = (id: string) => {
    navigate(`/product/${id}`);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-md">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search products..."
            className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-10 pr-9 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSuggestions([]);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {isOpen && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
          {loading ? (
            <div className="px-4 py-6 text-center text-sm text-gray-400">
              Searching...
            </div>
          ) : suggestions.length > 0 ? (
            <>
              {suggestions.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleSuggestionClick(product.id)}
                  className="flex w-full items-center gap-3 border-b border-gray-50 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-gray-50"
                >
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-50">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500">{product.category}</p>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-gray-900">
                    {formatPrice(Number(product.price))}
                  </span>
                </button>
              ))}
              <button
                onClick={handleSubmit}
                className="block w-full bg-gray-50 px-4 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                View all results for "{query}"
              </button>
            </>
          ) : (
            <div className="px-4 py-6 text-center text-sm text-gray-400">
              No products found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
