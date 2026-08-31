"use client";

import { useEffect, useState, type FormEvent } from "react";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import GppGoodIcon from "@mui/icons-material/GppGood";
import ShieldIcon from "@mui/icons-material/Shield";
import { api, ApiError, type KYCDTO } from "@/lib/api";
import { useSession } from "@/lib/session-context";
import { PageFrame } from "@/components/muiapp/PageFrame";

const statusColor: Record<KYCDTO["status"], "default" | "warning" | "success" | "error"> = {
  unverified: "default",
  pending: "warning",
  verified: "success",
  rejected: "error",
};

const statusLabel: Record<KYCDTO["status"], string> = {
  unverified: "Not submitted",
  pending: "Under review",
  verified: "Verified",
  rejected: "Rejected — resubmit",
};

const idTypes = [
  { value: "national_id", label: "National ID (NIN)" },
  { value: "passport", label: "International Passport" },
  { value: "drivers_license", label: "Driver's License" },
  { value: "voters_card", label: "Voter's Card" },
];

export default function KycPage() {
  const { user } = useSession();
  const [kyc, setKyc] = useState<KYCDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fullName, setFullName] = useState("");
  const [idType, setIdType] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    api
      .myKYC()
      .then(setKyc)
      .catch(() => setKyc(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setFullName(user?.fullName || "");
  }, [user]);

  const status = kyc?.status ?? user?.kycStatus ?? "unverified";
  const canSubmit = status === "unverified" || status === "rejected";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError("Attach a photo of your ID.");
      return;
    }
    setError("");
    setSubmitting(true);
    const form = new FormData();
    form.append("fullName", fullName);
    form.append("idType", idType);
    form.append("idNumber", idNumber);
    form.append("document", file);
    try {
      const result = await api.submitKYC(form);
      setKyc(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't submit — try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageFrame backHref="/profile">
      {loading ? (
        <Typography color="text.secondary">Loading verification status...</Typography>
      ) : (
        <Stack spacing={{ xs: 1.6, md: 2.5 }}>
          <Stack direction="row" spacing={1.4} alignItems="center">
            <Avatar sx={{ width: 54, height: 54, bgcolor: "#611818", fontWeight: 1000 }}>
              {user?.fullName?.[0]?.toUpperCase() ?? "U"}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography sx={{ fontWeight: 1000, fontSize: { xs: 20, md: 26 } }}>{user?.fullName}</Typography>
              <Typography color="text.secondary" sx={{ fontSize: 14 }}>{user?.email}</Typography>
            </Box>
            <Chip icon={<ShieldIcon />} label={statusLabel[status]} color={statusColor[status]} sx={{ fontWeight: 900 }} />
          </Stack>

          {kyc?.reviewNote && status === "rejected" && (
            <Alert severity="error" sx={{ borderRadius: 3 }}>{kyc.reviewNote}</Alert>
          )}

          {status === "verified" && (
            <Card variant="outlined" sx={{ borderRadius: 5, borderColor: "rgba(217,134,31,0.24)", bgcolor: "#fdf6e9" }}>
              <CardContent sx={{ p: { xs: 2, md: 3 }, textAlign: "center" }}>
                <GppGoodIcon sx={{ fontSize: 40, color: "#8a5a10", mb: 1 }} />
                <Typography sx={{ fontWeight: 1000, fontSize: 18, color: "#8a5a10" }}>You&apos;re verified</Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>Higher trading limits are unlocked on your account.</Typography>
              </CardContent>
            </Card>
          )}

          {status === "pending" && (
            <Alert severity="info" sx={{ borderRadius: 3 }}>Your documents are under review. This usually takes less than 24 hours.</Alert>
          )}

          {canSubmit && (
            <Card variant="outlined" sx={{ borderRadius: { xs: 4, md: 5 }, borderColor: "rgba(217,134,31,0.18)" }}>
              <CardContent sx={{ p: { xs: 1.75, md: 3 } }}>
                <Stack component="form" onSubmit={handleSubmit} spacing={1.6}>
                  <Typography sx={{ fontWeight: 1000, fontSize: 18 }}>Verify your identity</Typography>
                  <TextField label="Full legal name" value={fullName} onChange={(event) => setFullName(event.target.value)} required fullWidth />
                  <TextField label="ID type" select value={idType} onChange={(event) => setIdType(event.target.value)} required fullWidth>
                    {idTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                    ))}
                  </TextField>
                  <TextField label="ID number" value={idNumber} onChange={(event) => setIdNumber(event.target.value)} required fullWidth />
                  <Button component="label" variant="outlined" sx={{ alignSelf: "flex-start", borderColor: "rgba(217,134,31,0.4)" }}>
                    {file ? file.name : "Upload ID document"}
                    <input hidden type="file" accept="image/*,application/pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
                  </Button>
                  {error && <Alert severity="error">{error}</Alert>}
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={submitting}
                    sx={{ alignSelf: "flex-start", bgcolor: "#611818", "&:hover": { bgcolor: "#4a1212" } }}
                  >
                    {submitting ? "Submitting..." : "Submit for verification"}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          )}
        </Stack>
      )}
    </PageFrame>
  );
}
