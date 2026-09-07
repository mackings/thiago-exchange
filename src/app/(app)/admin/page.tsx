"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GavelIcon from "@mui/icons-material/Gavel";
import GroupIcon from "@mui/icons-material/Group";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import StorefrontIcon from "@mui/icons-material/Storefront";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { useSession } from "@/lib/session-context";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import { AdminShell, type AdminNavItem } from "@/components/muiapp/AdminShell";
import { OverviewTab } from "@/features/admin/OverviewTab";
import { UsersTab } from "@/features/admin/UsersTab";
import { AdsTab } from "@/features/admin/AdsTab";
import { TradesTab } from "@/features/admin/TradesTab";
import { KycTab } from "@/features/admin/KycTab";
import { DisputesTab } from "@/features/admin/DisputesTab";
import { TreasuryTab } from "@/features/admin/TreasuryTab";

type TabKey = "overview" | "users" | "ads" | "trades" | "kyc" | "disputes" | "treasury";

const navItems: AdminNavItem<TabKey>[] = [
  { key: "overview", label: "Overview", icon: <DashboardIcon /> },
  { key: "users", label: "Users", icon: <GroupIcon /> },
  { key: "ads", label: "Ads", icon: <StorefrontIcon /> },
  { key: "trades", label: "Trades", icon: <ReceiptLongIcon /> },
  { key: "kyc", label: "KYC Review", icon: <VerifiedUserIcon /> },
  { key: "disputes", label: "Disputes", icon: <GavelIcon /> },
  { key: "treasury", label: "Treasury", icon: <AccountBalanceWalletIcon /> },
];

const tabCopy: Record<TabKey, { title: string; subtitle: string }> = {
  overview: { title: "Overview", subtitle: "How the marketplace is doing right now." },
  users: { title: "Users", subtitle: "Everyone registered on the platform." },
  ads: { title: "Ads", subtitle: "Publish offers and manage deposit addresses." },
  trades: { title: "Trades", subtitle: "Verify trades and step into chats in flight." },
  kyc: { title: "KYC Review", subtitle: "Approve or reject identity submissions." },
  disputes: { title: "Disputes", subtitle: "Step in and resolve contested trades." },
  treasury: { title: "Treasury", subtitle: "Bybit balance and merchant inventory." },
};

export default function AdminPage() {
  const { user, loading } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("overview");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { latest: newMessage, dismiss: dismissNewMessage } = useAdminNotifications(Boolean(user && user.role === "admin"));

  useEffect(() => {
    // Only redirect once the session has actually resolved — redirecting
    // (or blanking the page) while the refresh/me round-trip is still in
    // flight would kick out a real admin whose session just hasn't loaded
    // yet, which is exactly what a slow cold start on a free-tier host
    // looks like from the outside.
    if (loading) return;
    if (!user) {
      router.replace("/login?next=/admin");
    } else if (user.role !== "admin") {
      router.replace("/market");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", bgcolor: "#faf7f0" }}>
        <CircularProgress sx={{ color: "#611818" }} />
      </Box>
    );
  }

  if (!user || user.role !== "admin") return null;

  return (
    <AdminShell
      nav={navItems}
      active={tab}
      onChange={setTab}
      title={tabCopy[tab].title}
      subtitle={tabCopy[tab].subtitle}
      adminName={user.fullName}
    >
      {tab === "overview" && <OverviewTab onError={setError} />}
      {tab === "users" && <UsersTab onError={setError} onSuccess={setSuccess} />}
      {tab === "ads" && <AdsTab onError={setError} onSuccess={setSuccess} />}
      {tab === "trades" && <TradesTab currentUserId={user.id} onError={setError} onSuccess={setSuccess} />}
      {tab === "kyc" && <KycTab onError={setError} onSuccess={setSuccess} />}
      {tab === "disputes" && <DisputesTab onError={setError} onSuccess={setSuccess} />}
      {tab === "treasury" && <TreasuryTab currentUserId={user.id} onError={setError} onSuccess={setSuccess} />}

      <Snackbar open={Boolean(error)} autoHideDuration={5000} onClose={() => setError("")}>
        <Alert severity="error" onClose={() => setError("")}>{error}</Alert>
      </Snackbar>
      <Snackbar open={Boolean(success)} autoHideDuration={4000} onClose={() => setSuccess("")}>
        <Alert severity="success" onClose={() => setSuccess("")}>{success}</Alert>
      </Snackbar>
      <Snackbar open={Boolean(newMessage)} autoHideDuration={8000} onClose={dismissNewMessage} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        {newMessage ? (
          <Alert
            severity="info"
            onClose={dismissNewMessage}
            sx={{ bgcolor: "#611818", color: "#fff", "& .MuiAlert-icon": { color: "#fff" } }}
            action={
              <Button
                size="small"
                onClick={() => {
                  setTab("trades");
                  dismissNewMessage();
                }}
                sx={{ color: "#fff", fontWeight: 900 }}
              >
                View
              </Button>
            }
          >
            {newMessage.senderName}: {newMessage.preview} ({newMessage.amount} {newMessage.asset})
          </Alert>
        ) : undefined}
      </Snackbar>
    </AdminShell>
  );
}
