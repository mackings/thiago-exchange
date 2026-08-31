"use client";

import { useCallback, useEffect, useState } from "react";
import { api, type OrderDTO } from "@/lib/api";
import { useSession } from "@/lib/session-context";
import { PageFrame } from "@/components/muiapp/PageFrame";
import { HistoryView } from "@/features/trades/HistoryView";

export default function OrdersPage() {
  const { user } = useSession();
  const [orders, setOrders] = useState<OrderDTO[]>([]);

  const reload = useCallback(() => {
    if (!user) {
      setOrders([]);
      return;
    }
    api.listMyOrders().then(setOrders).catch(() => undefined);
  }, [user]);

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <PageFrame backHref="/market">
      <HistoryView orders={orders} isAuthed={Boolean(user)} onRefresh={reload} />
    </PageFrame>
  );
}
