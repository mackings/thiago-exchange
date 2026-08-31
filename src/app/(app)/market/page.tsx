"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import HistoryIcon from "@mui/icons-material/History";
import LoginIcon from "@mui/icons-material/Login";
import { api, money, type AdDTO, type OrderDTO } from "@/lib/api";
import { useSession } from "@/lib/session-context";
import { CoinIcon } from "@/components/muiapp/CoinIcon";
import { StatusChip } from "@/components/muiapp/StatusChip";
import { TradeTimer } from "@/components/muiapp/TradeTimer";
import { MarketSlider } from "@/components/muiapp/MarketSlider";
import { TradeView } from "@/features/trades/TradeView";
import Logo from "@/components/Logo";

const inFlightStatuses = new Set<OrderDTO["status"]>(["awaiting_payment", "payment_marked", "payment_confirmed"]);

function formatAssetAmount(value: number) {
  if (!value) return "0";
  return value.toFixed(8).replace(/0+$/, "").replace(/\.$/, "");
}

export default function MarketPage() {
  const router = useRouter();
  const { user } = useSession();
  const [ads, setAds] = useState<AdDTO[]>([]);
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [adsLoading, setAdsLoading] = useState(true);
  const [selectedAd, setSelectedAd] = useState<AdDTO | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeOrderSeen, setActiveOrderSeen] = useState("");

  const activeOrders = useMemo(() => orders.filter((o) => inFlightStatuses.has(o.status)), [orders]);
  const activeOrder = activeOrders[0] || null;

  function loadAds() {
    setAdsLoading(true);
    api.listAds().then(setAds).catch(() => setError("Couldn't load offers right now.")).finally(() => setAdsLoading(false));
  }

  function loadOrders() {
    if (!user) {
      setOrders([]);
      return;
    }
    api.listMyOrders().then(setOrders).catch(() => undefined);
  }

  useEffect(loadAds, []);
  useEffect(loadOrders, [user]);

  useEffect(() => {
    const newestActiveId = activeOrders[0]?.id || "";
    if (!newestActiveId || newestActiveId === activeOrderSeen) return;
    setActiveOrderSeen(newestActiveId);
    playActiveOrderSound();
  }, [activeOrders, activeOrderSeen]);

  return (
    <Box sx={{ minHeight: "100vh", px: { xs: 0.75, md: 2 }, py: { xs: 0.75, md: 2 } }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: "transparent", color: "text.primary", boxShadow: "none" }}>
        <Toolbar sx={{ gap: { xs: 1, md: 2 }, mx: { xs: 0, md: 2 }, mt: { xs: 0, md: 1 }, px: { xs: 1.4, md: 3 }, py: { xs: 0.8, md: 1.6 }, minHeight: { xs: 64, md: 92 } }}>
          <Logo markSize={30} />
          <Box sx={{ flexGrow: 1 }} />
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ display: { xs: "none", md: "flex" } }}>
            <Button
              href="/orders"
              startIcon={<HistoryIcon />}
              sx={{ px: 2.3, borderRadius: 999, color: "#7a5a5a", bgcolor: "#f3ede1", "&:hover": { bgcolor: "#fff" } }}
            >
              History
            </Button>
          </Stack>
          {user ? (
            <Tooltip title="Profile">
              <IconButton href="/profile" aria-label="open profile" sx={{ p: 0 }}>
                <Avatar sx={{ width: 34, height: 34, bgcolor: "#611818", fontWeight: 900 }}>{user.fullName.charAt(0).toUpperCase()}</Avatar>
              </IconButton>
            </Tooltip>
          ) : (
            <Button startIcon={<LoginIcon />} variant="contained" href="/login" sx={{ borderRadius: 999, bgcolor: "#611818", "&:hover": { bgcolor: "#4a1212" } }}>
              Sign in
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Box sx={{ color: "#200808", pt: { xs: 2.4, md: 7 }, pb: { xs: 3, md: 8 }, position: "relative", overflow: "hidden" }}>
        <Container maxWidth="xl">
          <Grid container spacing={{ xs: 2.4, md: 6 }} alignItems="center">
            <Grid item xs={12} md={7}>
              <Stack spacing={{ xs: 1.6, md: 2.4 }}>
                <Typography
                  variant="h3"
                  component="h1"
                  sx={{
                    fontWeight: 1000,
                    maxWidth: 820,
                    fontSize: { xs: 29, sm: 46, md: 78 },
                    lineHeight: { xs: 1, md: 0.94 },
                    letterSpacing: { xs: "-0.035em", md: "-0.055em" },
                    background: "linear-gradient(115deg, #611818 0%, #8a2323 48%, #d9861f 92%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Trade coins when the payout feels right.
                </Typography>
                <Typography sx={{ color: "#7a5a5a", maxWidth: 690, fontSize: { xs: 13.5, md: 18 }, lineHeight: { xs: 1.5, md: 1.65 } }}>
                  Choose a live offer, accept the terms, send payment or coin, upload proof, and chat with Thiago Exchange until the trade completes.
                </Typography>
                <MarketSlider ads={ads} />
              </Stack>
            </Grid>
            <Grid item xs={12} md={5}>
              <Card
                sx={{
                  color: "#200808",
                  border: "1px solid rgba(217,134,31,0.18)",
                  borderRadius: { xs: 3, md: 4 },
                  boxShadow: "0 12px 34px rgba(32,8,8,0.07)",
                  background: "#fffaf0",
                }}
              >
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <Stack spacing={{ xs: 1.75, md: 2.25 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography sx={{ fontWeight: 1000, letterSpacing: 1.6, fontSize: { xs: 11, md: 12 }, color: "#8a5a10" }}>
                        LIVE TRADE STATUS
                      </Typography>
                      {activeOrder && <StatusChip status={activeOrder.status} />}
                    </Stack>
                    {activeOrder ? (
                      <>
                        <Stack direction="row" spacing={1.4} alignItems="center">
                          <CoinIcon coin={activeOrder.asset} size={46} />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="h4" sx={{ fontWeight: 1000, letterSpacing: "-0.035em", fontSize: { xs: 24, md: 32 }, lineHeight: 1.05 }}>
                              {formatAssetAmount(activeOrder.amount)}
                            </Typography>
                            <Typography sx={{ mt: 0.35, color: "#7a5a5a", fontSize: { xs: 14, md: 16 } }}>
                              Expected {activeOrder.side === "sell" ? "payment" : "payout"} {money(activeOrder.fiatAmount)}
                            </Typography>
                          </Box>
                        </Stack>
                        {["awaiting_payment", "payment_marked"].includes(activeOrder.status) && (
                          <TradeTimer deadline={activeOrder.paymentDeadline} onExpired={loadOrders} />
                        )}
                        <Button variant="contained" fullWidth href={`/trade/${activeOrder.id}`} sx={{ minHeight: { xs: 46, md: 50 }, bgcolor: "#611818", color: "#fff", borderRadius: 999, "&:hover": { bgcolor: "#4a1212" } }}>
                          Continue Chat
                        </Button>
                      </>
                    ) : (
                      <>
                        <Typography variant="h4" sx={{ color: "#200808", fontWeight: 1000, letterSpacing: "-0.04em", fontSize: { xs: 26, md: 34 } }}>No open trade</Typography>
                        <Typography color="text.secondary">Choose an offer to start a secured trading ground.</Typography>
                        <Stack direction="row" spacing={1}>
                          <Button variant="outlined" href="#offers" sx={{ borderColor: "rgba(217,134,31,0.4)" }}>
                            Choose Offer
                          </Button>
                          <Button variant="text" href="/orders" startIcon={<HistoryIcon />} sx={{ color: "#7a5a5a" }}>
                            History
                          </Button>
                        </Stack>
                      </>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: { xs: 0, md: -2 }, pb: { xs: 3, md: 6 } }}>
        <Paper id="offers" sx={{ borderRadius: { xs: 4, md: 6 }, overflow: "hidden", bgcolor: "#fff", border: "1px solid rgba(217,134,31,0.16)", boxShadow: "0 16px 46px rgba(32,8,8,0.08)", scrollMarginTop: 96 }}>
          <Box sx={{ p: { xs: 1.25, md: 3 } }}>
            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}
            {adsLoading && !ads.length && <OffersSkeleton />}
            {(!adsLoading || ads.length > 0) && (
              <TradeView
                ads={ads}
                orders={orders}
                isAuthed={Boolean(user)}
                selectedAd={selectedAd}
                onSelectedAd={setSelectedAd}
                onRequireAuth={() => router.push("/login")}
                onCreated={(order) => {
                  setOrders((items) => [order, ...items]);
                  setSuccess("Order opened. Trading ground started.");
                  router.push(`/trade/${order.id}`);
                }}
                onError={setError}
              />
            )}
          </Box>
        </Paper>
      </Container>

      {activeOrder && (
        <Button
          variant="contained"
          href={activeOrders.length === 1 ? `/trade/${activeOrders[0].id}` : "/orders"}
          sx={{
            position: "fixed",
            right: { xs: 14, md: 28 },
            bottom: { xs: 18, md: 28 },
            zIndex: 20,
            borderRadius: 999,
            px: 2,
            py: 1.2,
            bgcolor: "#200808",
            boxShadow: "0 16px 42px rgba(32,8,8,0.28)",
            "&::before": { content: '""', width: 10, height: 10, borderRadius: "50%", bgcolor: "#d9861f", mr: 1, boxShadow: "0 0 0 6px rgba(217,134,31,0.22)" },
          }}
          endIcon={<ArrowForwardIcon />}
        >
          {activeOrders.length > 1 ? `${activeOrders.length} active trades` : "Active trade"}
        </Button>
      )}
    </Box>
  );
}

function OffersSkeleton() {
  return (
    <Stack spacing={{ xs: 2, md: 3 }}>
      <Box>
        <Skeleton variant="text" width={160} height={38} />
        <Skeleton variant="text" width="70%" />
      </Box>
      <Grid container spacing={{ xs: 1.5, md: 2.5 }}>
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <Grid item xs={12} md={6} lg={4} key={item}>
            <Card variant="outlined" sx={{ borderRadius: { xs: 4, md: 5 }, borderColor: "rgba(217,134,31,0.12)" }}>
              <CardContent sx={{ p: { xs: 1.5, md: 2.5 } }}>
                <Stack spacing={{ xs: 1.6, md: 2.2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1.4} alignItems="center">
                      <Skeleton variant="circular" width={42} height={42} />
                      <Box>
                        <Skeleton variant="text" width={120} height={28} />
                        <Skeleton variant="text" width={90} />
                      </Box>
                    </Stack>
                    <Skeleton variant="rounded" width={96} height={28} sx={{ borderRadius: 999 }} />
                  </Stack>
                  <Skeleton variant="rounded" height={94} sx={{ borderRadius: 4 }} />
                  <Skeleton variant="rounded" height={36} width="82%" sx={{ borderRadius: 999 }} />
                  <Skeleton variant="rounded" height={44} sx={{ borderRadius: 999 }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}

function playActiveOrderSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.frequency.setValueAtTime(660, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.3);
  } catch {
    // Browsers can block sound until the user has interacted with the page.
  }
}
