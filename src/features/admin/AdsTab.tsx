"use client";

import { useCallback, useEffect, useState } from "react";
import { Layers, Loader2, Pencil, Plus, QrCode, Store, Wallet } from "lucide-react";
import { api, ApiError, money, type AdDTO, type DepositAddressDTO } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogBody } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Segmented } from "@/components/ui/segmented";
import { SelectNative } from "@/components/ui/select-native";
import { StatCard } from "@/components/ui/stat-card";
import { CoinIcon } from "@/components/muiapp/CoinIcon";

const emptyAd = {
  side: "sell" as "buy" | "sell",
  asset: "",
  fiat: "NGN",
  rateType: "fixed" as "fixed" | "floating_margin",
  fixedRate: "",
  floatingMarginPct: "",
  minLimit: "",
  maxLimit: "",
  availableAmount: "",
  paymentMethods: "bank_transfer",
  terms: "",
};

function toEditForm(ad: AdDTO) {
  return {
    status: ad.status,
    fixedRate: String(ad.fixedRate ?? ""),
    floatingMarginPct: String(ad.floatingMarginPct ?? ""),
    minLimit: String(ad.minLimit ?? ""),
    maxLimit: String(ad.maxLimit ?? ""),
    availableAmount: String(ad.availableAmount ?? ""),
  };
}

export function AdsTab({ onError, onSuccess }: { onError: (message: string) => void; onSuccess: (message: string) => void }) {
  const [ads, setAds] = useState<AdDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [depositAddresses, setDepositAddresses] = useState<DepositAddressDTO[]>([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [newAd, setNewAd] = useState(emptyAd);
  const [creating, setCreating] = useState(false);

  const [addressOpen, setAddressOpen] = useState(false);
  const [newDepositAddress, setNewDepositAddress] = useState({ asset: "", chain: "", address: "", tag: "" });
  const [savingDepositAddress, setSavingDepositAddress] = useState(false);

  const [editingAd, setEditingAd] = useState<AdDTO | null>(null);
  const [editForm, setEditForm] = useState({ status: "active" as AdDTO["status"], fixedRate: "", floatingMarginPct: "", minLimit: "", maxLimit: "", availableAmount: "" });
  const [savingEdit, setSavingEdit] = useState(false);

  const loadAds = useCallback(async () => {
    try {
      setAds(await api.adminListMyAds());
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Couldn't load ads.");
    } finally {
      setLoading(false);
    }
  }, [onError]);

  const loadDepositAddresses = useCallback(async () => {
    try {
      setDepositAddresses(await api.adminListDepositAddresses());
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Couldn't load deposit addresses.");
    }
  }, [onError]);

  useEffect(() => {
    loadAds();
    loadDepositAddresses();
  }, [loadAds, loadDepositAddresses]);

  async function createAd() {
    setCreating(true);
    try {
      await api.adminCreateAd({
        side: newAd.side,
        asset: newAd.asset.trim().toUpperCase(),
        fiat: newAd.fiat.trim().toUpperCase(),
        rateType: newAd.rateType,
        fixedRate: newAd.rateType === "fixed" ? Number(newAd.fixedRate) : 0,
        floatingMarginPct: newAd.rateType === "floating_margin" ? Number(newAd.floatingMarginPct) : 0,
        minLimit: Number(newAd.minLimit),
        maxLimit: Number(newAd.maxLimit),
        availableAmount: Number(newAd.availableAmount),
        paymentMethods: newAd.paymentMethods,
        terms: newAd.terms,
      });
      setNewAd(emptyAd);
      setCreateOpen(false);
      await loadAds();
      onSuccess("Ad created.");
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Couldn't create that ad.");
    } finally {
      setCreating(false);
    }
  }

  async function saveDepositAddress() {
    if (!newDepositAddress.asset.trim() || !newDepositAddress.address.trim()) return;
    setSavingDepositAddress(true);
    try {
      await api.adminSetDepositAddress({
        asset: newDepositAddress.asset.trim().toUpperCase(),
        chain: newDepositAddress.chain.trim(),
        address: newDepositAddress.address.trim(),
        tag: newDepositAddress.tag.trim() || undefined,
      });
      setNewDepositAddress({ asset: "", chain: "", address: "", tag: "" });
      setAddressOpen(false);
      await loadDepositAddresses();
      onSuccess("Deposit address saved.");
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Couldn't save that deposit address.");
    } finally {
      setSavingDepositAddress(false);
    }
  }

  function openEdit(ad: AdDTO) {
    setEditingAd(ad);
    setEditForm(toEditForm(ad));
  }

  async function saveEdit() {
    if (!editingAd) return;
    setSavingEdit(true);
    try {
      const patch: Partial<AdDTO> = {
        status: editForm.status,
        minLimit: Number(editForm.minLimit),
        maxLimit: Number(editForm.maxLimit),
        availableAmount: Number(editForm.availableAmount),
        ...(editingAd.rateType === "fixed" ? { fixedRate: Number(editForm.fixedRate) } : { floatingMarginPct: Number(editForm.floatingMarginPct) }),
      };
      const updated = await api.adminUpdateAd(editingAd.id, patch);
      setAds((items) => items.map((item) => (item.id === updated.id ? updated : item)));
      onSuccess("Ad updated.");
      setEditingAd(null);
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Couldn't update that ad.");
    } finally {
      setSavingEdit(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading ads...
      </div>
    );
  }

  const activeAds = ads.filter((ad) => ad.status === "active").length;
  const totalAvailable = ads.reduce((sum, ad) => sum + ad.availableAmount, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard label="Active ads" value={activeAds} icon={<Store className="h-4 w-4" />} tone="maroon" />
        <StatCard label="Total ads" value={ads.length} icon={<Layers className="h-4 w-4" />} tone="slate" />
        <StatCard label="Available inventory" value={totalAvailable.toLocaleString()} icon={<Wallet className="h-4 w-4" />} tone="gold" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="font-heading text-lg font-bold tracking-tight">Your ads</h2>
            <p className="text-xs text-muted-foreground">{ads.length} configured merchant offers</p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger render={<Button className="bg-maroon-700 text-white hover:bg-maroon-800" />}>
              <Plus className="h-3.5 w-3.5" /> New ad
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create new ad</DialogTitle>
                <DialogDescription>Publish a fixed-rate or floating-margin offer.</DialogDescription>
              </DialogHeader>
              <DialogBody>
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Offer type</p>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Segmented
                      value={newAd.side}
                      onChange={(v) => setNewAd({ ...newAd, side: v })}
                      options={[{ value: "sell", label: "Sell to trader" }, { value: "buy", label: "Buy from trader" }]}
                    />
                    <Input placeholder="Asset (BTC)" value={newAd.asset} onChange={(e) => setNewAd({ ...newAd, asset: e.target.value })} className="max-w-[140px]" />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Pricing</p>
                  <Segmented
                    value={newAd.rateType}
                    onChange={(v) => setNewAd({ ...newAd, rateType: v })}
                    options={[{ value: "fixed", label: "Fixed rate" }, { value: "floating_margin", label: "Floating margin" }]}
                  />
                  {newAd.rateType === "fixed" ? (
                    <Input type="number" placeholder="Fixed rate (NGN)" value={newAd.fixedRate} onChange={(e) => setNewAd({ ...newAd, fixedRate: e.target.value })} />
                  ) : (
                    <Input type="number" placeholder="Margin %" value={newAd.floatingMarginPct} onChange={(e) => setNewAd({ ...newAd, floatingMarginPct: e.target.value })} />
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Trade limits & inventory</p>
                  <div className="grid grid-cols-3 gap-2">
                    <Field label="Min limit"><Input type="number" value={newAd.minLimit} onChange={(e) => setNewAd({ ...newAd, minLimit: e.target.value })} /></Field>
                    <Field label="Max limit"><Input type="number" value={newAd.maxLimit} onChange={(e) => setNewAd({ ...newAd, maxLimit: e.target.value })} /></Field>
                    <Field label="Available"><Input type="number" value={newAd.availableAmount} onChange={(e) => setNewAd({ ...newAd, availableAmount: e.target.value })} /></Field>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Payment & terms</p>
                  <Field label="Payment methods"><Input value={newAd.paymentMethods} onChange={(e) => setNewAd({ ...newAd, paymentMethods: e.target.value })} /></Field>
                  <Field label="Terms"><Textarea rows={2} value={newAd.terms} onChange={(e) => setNewAd({ ...newAd, terms: e.target.value })} /></Field>
                </div>
              </DialogBody>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button
                  disabled={creating || !newAd.asset || !newAd.minLimit || !newAd.maxLimit || !newAd.availableAmount}
                  onClick={createAd}
                  className="bg-maroon-700 text-white hover:bg-maroon-800"
                >
                  {creating ? "Creating..." : "Create ad"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {ads.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-muted-foreground dark:border-slate-700 dark:bg-slate-800/40">
            Create your first ad to start taking trades.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ads.map((ad) => (
              <div key={ad.id} className="rounded-xl border border-slate-200/70 p-3.5 dark:border-slate-800">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <CoinIcon coin={ad.asset} size={30} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold capitalize">{ad.side} {ad.asset}</p>
                      <p className="text-xs text-muted-foreground">{ad.rateType === "fixed" ? money(ad.fixedRate) : `${ad.floatingMarginPct}% margin`}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon-sm" onClick={() => openEdit(ad)} aria-label="Edit ad">
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <Badge tone={ad.status === "active" ? "success" : ad.status === "paused" ? "warning" : "neutral"} className="capitalize">{ad.status}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {money(ad.minLimit)}–{money(ad.maxLimit)} · {ad.availableAmount} {ad.asset} available
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="font-heading text-lg font-bold tracking-tight">Deposit addresses</h2>
            <p className="text-xs text-muted-foreground">Destination wallets for takers sending crypto</p>
          </div>
          <Dialog open={addressOpen} onOpenChange={setAddressOpen}>
            <DialogTrigger render={<Button variant="outline" />}>
              <Plus className="h-3.5 w-3.5" /> Add address
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add deposit address</DialogTitle>
                <DialogDescription>Save a destination wallet for takers sending crypto on buy ads.</DialogDescription>
              </DialogHeader>
              <DialogBody>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Asset"><Input placeholder="USDT" value={newDepositAddress.asset} onChange={(e) => setNewDepositAddress({ ...newDepositAddress, asset: e.target.value })} /></Field>
                  <Field label="Chain"><Input placeholder="TRC20" value={newDepositAddress.chain} onChange={(e) => setNewDepositAddress({ ...newDepositAddress, chain: e.target.value })} /></Field>
                </div>
                <Field label="Deposit address"><Input value={newDepositAddress.address} onChange={(e) => setNewDepositAddress({ ...newDepositAddress, address: e.target.value })} /></Field>
                <Field label="Memo / tag (optional)"><Input value={newDepositAddress.tag} onChange={(e) => setNewDepositAddress({ ...newDepositAddress, tag: e.target.value })} /></Field>
              </DialogBody>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setAddressOpen(false)}>Cancel</Button>
                <Button
                  disabled={savingDepositAddress || !newDepositAddress.asset.trim() || !newDepositAddress.address.trim()}
                  onClick={saveDepositAddress}
                  className="bg-maroon-700 text-white hover:bg-maroon-800"
                >
                  {savingDepositAddress ? "Saving..." : "Save address"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {depositAddresses.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-muted-foreground dark:border-slate-700 dark:bg-slate-800/40">
            No deposit addresses saved yet.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {depositAddresses.map((d) => (
              <div key={d.id} className="flex items-center gap-2 rounded-xl border border-slate-200/70 p-3 dark:border-slate-800">
                <QrCode className="h-4 w-4 shrink-0 text-maroon-700" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <Badge tone="brand">{d.asset}</Badge>
                    {d.chain && <Badge tone="neutral">{d.chain}</Badge>}
                  </div>
                  <p className="mt-1 truncate font-mono text-xs text-slate-600 dark:text-slate-300">{d.address}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={Boolean(editingAd)} onOpenChange={(open) => !open && setEditingAd(null)}>
        <DialogContent>
          {editingAd && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 capitalize">
                  <CoinIcon coin={editingAd.asset} size={22} /> {editingAd.side} {editingAd.asset}
                </DialogTitle>
                <DialogDescription>Update pricing, limits, and status.</DialogDescription>
              </DialogHeader>
              <DialogBody>
                <Field label="Status">
                  <SelectNative value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value as AdDTO["status"] })}>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="closed">Closed</option>
                  </SelectNative>
                </Field>
                {editingAd.rateType === "fixed" ? (
                  <Field label="Fixed rate"><Input type="number" value={editForm.fixedRate} onChange={(e) => setEditForm({ ...editForm, fixedRate: e.target.value })} /></Field>
                ) : (
                  <Field label="Margin %"><Input type="number" value={editForm.floatingMarginPct} onChange={(e) => setEditForm({ ...editForm, floatingMarginPct: e.target.value })} /></Field>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Min limit"><Input type="number" value={editForm.minLimit} onChange={(e) => setEditForm({ ...editForm, minLimit: e.target.value })} /></Field>
                  <Field label="Max limit"><Input type="number" value={editForm.maxLimit} onChange={(e) => setEditForm({ ...editForm, maxLimit: e.target.value })} /></Field>
                </div>
                <Field label="Available amount"><Input type="number" value={editForm.availableAmount} onChange={(e) => setEditForm({ ...editForm, availableAmount: e.target.value })} /></Field>
              </DialogBody>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setEditingAd(null)}>Cancel</Button>
                <Button disabled={savingEdit} onClick={saveEdit} className="bg-maroon-700 text-white hover:bg-maroon-800">
                  {savingEdit ? "Saving..." : "Save changes"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
