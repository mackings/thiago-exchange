"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, Copy } from "lucide-react";
import { api, ApiError, type OrderDTO } from "@/lib/api";
import { useSession } from "@/lib/session-context";
import { useTradeSocket } from "@/hooks/useTradeSocket";
import OrderStatusStepper from "@/components/app/OrderStatusStepper";
import TradeChat from "@/components/app/TradeChat";
import CountdownTimer from "@/components/app/CountdownTimer";
import {
  cardClass,
  heroPanelClass,
  heroSheetClass,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/lib/ui";
import { formatNgn } from "@/lib/format";

export default function TradeRoomPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  const { user } = useSession();
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    try {
      const [o, msgs] = await Promise.all([api.getOrder(orderId), api.getMessages(orderId)]);
      setOrder(o);
      return msgs;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load this order.");
      return [];
    }
  }, [orderId]);

  const [initialMessages, setInitialMessages] = useState<Awaited<ReturnType<typeof reload>>>([]);

  useEffect(() => {
    setLoading(true);
    reload()
      .then(setInitialMessages)
      .finally(() => setLoading(false));
  }, [reload]);

  const { messages, connected, send } = useTradeSocket(orderId, initialMessages);

  if (loading) return <p className="text-sm text-maroon-950/50">Loading order…</p>;
  if (error || !order || !user) return <p className="text-sm font-semibold text-red-600">{error}</p>;

  const isBuyer = order.buyerId === user.id;
  const isSeller = order.sellerId === user.id;
  const isAdmin = user.role === "admin";
  // order.side === "sell" means Thiago is selling, so the non-admin trader
  // on this order is buying — mirrors the accent logic on the ad/market pages.
  const traderIsBuying = order.side === "sell";
  const accent = traderIsBuying ? "emerald" : "rose";

  async function runAction(fn: () => Promise<OrderDTO>) {
    setBusy(true);
    setError("");
    try {
      const updated = await fn();
      setOrder(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "That didn't work — try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className={heroPanelClass}>
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Back"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80"
          >
            <ArrowLeft size={18} />
          </button>
          {["awaiting_payment", "payment_marked"].includes(order.status) && (
            <CountdownTimer deadline={order.paymentDeadline} />
          )}
        </div>

        <p className="mt-5 text-xs font-bold uppercase tracking-wide text-white/50">
          {traderIsBuying ? "Buying" : "Selling"}
        </p>
        <div className="flex items-end justify-between">
          <h1 className="font-display text-2xl font-extrabold">
            {order.amount} {order.asset}
          </h1>
          <div className="text-right">
            <p className="font-display text-xl font-extrabold">{formatNgn(order.fiatAmount)}</p>
            <p className="text-xs text-white/60">rate {formatNgn(order.rate)}</p>
          </div>
        </div>
        <span
          className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold text-white ${
            accent === "emerald" ? "bg-emerald-500" : "bg-rose-500"
          }`}
        >
          {traderIsBuying ? "Buy order" : "Sell order"} · #{order.id.slice(0, 8)}
        </span>
      </div>

      <div className={heroSheetClass}>
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-cream-300 bg-white p-4">
            <OrderStatusStepper status={order.status} />
          </div>

          {order.side === "sell" && isBuyer && order.status === "awaiting_payment" && (
            <MarkPaidPanel onSubmit={(url) => runAction(() => api.markPaid(order.id, url))} busy={busy} />
          )}

          {order.side === "buy" && isSeller && order.status === "awaiting_payment" && (
            <DepositPanel
              orderId={order.id}
              onSubmit={(txId) => runAction(() => api.submitDeposit(order.id, txId))}
              busy={busy}
            />
          )}

          {order.side === "sell" && isAdmin && order.status === "payment_marked" && (
            <ActionCard
              title="Confirm payment received"
              description="Check your bank account for the buyer's transfer before confirming."
            >
              <button
                className={primaryButtonClass}
                disabled={busy}
                onClick={() => runAction(() => api.confirmPayment(order.id))}
              >
                Confirm payment received
              </button>
            </ActionCard>
          )}

          {isAdmin && order.status === "payment_confirmed" && (
            <ActionCard
              title={order.side === "sell" ? "Release crypto to buyer" : "Confirm and credit inventory"}
              description={
                order.side === "sell"
                  ? "This sends the real Bybit withdrawal to the buyer's address. Make sure it's whitelisted on Bybit first."
                  : "Marks this as done and credits the verified deposit to Thiago's available balance. Remember to send the seller their NGN payout separately."
              }
            >
              <button
                className={primaryButtonClass}
                disabled={busy}
                onClick={() => runAction(() => api.adminReleaseOrder(order.id))}
              >
                {order.side === "sell" ? "Release crypto" : "Confirm & credit"}
              </button>
            </ActionCard>
          )}

          {(isBuyer || isSeller) && (order.status === "created" || order.status === "awaiting_payment") && (
            <button
              className={`${secondaryButtonClass} self-start`}
              disabled={busy}
              onClick={() => runAction(() => api.cancelOrder(order.id))}
            >
              Cancel order
            </button>
          )}

          {(isBuyer || isSeller) &&
            ["awaiting_payment", "payment_marked", "payment_confirmed"].includes(order.status) && (
              <DisputePanel
                onSubmit={(reason) =>
                  runAction(() => api.raiseDispute(order.id, reason).then(() => api.getOrder(order.id)))
                }
              />
            )}

          <TradeChat messages={messages} currentUserId={user.id} connected={connected} onSend={send} />
        </div>
      </div>
    </div>
  );
}

function ActionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`${cardClass} border-gold-300/60 bg-gold-50`}>
      <p className="font-bold text-maroon-950">{title}</p>
      <p className="mt-1 text-sm text-maroon-950/60">{description}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function MarkPaidPanel({ onSubmit, busy }: { onSubmit: (proofUrl: string) => void; busy: boolean }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState("");

  async function handleSubmit() {
    if (!file) {
      setLocalError("Attach your payment receipt first.");
      return;
    }
    setUploading(true);
    setLocalError("");
    try {
      const { url } = await api.upload(file);
      onSubmit(url);
    } catch {
      setLocalError("Couldn't upload that file — try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <ActionCard title="Mark as paid" description="Upload proof of your bank transfer, then confirm.">
      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="block text-sm text-maroon-950/70 file:mr-3 file:rounded-full file:border-0 file:bg-maroon-700 file:px-4 file:py-2 file:text-sm file:font-bold file:text-cream-50"
      />
      {localError && <p className="mt-2 text-sm font-semibold text-red-600">{localError}</p>}
      <button className={`${primaryButtonClass} mt-3`} disabled={busy || uploading} onClick={handleSubmit}>
        {uploading ? "Uploading…" : "I've paid — notify seller"}
      </button>
    </ActionCard>
  );
}

function DepositPanel({
  orderId,
  onSubmit,
  busy,
}: {
  orderId: string;
  onSubmit: (txId: string) => void;
  busy: boolean;
}) {
  const [instructions, setInstructions] = useState<{ address: string; chain: string; tag: string } | null>(null);
  const [loadError, setLoadError] = useState("");
  const [txId, setTxId] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api
      .depositInstructions(orderId)
      .then(setInstructions)
      .catch((err) =>
        setLoadError(
          err instanceof ApiError
            ? err.message
            : "Couldn't load a deposit address right now — try again shortly."
        )
      );
  }, [orderId]);

  return (
    <ActionCard title="Send crypto to Thiago Exchange" description="Send to the address below, then submit your transaction hash.">
      {loadError && <p className="text-sm font-semibold text-red-600">{loadError}</p>}
      {instructions && (
        <div className="mb-3 flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2.5">
          <code className="truncate text-xs text-maroon-950">{instructions.address}</code>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(instructions.address);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="shrink-0 text-maroon-700"
            aria-label="Copy address"
          >
            <Copy size={16} />
          </button>
        </div>
      )}
      {copied && <p className="mb-2 text-xs font-semibold text-emerald-600">Copied!</p>}
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={txId}
          onChange={(e) => setTxId(e.target.value)}
          placeholder="Transaction hash"
          className={`${inputClass} flex-1`}
        />
        <button
          className={primaryButtonClass}
          disabled={busy || !txId.trim()}
          onClick={() => onSubmit(txId.trim())}
        >
          Submit
        </button>
      </div>
    </ActionCard>
  );
}

function DisputePanel({ onSubmit }: { onSubmit: (reason: string) => void }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-red-600 hover:underline"
      >
        <AlertTriangle size={14} />
        Something wrong? Raise a dispute
      </button>
    );
  }

  return (
    <ActionCard title="Raise a dispute" description="Tell us what's wrong — our team will step in.">
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={3}
        className={`${inputClass} w-full resize-none`}
        placeholder="Describe the issue…"
      />
      <button
        className={`${primaryButtonClass} mt-3`}
        disabled={!reason.trim()}
        onClick={() => reason.trim() && onSubmit(reason.trim())}
      >
        Submit dispute
      </button>
    </ActionCard>
  );
}
