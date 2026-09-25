import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowRight } from 'lucide-react';
import { supabase, type FlashSale } from '@/lib/supabase';

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return { h, m, s };
}

export default function FlashSaleCountdown() {
  const [sale, setSale] = useState<FlashSale | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    supabase
      .from('flash_sales')
      .select('*')
      .eq('active', true)
      .order('ends_at', { ascending: true })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setSale(data as FlashSale);
      });
  }, []);

  useEffect(() => {
    if (!sale) return;
    const update = () => {
      const diff = Math.floor((new Date(sale.ends_at).getTime() - Date.now()) / 1000);
      setTimeLeft(Math.max(0, diff));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [sale]);

  if (!sale || timeLeft <= 0) return null;

  const { h, m, s } = formatTime(timeLeft);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 to-gray-800 p-8 sm:p-10">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 left-20 h-40 w-40 rounded-full bg-red-500/20 blur-3xl" />

        <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-400">
              <Zap className="h-3.5 w-3.5 fill-amber-400" />
              FLASH SALE LIVE
            </div>
            <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
              {sale.title}
            </h2>
            <p className="mt-1 text-sm text-gray-300">
              Up to {sale.discount_percentage}% off selected products. Hurry, ends soon!
            </p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Ends in
            </p>
            <div className="flex items-center gap-2">
              {[
                { label: 'Hrs', value: h },
                { label: 'Min', value: m },
                { label: 'Sec', value: s },
              ].map((unit, idx) => (
                <div key={unit.label} className="flex items-center gap-2">
                  <div className="flex flex-col items-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 text-2xl font-bold text-white tabular-nums backdrop-blur-sm">
                      {String(unit.value).padStart(2, '0')}
                    </div>
                    <span className="mt-1 text-[10px] font-medium uppercase text-gray-400">
                      {unit.label}
                    </span>
                  </div>
                  {idx < 2 && <span className="text-xl font-bold text-gray-500">:</span>}
                </div>
              ))}
            </div>
            <Link
              to="/shop?sort=price-low"
              className="flex items-center gap-1 rounded-full bg-white px-5 py-2 text-sm font-semibold text-gray-900 transition-all hover:gap-2"
            >
              Shop Now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
