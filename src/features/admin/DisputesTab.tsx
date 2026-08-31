"use client";

import { useEffect, useState } from "react";
import { Gavel, Loader2 } from "lucide-react";
import { api, ApiError, type DisputeDTO } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function DisputesTab({ onError, onSuccess }: { onError: (message: string) => void; onSuccess: (message: string) => void }) {
  const [items, setItems] = useState<DisputeDTO[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api.adminListOpenDisputes().then(setItems).catch((err) => onError(err instanceof ApiError ? err.message : "Couldn't load disputes.")).finally(() => setLoading(false));
  }
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function resolve(id: string, resolution: "release_to_buyer" | "refund_to_seller") {
    try {
      await api.adminResolveDispute(id, resolution);
      onSuccess("Dispute resolved.");
      load();
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Couldn't resolve that dispute.");
    }
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-muted-foreground dark:border-slate-700 dark:bg-slate-800/40">
        No open disputes.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-muted-foreground">{items.length} open dispute{items.length === 1 ? "" : "s"}</p>
      <div className="space-y-3">
        {items.map((d) => (
          <Card key={d.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Gavel className="h-4 w-4 text-maroon-700" />
                <Badge tone="danger" className="font-mono">Order {d.orderId.slice(0, 8)}…</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm leading-relaxed">{d.reason}</p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button size="sm" className="bg-maroon-700 text-white hover:bg-maroon-800" onClick={() => resolve(d.id, "release_to_buyer")}>
                  Release to buyer
                </Button>
                <Button size="sm" variant="outline" onClick={() => resolve(d.id, "refund_to_seller")}>
                  Refund to seller
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
