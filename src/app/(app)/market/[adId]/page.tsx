"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { api, ApiError, type AdDTO } from "@/lib/api";
import { coins } from "@/lib/coins";
import { formatNgn } from "@/lib/format";
import { heroPanelClass, heroSheetClass, inputClass, labelClass } from "@/lib/ui";

function paymentChips(raw: string) {
  return raw
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => p.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));
}

export default function AdDetailPage() {
  const { adId } = useParams<{ adId: string }>();
  const router = useRouter();
  const [ad, setAd] = useState<AdDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [amount, setAmount] = useState("");

  useEffect(() => {
    api
      .getAd(adId)
      .then(setAd)
      .catch(() => setError("This offer isn't available anymore."))
      .finally(() => setLoading(false));
  }, [adId]);

  if (loading) return <p className="p-5 text-sm text-maroon-950/50">Loading offer…</p>;
  if (error || !ad) return <p className="p-5 text-sm font-semibold text-red-600">{error || "Offer not found."}</p>;

  const coin = coins.find((c) => c.symbol === ad.asset);
  const traderIsBuying = ad.side === "sell";
  const accent = traderIsBuying ? "emerald" : "rose";
  const rate = ad.rateType === "fixed" ? ad.fixedRate : null;
  const estimatedFiat = rate && amount ? Number(amount) * rate : null;
  const chips = paymentChips(ad.paymentMethods || "Bank transfer");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!ad) return;
    setError("");
    const data = new FormData(e.currentTarget);
    const assetAmount = Number(data.get("amount"));
    if (!assetAmount || assetAmount <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    setSubmitting(true);
    try {
      const order = await api.createOrder({
        adId: ad.id,
        assetAmount,
        payoutAddress: traderIsBuying ? String(data.get("payoutAddress") ?? "") : undefined,
        payoutChain: traderIsBuying ? String(data.get("payoutChain") ?? "") : undefined,
      });
      router.push(`/trade/${order.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't open this order. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className={heroPanelClass}>
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80"
        >
          <ArrowLeft size={18} />
        </button>

        <p className="mt-5 text-xs font-bold uppercase tracking-wide text-white/50">
          {traderIsBuying ? "You're buying" : "You're selling"}
        </p>
        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15" style={{ color: coin?.color }}>
              {coin ? <coin.icon size={20} /> : ad.asset}
            </span>
            <span className="font-display text-2xl font-extrabold">{ad.asset}</span>
          </div>
          <div className="text-right">
            <p className="font-display text-2xl font-extrabold">{rate ? formatNgn(rate) : `±${ad.floatingMarginPct}%`}</p>
            <p className="text-xs text-white/60">{rate ? `per ${ad.asset}` : "vs. Bybit rate"}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-1.5 text-sm">
          <span className="font-bold">Thiago Exchange</span>
          <ShieldCheck size={14} className="text-gold-300" />
          <span className="text-white/50">· Verified merchant</span>
        </div>
      </div>

      <div className={heroSheetClass}>
        <div className="rounded-2xl border border-cream-300 bg-white p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-maroon-950/50">Limits</span>
            <span className="font-semibold text-maroon-950">
              {formatNgn(ad.minLimit)} – {formatNgn(ad.maxLimit)}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {chips.map((c) => (
              <span key={c} className="rounded-full bg-cream-200 px-2.5 py-1 text-[11px] font-semibold text-maroon-950/60">
                {c}
              </span>
            ))}
          </div>
          {ad.terms && <p className="mt-3 text-xs text-maroon-950/50">{ad.terms}</p>}
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4 rounded-2xl border border-cream-300 bg-white p-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="amount" className={labelClass}>
              Amount ({ad.asset})
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              step="any"
              min={0}
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={inputClass}
              inputMode="decimal"
            />
          </div>

          {estimatedFiat !== null && (
            <div className="flex items-center justify-between rounded-xl bg-cream-100 px-4 py-3">
              <span className="text-sm text-maroon-950/60">{traderIsBuying ? "You pay" : "You receive"}</span>
              <span className="font-display text-lg font-extrabold text-maroon-950">{formatNgn(estimatedFiat)}</span>
            </div>
          )}

          {traderIsBuying && (
            <>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="payoutAddress" className={labelClass}>
                  Your {ad.asset} wallet address
                </label>
                <input id="payoutAddress" name="payoutAddress" type="text" required className={inputClass} />
                <p className="text-xs text-maroon-950/50">
                  This is where we&apos;ll send your {ad.asset} once payment is confirmed.
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="payoutChain" className={labelClass}>
                  Network / chain
                </label>
                <input
                  id="payoutChain"
                  name="payoutChain"
                  type="text"
                  required
                  placeholder="e.g. TRC20, ERC20, BTC"
                  className={inputClass}
                />
              </div>
            </>
          )}

          {!traderIsBuying && (
            <p className="rounded-lg bg-gold-50 px-4 py-3 text-sm text-maroon-950/70">
              After you open this order we&apos;ll show you the deposit address to send your {ad.asset} to.
            </p>
          )}

          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className={`rounded-full py-3.5 text-center font-bold text-white transition-colors disabled:opacity-50 ${
              accent === "emerald" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
            }`}
          >
            {submitting ? "Opening order…" : `${traderIsBuying ? "Buy" : "Sell"} ${ad.asset}`}
          </button>
        </form>
      </div>
    </div>
  );
}
