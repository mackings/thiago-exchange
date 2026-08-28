"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { api, type AdDTO } from "@/lib/api";
import { coins } from "@/lib/coins";
import { formatNgn } from "@/lib/format";
import { cardClass } from "@/lib/ui";

// From the trader's point of view: an ad where Thiago is selling means the
// user can buy, and vice versa — flip the label so the UI reads naturally
// instead of exposing our internal "side" terminology.
type ViewMode = "buy" | "sell";

function coinFor(symbol: string) {
  return coins.find((c) => c.symbol === symbol);
}

export default function MarketPage() {
  const [mode, setMode] = useState<ViewMode>("buy");
  const [ads, setAds] = useState<AdDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    const adSide = mode === "buy" ? "sell" : "buy";
    api
      .listAds({ side: adSide })
      .then(setAds)
      .catch(() => setError("Couldn't load offers right now."))
      .finally(() => setLoading(false));
  }, [mode]);

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-maroon-950">Market</h1>
      <p className="mt-1 text-sm text-maroon-950/60">Trade directly with Thiago Exchange.</p>

      <div className="mt-5 inline-flex rounded-full border border-cream-300 bg-white p-1">
        {(["buy", "sell"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded-full px-5 py-2 text-sm font-bold capitalize transition-colors ${
              mode === m ? "bg-maroon-700 text-cream-50" : "text-maroon-950/60"
            }`}
          >
            {m} Crypto
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {loading && <p className="text-sm text-maroon-950/50">Loading offers…</p>}
        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
        {!loading && !error && ads.length === 0 && (
          <p className={`${cardClass} text-sm text-maroon-950/50`}>
            No {mode === "buy" ? "sell" : "buy"} offers open right now — check back shortly.
          </p>
        )}
        {ads.map((ad) => {
          const coin = coinFor(ad.asset);
          const rate = ad.rateType === "fixed" ? ad.fixedRate : null;
          return (
            <Link
              key={ad.id}
              href={`/market/${ad.id}`}
              className={`${cardClass} group flex items-center justify-between transition hover:-translate-y-0.5 hover:border-gold-300/60 hover:shadow-md`}
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-cream-200"
                  style={{ color: coin?.color }}
                >
                  {coin ? <coin.icon size={22} /> : ad.asset}
                </span>
                <div>
                  <p className="font-bold text-maroon-950">
                    {mode === "buy" ? "Buy" : "Sell"} {ad.asset}
                  </p>
                  <p className="text-xs text-maroon-950/50">
                    Limits: {formatNgn(ad.minLimit)} – {formatNgn(ad.maxLimit)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-right">
                <div>
                  <p className="font-display font-bold text-maroon-700">
                    {rate ? formatNgn(rate) : `${ad.floatingMarginPct}% margin`}
                  </p>
                  <p className="text-xs text-maroon-950/40">per {ad.asset}</p>
                </div>
                <ArrowRight
                  size={18}
                  className="text-maroon-950/30 transition-transform group-hover:translate-x-1 group-hover:text-maroon-700"
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
