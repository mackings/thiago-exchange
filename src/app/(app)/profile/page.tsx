"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { api, type AdDTO } from "@/lib/api";
import { useSession } from "@/lib/session-context";
import { PageFrame } from "@/components/muiapp/PageFrame";
import { ProfileView } from "@/features/profile/ProfileView";

export default function ProfilePage() {
  const router = useRouter();
  const { user, refreshUser, logout } = useSession();
  const [ads, setAds] = useState<AdDTO[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    api.listAds().then(setAds).catch(() => undefined);
  }, []);

  return (
    <PageFrame backHref="/market">
      <ProfileView
        user={user ?? undefined}
        ads={ads}
        onSave={async (input) => {
          const updated = await api.updateMe(input);
          refreshUser(updated);
        }}
        onLogout={() => {
          logout();
          router.push("/");
        }}
        onError={setError}
        onSuccess={setSuccess}
      />
      <Snackbar open={Boolean(error)} autoHideDuration={5000} onClose={() => setError("")}>
        <Alert severity="error" onClose={() => setError("")}>{error}</Alert>
      </Snackbar>
      <Snackbar open={Boolean(success)} autoHideDuration={4000} onClose={() => setSuccess("")}>
        <Alert severity="success" onClose={() => setSuccess("")}>{success}</Alert>
      </Snackbar>
    </PageFrame>
  );
}
