"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { api, ApiError, type AdDTO } from "@/lib/api";
import { coins } from "@/lib/coins";
import { formatNgn } from "@/lib/format";
import { inputClass, labelClass } from "@/lib/ui";

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

  if (loading) return <p className="text-sm text-maroon-950/50">Loading offer…</p>;
  if (error || !ad) return <p className="text-sm font-semibold text-red-600">{error || "Offer not found."}</p>;

  const coin = coins.find((c) => c.symbol === ad.asset);
  // ad.side === "sell" means Thiago is selling, so the trader here is buying
  // (and needs to tell us where to pay them out).
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
    <div className="flex flex-col gap-5">
      <div className={`overflow-hidden rounded-2xl border ${accent === "emerald" ? "border-emerald-200" : "border-rose-200"} bg-white`}>
        <div className={`px-5 py-4 ${accent === "emerald" ? "bg-emerald-600" : "bg-rose-600"}`}>
          <p className="text-xs font-bold uppercase tracking-wide text-white/70">
            {traderIsBuying ? "You're buying" : "You're selling"}
          </p>
          <div className="mt-1 flex items-end justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white" style={{ color: coin?.color }}>
                {coin ? <coin.icon size={18} /> : ad.asset}
              </span>
              <span className="font-display text-xl font-extrabold text-white">{ad.asset}</span>
            </div>
            <div className="text-right">
              <p className="font-display text-2xl font-extrabold text-white">
                {rate ? formatNgn(rate) : `±${ad.floatingMarginPct}%`}
              </p>
              <p className="text-xs text-white/70">{rate ? `per ${ad.asset}` : "vs. Bybit rate"}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 border-b border-cream-200 px-5 py-3">
          <p className="text-sm font-bold text-maroon-950">Thiago Exchange</p>
          <ShieldCheck size={14} className="text-emerald-600" />
          <span className="text-xs text-maroon-950/40">· Verified merchant</span>
        </div>

        <dl className="grid grid-cols-2 gap-3 px-5 py-4 text-sm">
          <div>
            <dt className="text-maroon-950/50">Limits</dt>
            <dd className="font-semibold text-maroon-950">
              {formatNgn(ad.minLimit)} – {formatNgn(ad.maxLimit)}
            </dd>
          </div>
          <div>
            <dt className="text-maroon-950/50">Payment method</dt>
            <dd className="mt-1 flex flex-wrap gap-1">
              {chips.map((c) => (
                <span key={c} className="rounded-full bg-cream-200 px-2 py-0.5 text-[11px] font-semibold text-maroon-950/60">
                  {c}
                </span>
              ))}
            </dd>
          </div>
          {ad.terms && (
            <div className="col-span-2">
              <dt className="text-maroon-950/50">Terms</dt>
              <dd className="text-maroon-950">{ad.terms}</dd>
            </div>
          )}
        </dl>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-cream-300 bg-white p-5">
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
  );
}
