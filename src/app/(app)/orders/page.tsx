"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, type OrderDTO } from "@/lib/api";
import { coins } from "@/lib/coins";
import { formatNgn } from "@/lib/format";
import { pageClass, topBarClass } from "@/lib/ui";
import { Skeleton } from "@/components/app/Skeleton";

const statusLabels: Record<OrderDTO["status"], string> = {
  created: "Created",
  awaiting_payment: "Awaiting payment",
  payment_marked: "Payment marked",
  payment_confirmed: "Confirmed",
  released: "Released",
  completed: "Completed",
  cancelled: "Cancelled",
  disputed: "Disputed",
};

const statusColor: Record<OrderDTO["status"], string> = {
  created: "bg-cream-200 text-maroon-950/60",
  awaiting_payment: "bg-gold-100 text-gold-700",
  payment_marked: "bg-gold-100 text-gold-700",
  payment_confirmed: "bg-blue-100 text-blue-700",
  released: "bg-emerald-100 text-emerald-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-cream-200 text-maroon-950/50",
  disputed: "bg-red-100 text-red-700",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .listMyOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  const openCount = orders.filter((o) => !["completed", "cancelled"].includes(o.status)).length;

  return (
    <div>
      <div className={topBarClass}>
        <h1 className="font-display text-xl font-extrabold text-maroon-950">My Orders</h1>
        <span className="text-xs font-semibold text-maroon-950/40">
          {orders.length} total · {openCount} active
        </span>
      </div>

      <div className={pageClass}>
        <div className="flex flex-col divide-y divide-cream-200">
          {loading && (
            <>
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </>
          )}
          {!loading && orders.length === 0 && (
            <p className="rounded-xl bg-cream-200/60 p-6 text-center text-sm text-maroon-950/50">
              No orders yet —{" "}
              <Link href="/market" className="font-bold text-maroon-700 underline">
                browse the market
              </Link>{" "}
              to get started.
            </p>
          )}
          {orders.map((o) => {
            const coin = coins.find((c) => c.symbol === o.asset);
            return (
              <Link key={o.id} href={`/trade/${o.id}`} className="flex items-center justify-between py-4 active:opacity-70">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream-200"
                    style={{ color: coin?.color }}
                  >
                    {coin ? <coin.icon size={20} /> : o.asset}
                  </span>
                  <div>
                    <p className="font-bold text-maroon-950">
                      {o.amount} {o.asset} · {formatNgn(o.fiatAmount)}
                    </p>
                    <p className="text-xs text-maroon-950/50">{new Date(o.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusColor[o.status]}`}>
                  {statusLabels[o.status]}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
