"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Logo from "@/components/Logo";
import { api, ApiError } from "@/lib/api";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit() {
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await api.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "That reset link is invalid or has expired.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#faf7f0", px: { xs: 2, sm: 3 }, py: { xs: 4, md: 8 } }}>
      <Container maxWidth="sm" disableGutters>
        <Stack spacing={{ xs: 4, md: 5 }}>
          <Button href="/" sx={{ alignSelf: "flex-start", p: 0, minHeight: "auto" }}>
            <Logo markSize={38} />
          </Button>

          <Typography sx={{ color: "#200808", fontWeight: 1000, fontSize: { xs: 32, sm: 40 }, lineHeight: 1.05 }}>
            Choose a new password
          </Typography>

          {!token && (
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: "#fff1f2", color: "#be123c", border: "1px solid #fecdd3", boxShadow: "none" }}>
              <Typography sx={{ fontWeight: 800 }}>This link is missing its reset token. Request a new one.</Typography>
            </Paper>
          )}

          {done ? (
            <Paper sx={{ p: 2.5, borderRadius: 2, bgcolor: "#fdf6e9", color: "#8a5a10", border: "1px solid rgba(217,134,31,0.3)", boxShadow: "none" }}>
              <Typography sx={{ fontWeight: 800, mb: 1.5 }}>Your password has been reset.</Typography>
              <Button href="/login" variant="contained" sx={{ bgcolor: "#611818", "&:hover": { bgcolor: "#4a1212" } }}>
                Log in
              </Button>
            </Paper>
          ) : (
            token && (
              <Stack spacing={2.5}>
                {error && (
                  <Paper sx={{ p: 1.5, borderRadius: 2, bgcolor: "#fff1f2", color: "#be123c", border: "1px solid #fecdd3", boxShadow: "none" }}>
                    <Typography sx={{ fontWeight: 800, fontSize: 14 }}>{error}</Typography>
                  </Paper>
                )}
                <Stack spacing={1}>
                  <Typography sx={{ color: "#7a5a5a", fontWeight: 900, fontSize: 16 }}>New password</Typography>
                  <TextField
                    type="password"
                    value={password}
                    placeholder="********"
                    onChange={(event) => setPassword(event.target.value)}
                    fullWidth
                    sx={{ "& .MuiOutlinedInput-root": { minHeight: 64, bgcolor: "#fff", borderRadius: 1, fontSize: 20 }, "& fieldset": { borderColor: "transparent" } }}
                  />
                </Stack>
                <Stack spacing={1}>
                  <Typography sx={{ color: "#7a5a5a", fontWeight: 900, fontSize: 16 }}>Confirm password</Typography>
                  <TextField
                    type="password"
                    value={confirm}
                    placeholder="********"
                    onChange={(event) => setConfirm(event.target.value)}
                    fullWidth
                    sx={{ "& .MuiOutlinedInput-root": { minHeight: 64, bgcolor: "#fff", borderRadius: 1, fontSize: 20 }, "& fieldset": { borderColor: "transparent" } }}
                  />
                </Stack>
                <Button
                  variant="contained"
                  size="large"
                  disabled={submitting}
                  onClick={submit}
                  sx={{ minHeight: 60, borderRadius: 2, bgcolor: "#611818", fontSize: 18, fontWeight: 1000, "&:hover": { bgcolor: "#4a1212" } }}
                >
                  {submitting ? "Resetting..." : "Reset password"}
                </Button>
              </Stack>
            )
          )}
        </Stack>
      </Container>
    </Box>
  );
}
