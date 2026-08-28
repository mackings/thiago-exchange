"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { api, ApiError, type AdDTO } from "@/lib/api";
import { coins } from "@/lib/coins";
import { formatNgn } from "@/lib/format";
import { cardClass, inputClass, labelClass, primaryButtonClass } from "@/lib/ui";

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

  if (loading) return <p className="text-sm text-maroon-950/50">Loading offer…</p>;
  if (error || !ad) return <p className="text-sm font-semibold text-red-600">{error || "Offer not found."}</p>;

  const coin = coins.find((c) => c.symbol === ad.asset);
  // ad.side === "sell" means Thiago is selling, so the trader here is buying
  // (and needs to tell us where to pay them out).
  const traderIsBuying = ad.side === "sell";
  const rate = ad.rateType === "fixed" ? ad.fixedRate : null;
  const estimatedFiat = rate && amount ? Number(amount) * rate : null;

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
    <div className="flex flex-col gap-5">
      <div className={cardClass}>
        <div className="flex items-center gap-3">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-full bg-cream-200"
            style={{ color: coin?.color }}
          >
            {coin ? <coin.icon size={24} /> : ad.asset}
          </span>
          <div>
            <h1 className="font-display text-xl font-extrabold text-maroon-950">
              {traderIsBuying ? "Buy" : "Sell"} {ad.asset}
            </h1>
            <p className="text-sm text-maroon-950/50">
              {rate ? `${formatNgn(rate)} per ${ad.asset}` : `Bybit rate ± ${ad.floatingMarginPct}%`}
            </p>
          </div>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-cream-200 pt-4 text-sm">
          <div>
            <dt className="text-maroon-950/50">Limits</dt>
            <dd className="font-semibold text-maroon-950">
              {formatNgn(ad.minLimit)} – {formatNgn(ad.maxLimit)}
            </dd>
          </div>
          <div>
            <dt className="text-maroon-950/50">Payment method</dt>
            <dd className="font-semibold text-maroon-950">{ad.paymentMethods || "Bank transfer"}</dd>
          </div>
          {ad.terms && (
            <div className="col-span-2">
              <dt className="text-maroon-950/50">Terms</dt>
              <dd className="text-maroon-950">{ad.terms}</dd>
            </div>
          )}
        </dl>
      </div>

      <form onSubmit={handleSubmit} className={`${cardClass} flex flex-col gap-4`}>
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
          />
          {estimatedFiat !== null && (
            <p className="text-xs text-maroon-950/50">≈ {formatNgn(estimatedFiat)}</p>
          )}
        </div>

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

        <button type="submit" disabled={submitting} className={primaryButtonClass}>
          {submitting ? "Opening order…" : `${traderIsBuying ? "Buy" : "Sell"} ${ad.asset}`}
          <ArrowRight size={18} />
        </button>
      </form>
    </div>
  );
}
