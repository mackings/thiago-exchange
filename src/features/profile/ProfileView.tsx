"use client";

import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { api, ApiError, money, type AdDTO, type UserDTO } from "@/lib/api";
import { coinIconUrls } from "@/components/muiapp/CoinIcon";
import { BoxedTextField } from "@/components/muiapp/BoxedTextField";
import { whatsappLink } from "@/lib/site";

const enabledKey = "thiago.rateNotifications.enabled";
const notificationIntervalMs = 5 * 60 * 1000;

const kycLabel: Record<UserDTO["kycStatus"], string> = {
  unverified: "Not started",
  pending: "Under review",
  verified: "Verified",
  rejected: "Rejected — resubmit",
};

const kycColor: Record<UserDTO["kycStatus"], "default" | "warning" | "success" | "error"> = {
  unverified: "default",
  pending: "warning",
  verified: "success",
  rejected: "error",
};

export function ProfileView({
  user,
  ads,
  onSave,
  onLogout,
  onError,
  onSuccess,
}: {
  user?: UserDTO;
  ads: AdDTO[];
  onSave: (input: { fullName: string; phone: string; bankName?: string; bankAccountNumber?: string; bankAccountName?: string }) => Promise<void>;
  onLogout: () => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}) {
  const [name, setName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [bankName, setBankName] = useState(user?.bankName || "");
  const [bankAccountNumber, setBankAccountNumber] = useState(user?.bankAccountNumber || "");
  const [bankAccountName, setBankAccountName] = useState(user?.bankAccountName || "");
  const [saving, setSaving] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);

  async function resendVerification() {
    if (!user?.email) return;
    setResendingVerification(true);
    try {
      await api.resendVerification(user.email);
      onSuccess("Verification email sent — check your inbox.");
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Couldn't resend the verification email.");
    } finally {
      setResendingVerification(false);
    }
  }

  useEffect(() => {
    setName(user?.fullName || "");
    setPhone(user?.phone || "");
    setBankName(user?.bankName || "");
    setBankAccountNumber(user?.bankAccountNumber || "");
    setBankAccountName(user?.bankAccountName || "");
  }, [user]);

  useEffect(() => {
    if (!("Notification" in window)) return;
    setAlertsEnabled(localStorage.getItem(enabledKey) === "1" && Notification.permission === "granted");
  }, []);

  useEffect(() => {
    if (!alertsEnabled || !("Notification" in window) || Notification.permission !== "granted") return;
    const id = window.setInterval(() => notifyRate(ads), notificationIntervalMs);
    return () => window.clearInterval(id);
  }, [alertsEnabled, ads]);

  async function toggleAlerts(checked: boolean) {
    if (!("Notification" in window)) {
      onError("Rate alerts are not supported on this device.");
      return;
    }
    if (!checked) {
      localStorage.removeItem(enabledKey);
      setAlertsEnabled(false);
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      onError("Notification permission was not granted.");
      return;
    }
    localStorage.setItem(enabledKey, "1");
    setAlertsEnabled(true);
    notifyRate(ads);
  }

  async function saveProfile() {
    setSaving(true);
    try {
      await onSave({ fullName: name, phone, bankName, bankAccountNumber, bankAccountName });
      onSuccess("Profile updated.");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Couldn't update your profile.");
    } finally {
      setSaving(false);
    }
  }

  if (!user) {
    return <Alert severity="info" sx={{ borderRadius: 4 }}>Sign in to view your profile.</Alert>;
  }

  return (
    <Stack spacing={{ xs: 2, md: 3 }}>
      <Stack direction="row" spacing={1.6} alignItems="center">
        <Avatar sx={{ width: 64, height: 64, fontSize: 26, bgcolor: "#611818", fontWeight: 1000 }}>
          {user.fullName.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 1000, fontSize: { xs: 20, md: 26 }, letterSpacing: "-0.03em" }}>{user.fullName}</Typography>
          <Typography color="text.secondary" sx={{ fontSize: { xs: 13.5, md: 15 } }}>{user.email}</Typography>
        </Box>
        <Chip
          size="small"
          label={kycLabel[user.kycStatus]}
          color={kycColor[user.kycStatus]}
          sx={{ ml: "auto", fontWeight: 900 }}
        />
      </Stack>

      <Grid container spacing={{ xs: 1.5, md: 2.5 }}>
        <Grid item xs={12} md={7}>
          <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "rgba(217,134,31,0.18)" }}>
            <CardContent sx={{ p: { xs: 2, md: 2.75 } }}>
              <Stack spacing={1.75}>
                <Typography sx={{ fontWeight: 1000, fontSize: 16 }}>Personal details</Typography>
                <BoxedTextField label="Full name" value={name} onChange={(event) => setName(event.target.value)} fullWidth />
                <BoxedTextField label="Phone number" value={phone} onChange={(event) => setPhone(event.target.value)} fullWidth />
                <BoxedTextField label="Email" value={user.email} fullWidth disabled helperText="Email cannot be changed." />

                {user.role === "admin" && (
                  <>
                    <Divider sx={{ borderColor: "rgba(32,8,8,0.08)" }} />
                    <Box>
                      <Typography sx={{ fontWeight: 1000, fontSize: 16 }}>Payout bank account</Typography>
                      <Typography color="text.secondary" sx={{ fontSize: 13.5, mt: 0.3 }}>
                        Shown to buyers on your sell-ad orders as the account to pay into — keep this accurate.
                      </Typography>
                    </Box>
                    <BoxedTextField label="Bank name" value={bankName} onChange={(event) => setBankName(event.target.value)} fullWidth />
                    <BoxedTextField label="Account number" value={bankAccountNumber} onChange={(event) => setBankAccountNumber(event.target.value)} fullWidth />
                    <BoxedTextField label="Account name" value={bankAccountName} onChange={(event) => setBankAccountName(event.target.value)} fullWidth />
                  </>
                )}

                <Button
                  variant="contained"
                  onClick={saveProfile}
                  disabled={saving}
                  sx={{ bgcolor: "#611818", "&:hover": { bgcolor: "#4a1212" }, alignSelf: "flex-start" }}
                >
                  {saving ? "Saving..." : "Save changes"}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Stack spacing={1.5}>
            {user.role === "admin" && (
              <Card
                component="a"
                href="/admin"
                sx={{
                  borderRadius: 3,
                  textDecoration: "none",
                  background: "linear-gradient(135deg, #611818 0%, #7a2020 100%)",
                  boxShadow: "0 12px 28px rgba(97,24,24,0.2)",
                }}
              >
                <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1.2} alignItems="center">
                      <AdminPanelSettingsIcon sx={{ color: "#fff" }} />
                      <Box>
                        <Typography sx={{ fontWeight: 1000, color: "#fff" }}>Admin console</Typography>
                        <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>Manage ads, trades, KYC & disputes.</Typography>
                      </Box>
                    </Stack>
                    <ArrowForwardIcon sx={{ color: "#fff" }} />
                  </Stack>
                </CardContent>
              </Card>
            )}

            {!user.emailVerified && (
              <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "rgba(217,134,31,0.18)" }}>
                <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                  <Stack spacing={1.5}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <MarkEmailUnreadIcon sx={{ color: "#611818" }} />
                      <Box>
                        <Typography sx={{ fontWeight: 1000 }}>Verify your email</Typography>
                        <Typography color="text.secondary" sx={{ fontSize: 13 }}>Required before you can open trades.</Typography>
                      </Box>
                    </Stack>
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={resendingVerification}
                      onClick={resendVerification}
                      sx={{ alignSelf: "flex-start", borderColor: "rgba(217,134,31,0.4)" }}
                    >
                      {resendingVerification ? "Sending..." : "Resend verification email"}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            )}

            <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "rgba(217,134,31,0.18)" }}>
              <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                <Stack spacing={1.5}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <VerifiedUserIcon sx={{ color: "#611818" }} />
                      <Box>
                        <Typography sx={{ fontWeight: 1000 }}>Identity verification</Typography>
                        <Typography color="text.secondary" sx={{ fontSize: 13 }}>Required before trading larger limits.</Typography>
                      </Box>
                    </Stack>
                  </Stack>
                  {user.kycStatus !== "verified" && user.kycStatus !== "pending" && (
                    <Button href="/kyc" variant="outlined" size="small" sx={{ alignSelf: "flex-start", borderColor: "rgba(217,134,31,0.4)" }}>
                      {user.kycStatus === "rejected" ? "Resubmit KYC" : "Start verification"}
                    </Button>
                  )}
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "rgba(217,134,31,0.18)" }}>
              <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <NotificationsActiveIcon sx={{ color: "#611818" }} />
                    <Box>
                      <Typography sx={{ fontWeight: 1000 }}>Rate alerts</Typography>
                      <Typography color="text.secondary" sx={{ fontSize: 13 }}>Get periodic rate updates.</Typography>
                    </Box>
                  </Stack>
                  <Switch checked={alertsEnabled} onChange={(event) => toggleAlerts(event.target.checked)} />
                </Stack>
              </CardContent>
            </Card>

            <Button
              component="a"
              href={whatsappLink()}
              target="_blank"
              rel="noreferrer"
              variant="outlined"
              startIcon={<WhatsAppIcon />}
              sx={{ borderColor: "rgba(217,134,31,0.4)", color: "#611818" }}
            >
              Chat support on WhatsApp
            </Button>

            <Button variant="text" onClick={onLogout} sx={{ color: "#7a5a5a", fontWeight: 800 }}>
              Log out
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}

function notifyRate(ads: AdDTO[]) {
  const fixed = ads.filter((ad) => ad.rateType === "fixed" && ad.status === "active");
  if (!fixed.length || !("Notification" in window) || Notification.permission !== "granted") return;
  const featured = fixed.filter((ad) => ["BTC", "ETH", "USDT"].includes(ad.asset.toUpperCase()));
  const pool = featured.length ? featured : fixed;
  const ad = pool[Math.floor(Math.random() * pool.length)];
  new Notification("Rate update", {
    body: `${ad.asset}: Thiago ${ad.side === "sell" ? "sells" : "buys"} at ${money(ad.fixedRate)}. Limit ${money(ad.minLimit)}–${money(ad.maxLimit)}.`,
    icon: coinIconUrls[ad.asset.toUpperCase()] || "/thiago-logo.svg",
    tag: `thiago-rate-${ad.asset}`,
  });
}
