"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { api, type AdDTO } from "@/lib/api";
import { coins } from "@/lib/coins";
import { formatNgn } from "@/lib/format";
import { useSession } from "@/lib/session-context";
import { pageClass } from "@/lib/ui";
import LiveTicker from "@/components/app/LiveTicker";
import { OfferRowSkeleton } from "@/components/app/Skeleton";

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
  const { user, logout } = useSession();
  const router = useRouter();
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
      <div className="flex items-center justify-between px-4 pt-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-maroon-700 font-display text-sm font-bold text-white">
            {user?.fullName?.[0]?.toUpperCase() ?? "T"}
          </span>
          <div>
            <p className="text-sm font-bold text-maroon-950">{user?.fullName}</p>
            <p className="text-xs text-maroon-950/40">{user?.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            logout();
            router.push("/");
          }}
          aria-label="Log out"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-cream-200 text-maroon-950/60"
        >
          <LogOut size={16} />
        </button>
      </div>

      <div className="px-4">
        <LiveTicker />
      </div>

      <div className={pageClass}>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode("buy")}
            className={`rounded-full py-2.5 text-sm font-bold transition-colors ${
              mode === "buy" ? "bg-emerald-600 text-white" : "bg-cream-200 text-maroon-950/60"
            }`}
          >
            Buy
          </button>
          <button
            type="button"
            onClick={() => setMode("sell")}
            className={`rounded-full py-2.5 text-sm font-bold transition-colors ${
              mode === "sell" ? "bg-rose-600 text-white" : "bg-cream-200 text-maroon-950/60"
            }`}
          >
            Sell
          </button>
        </div>

        <div className="mt-5">
          {loading && (
            <div className="divide-y divide-cream-200">
              <OfferRowSkeleton />
              <OfferRowSkeleton />
              <OfferRowSkeleton />
            </div>
          )}
          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
          {!loading && !error && ads.length === 0 && (
            <p className="rounded-xl bg-cream-200/60 p-6 text-center text-sm text-maroon-950/50">
              No {mode === "buy" ? "sell" : "buy"} offers open right now — check back shortly.
            </p>
          )}

          {!loading && ads.length > 0 && (
            <div className="divide-y divide-cream-200">
              {ads.map((ad) => {
                const coin = coinFor(ad.asset);
                const rate = ad.rateType === "fixed" ? ad.fixedRate : null;
                const chips = paymentChips(ad.paymentMethods || "Bank transfer");
                return (
                  <Link
                    key={ad.id}
                    href={`/market/${ad.id}`}
                    className="flex items-center justify-between gap-3 py-4 active:opacity-70"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cream-200"
                        style={{ color: coin?.color }}
                      >
                        {coin ? <coin.icon size={22} /> : ad.asset}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-maroon-950">{ad.asset}</p>
                        <p className="truncate text-xs text-maroon-950/50">
                          {formatNgn(ad.minLimit)}–{formatNgn(ad.maxLimit)}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {chips.slice(0, 2).map((c) => (
                            <span key={c} className="rounded-full bg-cream-200 px-2 py-0.5 text-[10px] font-semibold text-maroon-950/60">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="font-display text-base font-extrabold text-maroon-950">
                        {rate ? formatNgn(rate) : `±${ad.floatingMarginPct}%`}
                      </p>
                      <span
                        className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-bold text-white ${
                          accent === "emerald" ? "bg-emerald-600" : "bg-rose-600"
                        }`}
                      >
                        {mode === "buy" ? "Buy" : "Sell"}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
