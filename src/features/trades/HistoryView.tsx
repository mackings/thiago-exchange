"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { money, type OrderDTO } from "@/lib/api";
import { StatusChip } from "@/components/muiapp/StatusChip";
import { TradeTimer } from "@/components/muiapp/TradeTimer";
import { CoinIcon } from "@/components/muiapp/CoinIcon";

function formatAssetAmount(value: number) {
  if (!value) return "0";
  return value.toFixed(8).replace(/0+$/, "").replace(/\.$/, "");
}

// Label must reflect what actually happened, not just the trade direction —
// a sell-side order sitting at "awaiting_payment" hasn't been paid yet, so
// "You paid" would be flat-out wrong there.
function paymentLabel(order: OrderDTO): string {
  if (order.side === "sell") {
    const paid = ["payment_marked", "payment_confirmed", "released", "completed"].includes(order.status);
    return paid ? "You paid" : "You'll pay";
  }
  // Buy-side: Thiago pays the seller's bank off-platform after crediting the
  // deposit — the order status doesn't track that fiat leg, so this can't
  // honestly claim it was "received".
  return "Payout amount";
}

// Same rule for the buy/sell direction line — "Bought"/"Sold" is a past-tense
// claim that's only true once the order is actually completed. Anything
// still in flight is "Buying"/"Selling" (present tense, no claim of done).
function directionLabel(order: OrderDTO): string {
  const verb = order.side === "sell" ? "Buy" : "Sell";
  if (order.status === "completed") return verb === "Buy" ? "Bought" : "Sold";
  if (order.status === "cancelled") return `${verb} cancelled`;
  if (order.status === "disputed") return `${verb} disputed`;
  return `${verb}ing`;
}

export function HistoryView({
  orders,
  isAuthed,
  onRefresh,
}: {
  orders: OrderDTO[];
  isAuthed: boolean;
  onRefresh: () => void;
}) {
  const items = Array.isArray(orders) ? orders : [];

  if (!isAuthed) {
    return (
      <Alert severity="info" sx={{ borderRadius: 4 }}>
        Sign in to view your trade history.
      </Alert>
    );
  }

  return (
    <Stack spacing={{ xs: 1.6, md: 2.5 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
        <Box>
          <Typography sx={{ fontWeight: 1000, color: "#8a5a10", letterSpacing: 1.8, fontSize: 12.5, mb: 0.5 }}>
            TRADE HISTORY
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 1000, letterSpacing: "-0.035em", fontSize: { xs: 22, md: 34 } }}>
            Recent activity
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: { xs: 13.5, md: 16 } }}>
            Track chats, payouts, proofs, and completed receipts.
          </Typography>
        </Box>
        <Typography sx={{ alignSelf: { xs: "flex-start", md: "center" }, color: "#7a5a5a", fontWeight: 800, fontSize: 14 }}>
          {items.length} total trade{items.length === 1 ? "" : "s"}
        </Typography>
      </Stack>

      {items.length === 0 && (
        <Card variant="outlined" sx={{ borderRadius: 2, borderColor: "rgba(217,134,31,0.18)", bgcolor: "#fdf6e9" }}>
          <CardContent sx={{ p: { xs: 2.2, md: 5 }, textAlign: "center" }}>
            <ReceiptLongIcon sx={{ fontSize: 40, color: "#611818", mb: 1.5 }} />
            <Typography variant="h5" sx={{ fontWeight: 1000, letterSpacing: "-0.03em", fontSize: { xs: 20, md: 24 } }}>
              No trades yet
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Your opened trades, chat threads, proofs, and receipts will show here.
            </Typography>
          </CardContent>
        </Card>
      )}

      {items.map((order) => {
        const hasProof = Boolean(order.paymentProofUrl || order.depositTxId);
        return (
          <Card
            key={order.id}
            variant="outlined"
            sx={{
              borderRadius: 2,
              borderColor: "rgba(217,134,31,0.18)",
              boxShadow: "0 10px 28px rgba(32,8,8,0.05)",
              transition: "transform .18s ease, box-shadow .18s ease, border-color .18s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                borderColor: "rgba(217,134,31,0.34)",
                boxShadow: "0 16px 40px rgba(32,8,8,0.09)",
              },
            }}
          >
            <CardContent sx={{ p: { xs: 1.75, md: 2.75 } }}>
              <Stack direction="row" spacing={1.6} alignItems="flex-start" justifyContent="space-between">
                <Stack direction="row" spacing={1.6} alignItems="center">
                  <CoinIcon coin={order.asset} size={50} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 1000, letterSpacing: "-0.02em", fontSize: { xs: 17, md: 20 } }}>
                      {formatAssetAmount(order.amount)} {order.asset}
                    </Typography>
                    <Typography color="text.secondary" sx={{ fontSize: 13.5 }}>
                      {directionLabel(order)}
                    </Typography>
                  </Box>
                </Stack>
                <StatusChip status={order.status} />
              </Stack>

              <Divider sx={{ my: 1.6, borderColor: "rgba(32,8,8,0.08)" }} />

              <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" useFlexGap rowGap={1}>
                <Box>
                  <Typography sx={{ color: "#7a5a5a", fontSize: 12.5, fontWeight: 800 }}>
                    {paymentLabel(order)}
                  </Typography>
                  <Typography sx={{ fontWeight: 1000, fontSize: 17 }}>{money(order.fiatAmount)}</Typography>
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: 13.5, color: hasProof ? "#8a5a10" : "#9a5b00" }}>
                  {hasProof ? "Proof sent" : "Proof pending"}
                </Typography>
              </Stack>

              {["awaiting_payment", "payment_marked"].includes(order.status) && (
                <Box sx={{ mt: 1.8 }}>
                  <TradeTimer deadline={order.paymentDeadline} onExpired={onRefresh} />
                </Box>
              )}

              <Button
                variant="contained"
                fullWidth
                endIcon={<ArrowForwardIcon />}
                href={`/trade/${order.id}`}
                sx={{ mt: 2, bgcolor: "#611818", "&:hover": { bgcolor: "#4a1212" } }}
              >
                Open Trade Page
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
}
