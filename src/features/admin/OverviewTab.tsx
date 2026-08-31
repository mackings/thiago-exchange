"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowDownLeft, ArrowUpRight, Gavel, Loader2, ReceiptText, Store, TrendingUp, Users } from "lucide-react";
import { api, ApiError, money, type AdDTO, type DisputeDTO, type OrderDTO, type UserDTO } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { CHART_INK, SEQUENTIAL } from "@/components/dashboard/charts/palette";
import { dailySeries } from "@/lib/timeseries";

const statusBadgeTone: Record<OrderDTO["status"], { tone: BadgeProps["tone"]; label: string; barColor: string }> = {
  created: { tone: "warning", label: "Pending", barColor: "#d9861f" },
  awaiting_payment: { tone: "warning", label: "Pending", barColor: "#d9861f" },
  payment_marked: { tone: "warning", label: "Payment marked", barColor: "#b96a17" },
  payment_confirmed: { tone: "info", label: "Confirmed", barColor: "#611818" },
  released: { tone: "info", label: "Released", barColor: "#611818" },
  completed: { tone: "success", label: "Paid", barColor: "#8f5312" },
  cancelled: { tone: "neutral", label: "Cancelled", barColor: "#64748b" },
  disputed: { tone: "danger", label: "Disputed", barColor: "#7a1e1e" },
};

// created/awaiting_payment collapse to one "Pending" bucket — they render
// identically as a badge, so showing them as two separate breakdown rows
// would look like duplicated data rather than two lifecycle states.
const statusBreakdownOrder: OrderDTO["status"][] = ["awaiting_payment", "payment_marked", "payment_confirmed", "released", "completed", "cancelled", "disputed"];

function StatusBreakdown({ orders }: { orders: OrderDTO[] }) {
  const total = orders.length;
  const counts = statusBreakdownOrder.map((status) => {
    const statuses = status === "awaiting_payment" ? ["created", "awaiting_payment"] : [status];
    const count = orders.filter((o) => statuses.includes(o.status)).length;
    return { status, count, ...statusBadgeTone[status] };
  });

  return (
    <div className="space-y-3">
      {counts.map((c) => {
        const pct = total > 0 ? Math.round((c.count / total) * 100) : 0;
        return (
          <div key={c.status} className="flex items-center gap-3">
            <span className="w-32 shrink-0 truncate text-xs font-medium text-slate-600 dark:text-slate-400">{c.label}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: c.barColor }} />
            </div>
            <span className="w-9 shrink-0 text-right text-xs font-medium text-muted-foreground">{pct}%</span>
            <span className="w-6 shrink-0 text-right text-sm font-bold">{c.count}</span>
          </div>
        );
      })}
    </div>
  );
}

function TrendCard({ title, description, data, valueFormatter }: { title: string; description: string; data: { label: string; value: number }[]; valueFormatter: (v: number) => string }) {
  const hasData = data.some((d) => d.value > 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="grid h-[220px] place-items-center text-sm text-muted-foreground">No activity yet.</div>
        ) : (
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 6, right: 6, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={SEQUENTIAL.light} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={SEQUENTIAL.light} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke={CHART_INK.gridline.light} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: CHART_INK.muted.light }} axisLine={false} tickLine={false} minTickGap={24} />
                <YAxis tick={{ fontSize: 11, fill: CHART_INK.muted.light }} axisLine={false} tickLine={false} width={44} tickFormatter={valueFormatter} />
                <Tooltip
                  formatter={(value) => valueFormatter(Number(value))}
                  contentStyle={{ borderRadius: 12, border: "1px solid rgba(15,23,42,0.08)", fontSize: 12.5, boxShadow: "0 8px 24px rgba(15,23,42,0.08)" }}
                  labelStyle={{ fontWeight: 700, color: CHART_INK.primary.light }}
                />
                <Area type="monotone" dataKey="value" stroke={SEQUENTIAL.light} strokeWidth={2.5} fill={`url(#grad-${title})`} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function traderName(o: OrderDTO) {
  return (o.side === "sell" ? o.buyerName : o.sellerName) || "Trader";
}

function relativeDay(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOf(now) - startOf(date)) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString();
}

export function OverviewTab({ onError }: { onError: (message: string) => void }) {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [ads, setAds] = useState<AdDTO[]>([]);
  const [disputes, setDisputes] = useState<DisputeDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.adminListUsers(), api.adminListAllOrders(), api.listAds(), api.adminListOpenDisputes()])
      .then(([u, o, a, d]) => {
        setUsers(u);
        setOrders(o);
        setAds(a);
        setDisputes(d);
      })
      .catch((err) => onError(err instanceof ApiError ? err.message : "Couldn't load the dashboard."))
      .finally(() => setLoading(false));
  }, [onError]);

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading dashboard...
      </div>
    );
  }

  const completedOrders = orders.filter((o) => o.status === "completed");
  const completedVolume = completedOrders.reduce((sum, o) => sum + o.fiatAmount, 0);
  const volumeSeries = dailySeries(orders, (o) => o.createdAt, (o) => o.fiatAmount);
  const signupSeries = dailySeries(users, (u) => u.createdAt, () => 1);
  const sellAds = ads.filter((a) => a.side === "sell").length;
  const buyAds = ads.filter((a) => a.side === "buy").length;
  const recent = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard label="Total users" value={users.length} icon={<Users className="h-4 w-4" />} tone="maroon" />
        <StatCard label="Total orders" value={orders.length} icon={<ReceiptText className="h-4 w-4" />} tone="slate" />
        <StatCard label="Completed volume" value={money(completedVolume)} icon={<TrendingUp className="h-4 w-4" />} tone="gold" />
        <StatCard label="Active ads" value={ads.length} icon={<Store className="h-4 w-4" />} tone="maroonMuted" />
        <StatCard label="Open disputes" value={disputes.length} icon={<Gavel className="h-4 w-4" />} tone="maroonStrong" />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <TrendCard title="Order volume" description="Fiat value of orders opened, last 30 days" data={volumeSeries} valueFormatter={(v) => money(v)} />
        <TrendCard title="New signups" description="Users registered, last 30 days" data={signupSeries} valueFormatter={(v) => String(v)} />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Orders by status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBreakdown orders={orders} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ads by side</CardTitle>
          </CardHeader>
          <CardContent>
            {ads.length === 0 ? (
              <p className="text-sm text-muted-foreground">No ads yet.</p>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-32 shrink-0 text-xs font-medium text-slate-600 dark:text-slate-400">Sell ads</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-full rounded-full bg-maroon-700" style={{ width: `${ads.length ? (sellAds / ads.length) * 100 : 0}%` }} />
                  </div>
                  <span className="w-6 shrink-0 text-right text-sm font-bold">{sellAds}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-32 shrink-0 text-xs font-medium text-slate-600 dark:text-slate-400">Buy ads</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-full rounded-full bg-gold-500" style={{ width: `${ads.length ? (buyAds / ads.length) * 100 : 0}%` }} />
                  </div>
                  <span className="w-6 shrink-0 text-right text-sm font-bold">{buyAds}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent transactions</CardTitle>
          <CardDescription>Latest {recent.length} of {orders.length} orders</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {recent.length === 0 ? (
            <p className="px-4 pb-4 text-sm text-muted-foreground">No transactions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-t border-slate-200/70 text-left text-xs text-muted-foreground dark:border-slate-800">
                    <th className="px-4 py-2 font-medium">Trader</th>
                    <th className="px-4 py-2 font-medium">Amount</th>
                    <th className="px-4 py-2 font-medium">Fiat</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                    <th className="px-4 py-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((o) => (
                    <tr key={o.id} className="border-t border-slate-200/70 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1.5">
                          {o.side === "buy" ? (
                            <ArrowDownLeft className="h-3.5 w-3.5 text-gold-600" />
                          ) : (
                            <ArrowUpRight className="h-3.5 w-3.5 text-maroon-700" />
                          )}
                          <span className="font-medium">{traderName(o)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs">{o.amount} {o.asset}</td>
                      <td className="px-4 py-2.5">{money(o.fiatAmount)}</td>
                      <td className="px-4 py-2.5">
                        <Badge tone={statusBadgeTone[o.status].tone}>{statusBadgeTone[o.status].label}</Badge>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">{relativeDay(o.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
