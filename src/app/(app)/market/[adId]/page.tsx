"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";
import { api, ApiError, type AdDTO, type OrderDTO } from "@/lib/api";
import { useSession } from "@/lib/session-context";
import { PageFrame } from "@/components/muiapp/PageFrame";
import { TradeView } from "@/features/trades/TradeView";

export default function AdDetailPage() {
  const { adId } = useParams<{ adId: string }>();
  const router = useRouter();
  const { user } = useSession();
  const [ad, setAd] = useState<AdDTO | null>(null);
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getAd(adId)
      .then(setAd)
      .catch((err) => setLoadError(err instanceof ApiError ? err.message : "This offer isn't available anymore."))
      .finally(() => setLoading(false));
  }, [adId]);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }
    api.listMyOrders().then(setOrders).catch(() => undefined);
  }, [user]);

  if (loading) return <PageFrame backHref="/market" />;
  if (loadError || !ad) {
    return (
      <PageFrame backHref="/market">
        <Typography sx={{ fontWeight: 800, color: "#be123c" }}>{loadError || "Offer not found."}</Typography>
      </PageFrame>
    );
  }

  return (
    <PageFrame backHref="/market">
      <TradeView
        ads={[ad]}
        orders={orders}
        isAuthed={Boolean(user)}
        selectedAd={ad}
        onSelectedAd={() => router.push("/market")}
        onBackToOffers={() => router.push("/market")}
        onRequireAuth={() => router.push("/login")}
        onCreated={(order) => router.push(`/trade/${order.id}`)}
        onError={setError}
      />
      <Snackbar open={Boolean(error)} autoHideDuration={5000} onClose={() => setError("")}>
        <Alert severity="error" onClose={() => setError("")}>{error}</Alert>
      </Snackbar>
    </PageFrame>
  );
}
