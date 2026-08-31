"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Loader2, MessageSquare, Receipt, ShieldCheck, ShieldQuestion, Wallet } from "lucide-react";
import { api, ApiError, money, type MessageDTO, type OrderDTO, type WhitelistedAddressDTO } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { CoinIcon } from "@/components/muiapp/CoinIcon";
import { useTradeSocket } from "@/hooks/useTradeSocket";
import { TradeChat } from "@/features/trades/TradeChat";

const statusBadgeTone: Record<OrderDTO["status"], { tone: BadgeProps["tone"]; label: string }> = {
  created: { tone: "warning", label: "Pending" },
  awaiting_payment: { tone: "warning", label: "Pending" },
  payment_marked: { tone: "warning", label: "Payment marked" },
  payment_confirmed: { tone: "info", label: "Confirmed" },
  released: { tone: "info", label: "Released" },
  completed: { tone: "success", label: "Paid" },
  cancelled: { tone: "neutral", label: "Cancelled" },
  disputed: { tone: "danger", label: "Disputed" },
};

export function TradesTab({
  currentUserId,
  onError,
  onSuccess,
}: {
  currentUserId: string;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}) {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderDTO | null>(null);
  const [chatMessages, setChatMessages] = useState<MessageDTO[]>([]);
  const [whitelist, setWhitelist] = useState<WhitelistedAddressDTO[]>([]);
  const [whitelisting, setWhitelisting] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      setOrders(await api.adminListOrders());
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Couldn't load orders.");
    } finally {
      setLoading(false);
    }
  }, [onError]);

  const loadWhitelist = useCallback(async () => {
    try {
      setWhitelist(await api.adminListWhitelist());
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Couldn't load the address whitelist.");
    }
  }, [onError]);

  useEffect(() => {
    loadOrders();
    loadWhitelist();
  }, [loadOrders, loadWhitelist]);

  function isWhitelisted(address: string) {
    return whitelist.some((w) => w.address === address);
  }

  async function markWhitelisted(order: OrderDTO) {
    if (!order.payoutAddress) return;
    setWhitelisting(order.id);
    try {
      await api.adminMarkWhitelisted({ address: order.payoutAddress, chain: order.payoutChain || "", asset: order.asset });
      await loadWhitelist();
      onSuccess("Address marked whitelisted — release is unblocked.");
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Couldn't record that whitelist entry.");
    } finally {
      setWhitelisting(null);
    }
  }

  async function confirmPayment(order: OrderDTO) {
    try {
      const updated = await api.confirmPayment(order.id);
      setOrders((items) => items.map((item) => (item.id === updated.id ? updated : item)));
      onSuccess("Payment confirmed.");
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Couldn't confirm payment.");
    }
  }

  async function release(order: OrderDTO) {
    try {
      const updated = await api.adminReleaseOrder(order.id);
      setOrders((items) => items.map((item) => (item.id === updated.id ? updated : item)));
      onSuccess("Order released.");
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Couldn't release that order.");
    }
  }

  function openChat(order: OrderDTO) {
    setSelectedOrder(order);
    api.getMessages(order.id).then(setChatMessages).catch(() => setChatMessages([]));
  }

  const socket = useTradeSocket(selectedOrder?.id ?? "", chatMessages);

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading trades...
      </div>
    );
  }

  const actionOrders = orders.filter((order) => ["payment_marked", "payment_confirmed", "disputed"].includes(order.status)).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard label="Orders needing action" value={actionOrders} icon={<AlertTriangle className="h-4 w-4" />} tone="maroonStrong" />
        <StatCard label="Orders in flight" value={orders.length} icon={<Receipt className="h-4 w-4" />} tone="slate" />
        <StatCard label="Whitelisted addresses" value={whitelist.length} icon={<ShieldCheck className="h-4 w-4" />} tone="gold" />
      </div>

      {selectedOrder && (
        <div className="space-y-2">
          <TradeChat
            order={selectedOrder}
            messages={socket.messages}
            currentUserId={currentUserId}
            isAdmin
            connected={socket.connected}
            onSend={socket.send}
            onOrder={(updated) => {
              setSelectedOrder(updated);
              setOrders((items) => items.map((item) => (item.id === updated.id ? updated : item)));
            }}
            onRefresh={loadOrders}
            onError={onError}
            compact
          />
          <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)}>Close chat</Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Verify trades</CardTitle>
          <CardDescription>Trades needing action, newest first.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {orders.length === 0 && (
            <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-muted-foreground dark:border-slate-700 dark:bg-slate-800/40">
              No orders in flight.
            </p>
          )}
          {orders.map((order) => {
            const badge = statusBadgeTone[order.status];
            const needsWhitelist = order.status === "payment_confirmed" && order.side === "sell" && order.payoutAddress && !isWhitelisted(order.payoutAddress);
            const canRelease = order.status === "payment_confirmed" && (order.side !== "sell" || !order.payoutAddress || isWhitelisted(order.payoutAddress));
            return (
              <div key={order.id} className="rounded-xl border border-slate-200/70 p-3 dark:border-slate-800 sm:p-4">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div className="space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <CoinIcon coin={order.asset} size={24} />
                      <span className="text-sm font-bold">{order.amount} {order.asset}</span>
                      <Badge tone={badge.tone}>{badge.label}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {money(order.fiatAmount)} · {order.depositTxId || order.paymentProofUrl ? "proof submitted" : "no proof yet"}
                    </p>
                    <p className="font-mono text-[11px] text-muted-foreground">{order.id.slice(0, 10)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    <Button variant="outline" size="sm" onClick={() => openChat(order)}>
                      <MessageSquare className="h-3.5 w-3.5" /> Chat
                    </Button>
                    {order.side === "sell" && order.status === "payment_marked" && (
                      <Button variant="outline" size="sm" onClick={() => confirmPayment(order)}>
                        <ShieldCheck className="h-3.5 w-3.5" /> Confirm
                      </Button>
                    )}
                    {needsWhitelist && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={whitelisting === order.id}
                        onClick={() => markWhitelisted(order)}
                        title="First add & confirm this address in Bybit's Address Book yourself — this button only tells our system you've done that, it doesn't call Bybit."
                        className="border-gold-400 text-gold-700 hover:bg-gold-50 dark:text-gold-300"
                      >
                        <ShieldQuestion className="h-3.5 w-3.5" /> {whitelisting === order.id ? "Marking..." : "Mark whitelisted"}
                      </Button>
                    )}
                    {canRelease && (
                      <Button size="sm" onClick={() => release(order)} className="bg-maroon-700 text-white hover:bg-maroon-800">
                        <Wallet className="h-3.5 w-3.5" /> Release
                      </Button>
                    )}
                    {order.status === "disputed" && <Badge tone="danger">Disputed</Badge>}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
