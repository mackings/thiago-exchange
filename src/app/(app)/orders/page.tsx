"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, type OrderDTO } from "@/lib/api";
import { formatNgn } from "@/lib/format";
import { cardClass } from "@/lib/ui";

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

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-maroon-950">My Orders</h1>

      <div className="mt-5 flex flex-col gap-3">
        {loading && <p className="text-sm text-maroon-950/50">Loading orders…</p>}
        {!loading && orders.length === 0 && (
          <p className={`${cardClass} text-sm text-maroon-950/50`}>
            No orders yet —{" "}
            <Link href="/market" className="font-bold text-maroon-700 underline">
              browse the market
            </Link>{" "}
            to get started.
          </p>
        )}
        {orders.map((o) => (
          <Link
            key={o.id}
            href={`/trade/${o.id}`}
            className={`${cardClass} flex items-center justify-between transition hover:-translate-y-0.5 hover:border-gold-300/60 hover:shadow-md`}
          >
            <div>
              <p className="font-bold text-maroon-950">
                {o.amount} {o.asset} · {formatNgn(o.fiatAmount)}
              </p>
              <p className="text-xs text-maroon-950/50">{new Date(o.createdAt).toLocaleString()}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusColor[o.status]}`}>
              {statusLabels[o.status]}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
