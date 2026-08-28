"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError, type AdDTO, type DisputeDTO, type KYCDTO } from "@/lib/api";
import { useSession } from "@/lib/session-context";
import { cardClass, inputClass, labelClass, pageClass, primaryButtonClass, secondaryButtonClass, topBarClass } from "@/lib/ui";
import { formatNgn } from "@/lib/format";

type Tab = "ads" | "kyc" | "disputes" | "treasury";

export default function AdminPage() {
  const { user } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("ads");

  useEffect(() => {
    if (user && user.role !== "admin") router.replace("/market");
  }, [user, router]);

  if (!user || user.role !== "admin") return null;

  const tabs: { key: Tab; label: string }[] = [
    { key: "ads", label: "Ads" },
    { key: "kyc", label: "KYC Review" },
    { key: "disputes", label: "Disputes" },
    { key: "treasury", label: "Treasury" },
  ];

  return (
    <div>
      <div className={topBarClass}>
        <h1 className="font-display text-xl font-extrabold text-maroon-950">Admin</h1>
        <span className="text-xs font-semibold text-maroon-950/40">Merchant console</span>
      </div>
      <div className={pageClass}>
        <div className="flex gap-1 overflow-x-auto rounded-full bg-cream-200/70 p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                tab === t.key ? "bg-maroon-700 text-cream-50" : "text-maroon-950/60"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="mt-5">
          {tab === "ads" && <AdsTab />}
          {tab === "kyc" && <KycTab />}
          {tab === "disputes" && <DisputesTab />}
          {tab === "treasury" && <TreasuryTab />}
        </div>
      </div>
    </div>
  );
}

function AdsTab() {
  const [ads, setAds] = useState<AdDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
    api
      .adminListMyAds()
      .then(setAds)
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const data = new FormData(e.currentTarget);
    const rateType = String(data.get("rateType"));
    try {
      await api.adminCreateAd({
        side: data.get("side") as AdDTO["side"],
        asset: String(data.get("asset")).toUpperCase(),
        fiat: "NGN",
        rateType: rateType as AdDTO["rateType"],
        fixedRate: rateType === "fixed" ? Number(data.get("fixedRate")) : 0,
        floatingMarginPct: rateType === "floating_margin" ? Number(data.get("floatingMarginPct")) : 0,
        minLimit: Number(data.get("minLimit")),
        maxLimit: Number(data.get("maxLimit")),
        availableAmount: Number(data.get("availableAmount")),
        paymentMethods: String(data.get("paymentMethods") ?? ""),
        terms: String(data.get("terms") ?? ""),
      });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create ad.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleStatus(ad: AdDTO) {
    const status = ad.status === "active" ? "paused" : "active";
    await api.adminUpdateAd(ad.id, { status });
    load();
  }

  return (
    <div className="flex flex-col gap-4">
      <button className={`${secondaryButtonClass} self-start`} onClick={() => setShowForm((v) => !v)}>
        {showForm ? "Cancel" : "New ad"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className={`${cardClass} grid grid-cols-1 gap-4 sm:grid-cols-2`}>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Side</label>
            <select name="side" required defaultValue="sell" className={inputClass}>
              <option value="sell">Sell (we sell to users)</option>
              <option value="buy">Buy (we buy from users)</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Asset</label>
            <input name="asset" required placeholder="USDT" className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Rate type</label>
            <select name="rateType" required defaultValue="fixed" className={inputClass}>
              <option value="fixed">Fixed rate</option>
              <option value="floating_margin">Floating (Bybit ± margin)</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Fixed rate (NGN) / Margin (%)</label>
            <input name="fixedRate" type="number" step="any" className={inputClass} placeholder="e.g. 1600" />
            <input
              name="floatingMarginPct"
              type="number"
              step="any"
              className={inputClass}
              placeholder="e.g. 1.5 (used if floating)"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Min limit (NGN)</label>
            <input name="minLimit" type="number" step="any" required className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Max limit (NGN)</label>
            <input name="maxLimit" type="number" step="any" required className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Available amount ({"asset"})</label>
            <input name="availableAmount" type="number" step="any" required className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Payment methods</label>
            <input name="paymentMethods" placeholder="bank_transfer" className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className={labelClass}>Terms</label>
            <textarea name="terms" rows={2} className={`${inputClass} resize-none`} />
          </div>
          {error && <p className="text-sm font-semibold text-red-600 sm:col-span-2">{error}</p>}
          <button type="submit" disabled={submitting} className={`${primaryButtonClass} sm:col-span-2`}>
            {submitting ? "Creating…" : "Create ad"}
          </button>
        </form>
      )}

      {loading && <p className="text-sm text-maroon-950/50">Loading ads…</p>}
      {!loading &&
        ads.map((ad) => (
          <div key={ad.id} className={`${cardClass} flex items-center justify-between`}>
            <div>
              <p className="font-bold text-maroon-950">
                {ad.side === "sell" ? "Sell" : "Buy"} {ad.asset} — {ad.status}
              </p>
              <p className="text-xs text-maroon-950/50">
                {ad.rateType === "fixed" ? formatNgn(ad.fixedRate) : `${ad.floatingMarginPct}% margin`} · available{" "}
                {ad.availableAmount} {ad.asset}
              </p>
            </div>
            <button className={secondaryButtonClass} onClick={() => toggleStatus(ad)}>
              {ad.status === "active" ? "Pause" : "Activate"}
            </button>
          </div>
        ))}
    </div>
  );
}

function KycTab() {
  const [items, setItems] = useState<KYCDTO[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api
      .adminListPendingKYC()
      .then(setItems)
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function review(id: string, approve: boolean) {
    await api.adminReviewKYC(id, approve, approve ? "" : "Document unclear — please resubmit");
    load();
  }

  if (loading) return <p className="text-sm text-maroon-950/50">Loading…</p>;
  if (items.length === 0) return <p className={`${cardClass} text-sm text-maroon-950/50`}>No pending submissions.</p>;

  return (
    <div className="flex flex-col gap-3">
      {items.map((k) => (
        <div key={k.id} className={cardClass}>
          <p className="font-bold text-maroon-950">{k.fullName}</p>
          <p className="text-sm text-maroon-950/60">
            {k.idType} · {k.idNumber}
          </p>
          <a href={k.documentUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block text-sm text-maroon-700 underline">
            View document
          </a>
          <div className="mt-3 flex gap-2">
            <button className={primaryButtonClass} onClick={() => review(k.id, true)}>
              Approve
            </button>
            <button className={secondaryButtonClass} onClick={() => review(k.id, false)}>
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function DisputesTab() {
  const [items, setItems] = useState<DisputeDTO[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api
      .adminListOpenDisputes()
      .then(setItems)
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function resolve(id: string, resolution: "release_to_buyer" | "refund_to_seller") {
    await api.adminResolveDispute(id, resolution);
    load();
  }

  if (loading) return <p className="text-sm text-maroon-950/50">Loading…</p>;
  if (items.length === 0) return <p className={`${cardClass} text-sm text-maroon-950/50`}>No open disputes.</p>;

  return (
    <div className="flex flex-col gap-3">
      {items.map((d) => (
        <div key={d.id} className={cardClass}>
          <p className="text-sm text-maroon-950/60">Order {d.orderId}</p>
          <p className="mt-1 text-maroon-950">{d.reason}</p>
          <div className="mt-3 flex gap-2">
            <button className={primaryButtonClass} onClick={() => resolve(d.id, "release_to_buyer")}>
              Release to buyer
            </button>
            <button className={secondaryButtonClass} onClick={() => resolve(d.id, "refund_to_seller")}>
              Refund to seller
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function TreasuryTab() {
  const { user } = useSession();
  const [balance, setBalance] = useState<Record<string, number> | null>(null);
  const [error, setError] = useState("");
  const [creditForm, setCreditForm] = useState({ userId: user?.id ?? "", asset: "", amount: "" });
  const [creditMsg, setCreditMsg] = useState("");

  useEffect(() => {
    api
      .adminBybitBalance()
      .then(setBalance)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load Bybit balance."));
  }, []);

  async function handleCredit(e: React.FormEvent) {
    e.preventDefault();
    setCreditMsg("");
    try {
      await api.adminCredit({
        userId: creditForm.userId,
        asset: creditForm.asset.toUpperCase(),
        amount: Number(creditForm.amount),
      });
      setCreditMsg("Credited.");
      setCreditForm({ userId: "", asset: "", amount: "" });
    } catch (err) {
      setCreditMsg(err instanceof ApiError ? err.message : "Couldn't credit — try again.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className={cardClass}>
        <p className="font-bold text-maroon-950">Bybit account balance</p>
        {error && <p className="mt-2 text-sm text-maroon-950/50">{error}</p>}
        {balance && (
          <ul className="mt-2 flex flex-col gap-1 text-sm">
            {Object.entries(balance).map(([coin, amt]) => (
              <li key={coin} className="flex justify-between">
                <span className="text-maroon-950/60">{coin}</span>
                <span className="font-semibold text-maroon-950">{amt}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={handleCredit} className={`${cardClass} flex flex-col gap-3`}>
        <p className="font-bold text-maroon-950">Credit merchant inventory</p>
        <p className="text-xs text-maroon-950/50">
          Use this once you&apos;ve confirmed real funds landed in Thiago&apos;s Bybit account — it becomes
          available to back sell ads. Defaults to your own account; change it only if crediting a different
          admin&apos;s ads.
        </p>
        <input
          placeholder="Admin user ID"
          value={creditForm.userId}
          onChange={(e) => setCreditForm((f) => ({ ...f, userId: e.target.value }))}
          className={inputClass}
        />
        <input
          placeholder="Asset (e.g. USDT)"
          value={creditForm.asset}
          onChange={(e) => setCreditForm((f) => ({ ...f, asset: e.target.value }))}
          className={inputClass}
        />
        <input
          placeholder="Amount"
          type="number"
          step="any"
          value={creditForm.amount}
          onChange={(e) => setCreditForm((f) => ({ ...f, amount: e.target.value }))}
          className={inputClass}
        />
        {creditMsg && <p className="text-sm font-semibold text-maroon-950">{creditMsg}</p>}
        <button type="submit" className={primaryButtonClass}>
          Credit
        </button>
      </form>
    </div>
  );
}
