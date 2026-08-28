"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { api, ApiError, type AdDTO } from "@/lib/api";
import { coins } from "@/lib/coins";
import { formatNgn } from "@/lib/format";
import { flatBoxClass, inputClass, primaryButtonClass, topBarClass } from "@/lib/ui";

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
  const [payoutAddress, setPayoutAddress] = useState("");
  const [payoutChain, setPayoutChain] = useState("");

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
  const numericAmount = Number(amount);
  const estimatedFiat = rate && numericAmount > 0 ? numericAmount * rate : null;

  const withinLimits = estimatedFiat !== null && estimatedFiat >= ad.minLimit && estimatedFiat <= ad.maxLimit;
  const canSubmit =
    numericAmount > 0 && (rate === null || withinLimits) && (!traderIsBuying || (payoutAddress.trim() && payoutChain.trim()));

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!ad || !canSubmit) return;
    setError("");
    setSubmitting(true);
    try {
      const order = await api.createOrder({
        adId: ad.id,
        assetAmount: numericAmount,
        payoutAddress: traderIsBuying ? payoutAddress.trim() : undefined,
        payoutChain: traderIsBuying ? payoutChain.trim() : undefined,
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
      <div className={topBarClass}>
        <button type="button" onClick={() => router.back()} aria-label="Back" className="text-maroon-950">
          <ArrowLeft size={20} />
        </button>
        <span className="text-sm font-bold text-maroon-950">{traderIsBuying ? "Buy" : "Sell"} {ad.asset}</span>
        <span className="w-5" />
      </div>

      <div className="px-4">
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-maroon-950/50">Price</span>
          <div className="flex items-center gap-2">
            <span className={`font-display text-xl font-extrabold ${accent === "emerald" ? "text-emerald-600" : "text-rose-600"}`}>
              {rate ? formatNgn(rate) : `Bybit ± ${ad.floatingMarginPct}%`}
            </span>
            {!rate && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">LIVE</span>
            )}
          </div>
        </div>

        {!rate && (
          <div className="mb-3 rounded-xl bg-gold-50 px-3.5 py-2.5 text-xs text-gold-800">
            This price tracks Bybit's live rate with a {ad.floatingMarginPct}% margin, and is finalized the moment you
            open the order.
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className={flatBoxClass}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-maroon-950/50">Amount</span>
              <span className="text-xs text-maroon-950/40">
                Limit {formatNgn(ad.minLimit)}–{formatNgn(ad.maxLimit)}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between gap-2">
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
                step="any"
                min={0}
                inputMode="decimal"
                placeholder="0.00"
                required
                className="w-full bg-transparent font-display text-2xl font-extrabold text-maroon-950 outline-none placeholder:text-maroon-950/25"
              />
              <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-bold text-maroon-950">
                {coin && <coin.icon size={14} style={{ color: coin.color }} />}
                {ad.asset}
              </span>
            </div>
          </div>

          <div className={flatBoxClass}>
            <span className="text-xs font-semibold text-maroon-950/50">{traderIsBuying ? "I will pay" : "I will receive"}</span>
            <div className="mt-1 flex items-center justify-between gap-2">
              <span className="font-display text-2xl font-extrabold text-maroon-950">
                {estimatedFiat !== null ? estimatedFiat.toLocaleString() : "0.00"}
              </span>
              <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-sm font-bold text-maroon-950">NGN</span>
            </div>
          </div>

          {estimatedFiat !== null && !withinLimits && (
            <p className="text-xs font-semibold text-rose-600">
              Amount must be between {formatNgn(ad.minLimit)} and {formatNgn(ad.maxLimit)}.
            </p>
          )}

          {traderIsBuying && (
            <>
              <input
                value={payoutAddress}
                onChange={(e) => setPayoutAddress(e.target.value)}
                type="text"
                required
                placeholder={`Your ${ad.asset} wallet address`}
                className={inputClass}
              />
              <input
                value={payoutChain}
                onChange={(e) => setPayoutChain(e.target.value)}
                type="text"
                required
                placeholder="Network / chain (e.g. TRC20, ERC20, BTC)"
                className={inputClass}
              />
            </>
          )}

          <div className="mt-1 flex items-center justify-between rounded-xl bg-cream-100 px-3.5 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-maroon-700 text-xs font-bold text-white">
                TE
              </span>
              <span className="text-sm font-bold text-maroon-950">Thiago Exchange</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-600">
              <ShieldCheck size={14} />
              <span className="text-xs font-semibold">Verified</span>
            </div>
          </div>

          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

          <button type="submit" disabled={submitting || !canSubmit} className={`${primaryButtonClass} mt-2`}>
            {submitting ? "Opening order…" : `${traderIsBuying ? "Buy" : "Sell"} ${ad.asset}`}
          </button>

          <p className="flex items-center justify-center gap-1.5 pb-6 pt-1 text-xs text-maroon-950/40">
            <ShieldCheck size={13} />
            Escrow-protected trade
          </p>
        </form>
      </div>
    </div>
  );
}
