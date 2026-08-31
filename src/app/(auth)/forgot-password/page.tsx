"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Logo from "@/components/Logo";
import { api, ApiError } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function submit() {
    setSubmitting(true);
    setError("");
    try {
      await api.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#faf7f0", px: { xs: 2, sm: 3 }, py: { xs: 4, md: 8 } }}>
      <Container maxWidth="sm" disableGutters>
        <Stack spacing={{ xs: 4, md: 5 }}>
          <Button href="/login" sx={{ alignSelf: "flex-start", p: 0, minHeight: "auto" }}>
            <Logo markSize={38} />
          </Button>

          <Box>
            <Typography sx={{ color: "#200808", fontWeight: 1000, fontSize: { xs: 32, sm: 40 }, lineHeight: 1.05 }}>
              Reset your password
            </Typography>
            <Typography sx={{ mt: 1.2, color: "#7a5a5a", fontWeight: 800, fontSize: { xs: 17, sm: 19 }, lineHeight: 1.4 }}>
              Enter the email on your account and we&apos;ll send you a reset link.
            </Typography>
          </Box>

          {sent ? (
            <Paper sx={{ p: 2.5, borderRadius: 2, bgcolor: "#fdf6e9", color: "#8a5a10", border: "1px solid rgba(217,134,31,0.3)", boxShadow: "none" }}>
              <Typography sx={{ fontWeight: 800 }}>
                If an account exists for {email}, a reset link is on its way. Check your inbox.
              </Typography>
            </Paper>
          ) : (
            <Stack spacing={2.5}>
              {error && (
                <Paper sx={{ p: 1.5, borderRadius: 2, bgcolor: "#fff1f2", color: "#be123c", border: "1px solid #fecdd3", boxShadow: "none" }}>
                  <Typography sx={{ fontWeight: 800, fontSize: 14 }}>{error}</Typography>
                </Paper>
              )}
              <Stack spacing={1}>
                <Typography sx={{ color: "#7a5a5a", fontWeight: 900, fontSize: 16 }}>Email Address</Typography>
                <TextField
                  type="email"
                  value={email}
                  placeholder="example@gmail.com"
                  onChange={(event) => setEmail(event.target.value)}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": { minHeight: 64, bgcolor: "#fff", borderRadius: 1, fontSize: 20 },
                    "& fieldset": { borderColor: "transparent" },
                  }}
                />
              </Stack>
              <Button
                variant="contained"
                size="large"
                disabled={submitting || !email}
                onClick={submit}
                sx={{
                  minHeight: 60,
                  borderRadius: 2,
                  bgcolor: "#611818",
                  fontSize: 18,
                  fontWeight: 1000,
                  "&:hover": { bgcolor: "#4a1212" },
                }}
              >
                {submitting ? "Sending..." : "Send reset link"}
              </Button>
              <Typography sx={{ textAlign: "center", fontWeight: 900 }}>
                <Button href="/login" sx={{ p: 0, minHeight: "auto", color: "#d9861f", fontWeight: 1000 }}>
                  Back to login
                </Button>
              </Typography>
            </Stack>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
