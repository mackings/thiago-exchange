"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import Logo from "@/components/Logo";
import { api, ApiError } from "@/lib/api";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailBody />
    </Suspense>
  );
}

function VerifyEmailBody() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [status, setStatus] = useState<"checking" | "done" | "error">("checking");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("This link is missing its verification token.");
      return;
    }
    api
      .verifyEmail(token)
      .then(() => setStatus("done"))
      .catch((err) => {
        setStatus("error");
        setError(err instanceof ApiError ? err.message : "That verification link is invalid or has expired.");
      });
  }, [token]);

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        bgcolor: "#faf7f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 2, sm: 3 },
        py: { xs: 5, sm: 6 },
        overflowX: "hidden",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 440 }}>
        <Stack alignItems="center" sx={{ mb: { xs: 3, sm: 4 } }}>
          <Button href="/" sx={{ p: 0, minHeight: "auto" }}>
            <Logo markSize={38} />
          </Button>
        </Stack>

        <Box
          sx={{
            bgcolor: "#fff",
            border: "1px solid rgba(32,8,8,0.08)",
            borderRadius: { xs: 3, sm: 4 },
            p: { xs: 2.75, sm: 4 },
            boxShadow: "0 1px 3px rgba(32,8,8,0.04)",
            textAlign: "center",
          }}
        >
          {status === "checking" && (
            <Stack spacing={2} alignItems="center" sx={{ py: 2 }}>
              <CircularProgress size={32} sx={{ color: "#611818" }} />
              <Typography sx={{ color: "#7a5a5a", fontSize: 14.5 }}>Verifying your email...</Typography>
            </Stack>
          )}

          {status === "done" && (
            <Stack spacing={1.5} alignItems="center" sx={{ py: 1 }}>
              <CheckCircleIcon sx={{ fontSize: 40, color: "#8a5a10" }} />
              <Typography sx={{ color: "#200808", fontWeight: 1000, fontSize: 22 }}>Email verified</Typography>
              <Typography sx={{ color: "#7a5a5a", fontSize: 14 }}>
                You're all set — you can now open trades on Thiago Exchange.
              </Typography>
              <Button
                href="/login"
                variant="contained"
                fullWidth
                sx={{ mt: 1, minHeight: 46, borderRadius: 2, bgcolor: "#611818", fontSize: 14.5, fontWeight: 900, textTransform: "none", boxShadow: "none", "&:hover": { bgcolor: "#4a1212", boxShadow: "none" } }}
              >
                Log in
              </Button>
            </Stack>
          )}

          {status === "error" && (
            <Stack spacing={1.5} alignItems="center" sx={{ py: 1 }}>
              <ErrorOutlineIcon sx={{ fontSize: 40, color: "#611818" }} />
              <Typography sx={{ color: "#200808", fontWeight: 1000, fontSize: 22 }}>Link didn&apos;t work</Typography>
              <Typography sx={{ color: "#7a5a5a", fontSize: 14 }}>{error}</Typography>
              <Button
                href="/profile"
                variant="contained"
                fullWidth
                sx={{ mt: 1, minHeight: 46, borderRadius: 2, bgcolor: "#611818", fontSize: 14.5, fontWeight: 900, textTransform: "none", boxShadow: "none", "&:hover": { bgcolor: "#4a1212", boxShadow: "none" } }}
              >
                Request a new link from your profile
              </Button>
            </Stack>
          )}
        </Box>
      </Box>
    </Box>
  );
}
