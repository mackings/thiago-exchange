"use client";

import { ArrowDownRight, ArrowUpRight, Info } from "lucide-react";
import { coins } from "@/lib/coins";
import { formatNgn, formatUsd } from "@/lib/format";
import { useLiveRates } from "@/hooks/useLiveRates";
import type { CoinRate } from "@/lib/rates";
import LiveStatusBadge from "@/components/LiveStatusBadge";

export default function LiveRatesBoard({
  initialRates,
}: {
  initialRates: CoinRate[];
}) {
  const { rates, status } = useLiveRates(initialRates);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold-300/50 bg-gold-50 px-4 py-3 text-sm text-maroon-950/70">
        <span className="flex items-center gap-2">
          <Info size={16} className="text-gold-600" />
          Market prices stream live from Binance. Naira rates update
          instantly as the market moves, based on our current margin.
        </span>
        <div className="flex items-center gap-4">
          <LiveStatusBadge status={status} />
          <span className="font-semibold text-maroon-950/50">
            All rates in Nigerian Naira (₦)
          </span>
        </div>
      </div>

      {/* Desktop table */}
      <div className="mt-8 hidden overflow-hidden rounded-2xl border border-cream-300 bg-white shadow-sm md:block">
        <table className="w-full text-left">
          <thead className="bg-maroon-950 text-cream-100">
            <tr>
              <th className="px-6 py-4 text-sm font-bold">Coin</th>
              <th className="px-6 py-4 text-sm font-bold">Market Price</th>
              <th className="px-6 py-4 text-sm font-bold">24h</th>
              <th className="px-6 py-4 text-sm font-bold">We Buy</th>
              <th className="px-6 py-4 text-sm font-bold">We Sell</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-200">
            {rates.map((rate, index) => {
              const coin = coins.find((c) => c.id === rate.id);
              if (!coin) return null;
              const positive = rate.usd24hChange >= 0;
              return (
                <tr
                  key={rate.id}
                  className={`transition-colors hover:bg-gold-50/60 ${
                    index % 2 === 1 ? "bg-cream-50/60" : ""
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${coin.color}1a` }}
                      >
                        <coin.icon size={18} style={{ color: coin.color }} />
                      </span>
                      <div>
                        <p className="font-bold text-maroon-950">
                          {coin.name}
                        </p>
                        <p className="text-xs font-semibold uppercase text-maroon-950/40">
                          {coin.symbol}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-maroon-950/80 tabular-nums">
                    {formatUsd(rate.usd)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 text-sm font-bold tabular-nums ${
                        positive ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {positive ? (
                        <ArrowUpRight size={14} />
                      ) : (
                        <ArrowDownRight size={14} />
                      )}
                      {Math.abs(rate.usd24hChange).toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-maroon-700 tabular-nums">
                    {formatNgn(rate.buyNgn)}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gold-700 tabular-nums">
                    {formatNgn(rate.sellNgn)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="mt-8 grid gap-4 md:hidden">
        {rates.map((rate) => {
          const coin = coins.find((c) => c.id === rate.id);
          if (!coin) return null;
          const positive = rate.usd24hChange >= 0;
          return (
            <div
              key={rate.id}
              className="rounded-2xl border border-cream-300 bg-white p-5 shadow-sm transition-colors hover:border-gold-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${coin.color}1a` }}
                  >
                    <coin.icon size={20} style={{ color: coin.color }} />
                  </span>
                  <div>
                    <p className="font-bold text-maroon-950">{coin.name}</p>
                    <p className="text-xs font-semibold uppercase text-maroon-950/40 tabular-nums">
                      {coin.symbol} · {formatUsd(rate.usd)}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-bold tabular-nums ${
                    positive ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {positive ? (
                    <ArrowUpRight size={12} />
                  ) : (
                    <ArrowDownRight size={12} />
                  )}
                  {Math.abs(rate.usd24hChange).toFixed(2)}%
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-cream-200 pt-4 text-sm">
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

      <p className="mt-6 text-center text-xs text-maroon-950/40">
        Tether (USDT) is a US-dollar-pegged stablecoin, shown at a fixed
        $1.00. All other prices stream live. Naira rates use a reference
        NGN/USD rate and margin set by Thiago Exchange — contact us to lock
        in your exact quote before trading.
      </p>
    </>
  );
}
