"use client";

import { useEffect, useState, type FormEvent } from "react";
import { PlusCircle, Wallet } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function TreasuryTab({
  currentUserId,
  onError,
  onSuccess,
}: {
  currentUserId: string;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}) {
  const [balance, setBalance] = useState<Record<string, number> | null>(null);
  const [creditForm, setCreditForm] = useState({ userId: currentUserId, asset: "", amount: "" });
  const [crediting, setCrediting] = useState(false);

  useEffect(() => {
    api.adminBybitBalance().then(setBalance).catch((err) => onError(err instanceof ApiError ? err.message : "Couldn't load Bybit balance."));
  }, [onError]);

  async function handleCredit(event: FormEvent) {
    event.preventDefault();
    setCrediting(true);
    try {
      await api.adminCredit({ userId: creditForm.userId, asset: creditForm.asset.toUpperCase(), amount: Number(creditForm.amount) });
      onSuccess("Credited.");
      setCreditForm({ userId: currentUserId, asset: "", amount: "" });
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Couldn't credit — try again.");
    } finally {
      setCrediting(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Wallet className="h-4 w-4 text-maroon-700" /> Bybit account balance</CardTitle>
        </CardHeader>
        <CardContent>
          {balance && Object.keys(balance).length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Object.entries(balance).map(([coin, amt]) => (
                <div key={coin} className="rounded-xl border border-slate-200/70 p-3 dark:border-slate-800">
                  <p className="text-xs font-semibold text-muted-foreground">{coin}</p>
                  <p className="mt-0.5 text-lg font-bold">{amt}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Not configured — set BYBIT_API_KEY / BYBIT_API_SECRET to see live balances here.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><PlusCircle className="h-4 w-4 text-maroon-700" /> Credit merchant inventory</CardTitle>
          <CardDescription>
            Use this once you&apos;ve confirmed real funds landed in Thiago&apos;s Bybit account — it becomes available to back sell ads. Defaults to your own account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCredit} className="space-y-3">
            <Field label="Admin user ID">
              <Input value={creditForm.userId} onChange={(e) => setCreditForm((f) => ({ ...f, userId: e.target.value }))} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Asset">
                <Input placeholder="USDT" value={creditForm.asset} onChange={(e) => setCreditForm((f) => ({ ...f, asset: e.target.value }))} />
              </Field>
              <Field label="Amount">
                <Input type="number" value={creditForm.amount} onChange={(e) => setCreditForm((f) => ({ ...f, amount: e.target.value }))} />
              </Field>
            </div>
            <Button type="submit" disabled={crediting || !creditForm.asset || !creditForm.amount} className="bg-maroon-700 text-white hover:bg-maroon-800">
              {crediting ? "Crediting..." : "Credit"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
