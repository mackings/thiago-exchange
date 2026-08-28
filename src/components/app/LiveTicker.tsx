"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { useLiveRates } from "@/hooks/useLiveRates";
import { getFallbackRates } from "@/lib/rates";
import { coins } from "@/lib/coins";

const tickerCoins = ["bitcoin", "tether", "ethereum", "binancecoin", "ripple", "solana"];

export default function LiveTicker() {
  const { rates, status } = useLiveRates(getFallbackRates().filter((r) => tickerCoins.includes(r.id)));

  const pills = rates.map((rate) => {
    const coin = coins.find((c) => c.id === rate.id);
    const up = rate.usd24hChange >= 0;
    return (
      <span key={rate.id} className="flex shrink-0 items-center gap-2 rounded-full bg-cream-200 px-3 py-1.5">
        {coin && <coin.icon size={14} className="shrink-0" style={{ color: coin.color }} />}
        <span className="text-xs font-bold text-maroon-950">{rate.symbol}</span>
        <span className="text-xs text-maroon-950/50">
          ${rate.usd < 1 ? rate.usd.toFixed(4) : rate.usd.toLocaleString()}
        </span>
        <span className={`flex items-center gap-0.5 text-xs font-bold ${up ? "text-emerald-600" : "text-rose-600"}`}>
          {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(rate.usd24hChange).toFixed(1)}%
        </span>
      </span>
    );
  });

  return (
    <div className="relative mt-2 overflow-hidden rounded-full">
      <div className="flex w-max animate-[ticker_28s_linear_infinite] gap-2 py-0.5">
        {pills}
        {pills}
      </div>
      <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 bg-white pl-2 text-[10px] font-bold text-emerald-600">
        {status === "live" ? "● Live" : "Connecting…"}
      </span>
    </div>
  );
}
