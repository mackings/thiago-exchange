"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { api, ApiError, type MessageDTO, type OrderDTO } from "@/lib/api";
import { useSession } from "@/lib/session-context";
import { useTradeSocket } from "@/hooks/useTradeSocket";
import { TradeChat } from "@/features/trades/TradeChat";

export default function TradeRoomPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  const { user } = useSession();
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [initialMessages, setInitialMessages] = useState<MessageDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    try {
      const [o, msgs] = await Promise.all([api.getOrder(orderId), api.getMessages(orderId)]);
      setOrder(o);
      setInitialMessages(msgs);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : "Couldn't load this order.");
    }
  }, [orderId]);

  useEffect(() => {
    setLoading(true);
    reload().finally(() => setLoading(false));
  }, [reload]);

  const { messages, connected, send } = useTradeSocket(orderId, initialMessages, Boolean(user));

  if (loading) {
    return (
      <Box sx={{ height: "100dvh", display: "grid", placeItems: "center", bgcolor: "#faf7f0" }}>
        <CircularProgress sx={{ color: "#611818" }} />
      </Box>
    );
  }

  if (loadError || !order || !user) {
    return (
      <Box sx={{ height: "100dvh", bgcolor: "#faf7f0", p: 2 }}>
        <IconButton onClick={() => router.push("/orders")} sx={{ color: "#611818" }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography sx={{ fontWeight: 800, color: "#be123c", px: 1 }}>{loadError || "Order not found."}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100dvh", display: "flex", flexDirection: "column", bgcolor: "#faf7f0", overflow: "hidden" }}>
      <TradeChat
        order={order}
        messages={messages}
        currentUserId={user.id}
        isAdmin={user.role === "admin"}
        connected={connected}
        onSend={send}
        onOrder={setOrder}
        onRefresh={() => reload()}
        onError={setError}
        onBack={() => router.push("/orders")}
      />
      <Snackbar open={Boolean(error)} autoHideDuration={5000} onClose={() => setError("")}>
        <Alert severity="error" onClose={() => setError("")}>{error}</Alert>
      </Snackbar>
    </Box>
  );
}
