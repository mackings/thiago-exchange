"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { api, type AdDTO } from "@/lib/api";
import { coins } from "@/lib/coins";
import { formatNgn } from "@/lib/format";

// From the trader's point of view: an ad where Thiago is selling means the
// user can buy, and vice versa — flip the label so the UI reads naturally
// instead of exposing our internal "side" terminology.
type ViewMode = "buy" | "sell";

function coinFor(symbol: string) {
  return coins.find((c) => c.symbol === symbol);
}

function paymentChips(raw: string) {
  return raw
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => p.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));
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

  const accent = mode === "buy" ? "emerald" : "rose";

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-maroon-950">Market</h1>
      <p className="mt-1 text-sm text-maroon-950/60">Trade directly with Thiago Exchange.</p>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setMode("buy")}
          className={`rounded-xl py-3 text-sm font-bold transition-colors ${
            mode === "buy" ? "bg-emerald-600 text-white" : "border border-cream-300 bg-white text-maroon-950/60"
          }`}
        >
          Buy Crypto
        </button>
        <button
          type="button"
          onClick={() => setMode("sell")}
          className={`rounded-xl py-3 text-sm font-bold transition-colors ${
            mode === "sell" ? "bg-rose-600 text-white" : "border border-cream-300 bg-white text-maroon-950/60"
          }`}
        >
          Sell Crypto
        </button>
      </div>

      {loading && <p className="mt-5 text-sm text-maroon-950/50">Loading offers…</p>}
      {error && <p className="mt-5 text-sm font-semibold text-red-600">{error}</p>}
      {!loading && !error && ads.length === 0 && (
        <p className="mt-5 rounded-2xl border border-cream-300 bg-white p-6 text-center text-sm text-maroon-950/50">
          No {mode === "buy" ? "sell" : "buy"} offers open right now — check back shortly.
        </p>
      )}

      {!loading && ads.length > 0 && (
        <div className="mt-5 divide-y divide-cream-200 overflow-hidden rounded-2xl border border-cream-300 bg-white">
          {ads.map((ad) => {
            const coin = coinFor(ad.asset);
            const rate = ad.rateType === "fixed" ? ad.fixedRate : null;
            const chips = paymentChips(ad.paymentMethods || "Bank transfer");
            return (
              <Link
                key={ad.id}
                href={`/market/${ad.id}`}
                className="flex flex-col gap-4 p-4 transition-colors hover:bg-cream-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cream-200"
                    style={{ color: coin?.color }}
                  >
                    {coin ? <coin.icon size={22} /> : ad.asset}
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-maroon-950">Thiago Exchange</p>
                      <ShieldCheck size={14} className="text-emerald-600" />
                    </div>
                    <p className="text-xs text-maroon-950/50">
                      Limit {formatNgn(ad.minLimit)} – {formatNgn(ad.maxLimit)}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {chips.map((c) => (
                        <span
                          key={c}
                          className="rounded-full bg-cream-200 px-2 py-0.5 text-[11px] font-semibold text-maroon-950/60"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-start">
                  <div className="sm:text-right">
                    <p className="font-display text-xl font-extrabold text-maroon-950">
                      {rate ? formatNgn(rate) : `Bybit ± ${ad.floatingMarginPct}%`}
                    </p>
                    <p className="text-xs text-maroon-950/40">per {ad.asset}</p>
                  </div>
                  <span
                    className={`rounded-full px-5 py-2 text-sm font-bold text-white ${
                      accent === "emerald" ? "bg-emerald-600" : "bg-rose-600"
                    }`}
                  >
                    {mode === "buy" ? "Buy" : "Sell"} {ad.asset}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
