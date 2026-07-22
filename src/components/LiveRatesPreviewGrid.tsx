"use client";

import { coins } from "@/lib/coins";
import { formatNgn, formatUsd } from "@/lib/format";
import { useLiveRates } from "@/hooks/useLiveRates";
import type { CoinRate } from "@/lib/rates";
import LiveStatusBadge from "@/components/LiveStatusBadge";

export default function LiveRatesPreviewGrid({
  initialRates,
}: {
  initialRates: CoinRate[];
}) {
  const { rates, status } = useLiveRates(initialRates);

  return (
    <>
      <div className="mb-4 flex justify-end">
        <LiveStatusBadge status={status} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rates.map((rate) => {
          const coin = coins.find((c) => c.id === rate.id);
          if (!coin) return null;
          return (
            <div
              key={rate.id}
              className="rounded-2xl border border-cream-300 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${coin.color}1a` }}
                >
                  <coin.icon size={20} style={{ color: coin.color }} />
                </span>
                <div>
                  <p className="font-display font-bold text-maroon-950">
                    {coin.name}
                  </p>
                  <p className="text-xs font-semibold uppercase text-maroon-950/40 tabular-nums">
                    {coin.symbol} · {formatUsd(rate.usd)}
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-maroon-950/40">We Buy</p>
                  <p className="font-bold text-maroon-700 tabular-nums">
                    {formatNgn(rate.buyNgn)}
                  </p>
                </div>
                <div>
                  <p className="text-maroon-950/40">We Sell</p>
                  <p className="font-bold text-gold-700 tabular-nums">
                    {formatNgn(rate.sellNgn)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
