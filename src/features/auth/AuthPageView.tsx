"use client";

import { useEffect, useState, type ReactNode } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import Logo from "@/components/Logo";
import { useSession } from "@/lib/session-context";
import { ApiError } from "@/lib/api";

export type AuthMode = "login" | "register";

export function AuthPageView({ mode }: { mode: AuthMode }) {
  const { login, register } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [nextPath, setNextPath] = useState("/market");
  const [explicitNext, setExplicitNext] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");
    if (next?.startsWith("/")) {
      setNextPath(next);
      setExplicitNext(true);
    }
  }, []);

  async function submit() {
    setSubmitting(true);
    setError("");
    try {
      const authedUser = mode === "register" ? await register({ email, password, fullName: name, phone }) : await login(email, password);
      // Admins land in the console by default — the trading UI isn't where
      // they'd go next, and there's no other link to it in the app once
      // they're past this screen. A caller-specified `next` still wins (e.g.
      // continuing a trade that required login).
      const destination = !explicitNext && authedUser.role === "admin" ? "/admin" : nextPath;
      window.location.href = destination;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const isLogin = mode === "login";
  const switchHref = `${isLogin ? "/signup" : "/login"}?next=${encodeURIComponent(nextPath)}`;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#faf7f0", px: { xs: 2, sm: 3 }, py: { xs: 4, md: 8 }, overflowX: "hidden" }}>
      <Container maxWidth="sm" disableGutters>
        <Stack spacing={{ xs: 4, md: 5 }}>
          <Button href="/" sx={{ alignSelf: "flex-start", p: 0, minHeight: "auto" }}>
            <Logo markSize={38} />
          </Button>

          <Box>
            <Typography sx={{ color: "#200808", fontWeight: 1000, fontSize: { xs: 38, sm: 46 }, lineHeight: 1.02, letterSpacing: 0 }}>
              {isLogin ? "Welcome Back," : "Create Account,"}
            </Typography>
            <Typography sx={{ mt: 1.2, color: "#7a5a5a", fontWeight: 800, fontSize: { xs: 20, sm: 23 }, lineHeight: 1.35 }}>
              {isLogin ? "Kindly enter your details to log in." : "Kindly enter your details to get started."}
            </Typography>
          </Box>

          <Stack spacing={{ xs: 2.5, md: 3 }}>
            {error && (
              <Paper sx={{ p: 1.5, borderRadius: 2, bgcolor: "#fff1f2", color: "#be123c", border: "1px solid #fecdd3", boxShadow: "none" }}>
                <Typography sx={{ fontWeight: 800, fontSize: 14 }}>{error}</Typography>
              </Paper>
            )}

            {mode === "register" && (
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <AuthField label="Full Name" placeholder="Your full name" value={name} onChange={setName} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <AuthField label="Phone Number" placeholder="+234..." value={phone} onChange={setPhone} />
                </Box>
              </Stack>
            )}

            <AuthField label="Email Address" placeholder="example@gmail.com" value={email} onChange={setEmail} type="email" />
            <AuthField
              label="Password"
              placeholder="********"
              value={password}
              onChange={setPassword}
              type={showPassword ? "text" : "password"}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    aria-label={showPassword ? "hide password" : "show password"}
                    onClick={() => setShowPassword((value) => !value)}
                    sx={{ color: "#7a5a5a" }}
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              }
            />

            {isLogin && (
              <Button
                href="/forgot-password"
                sx={{
                  alignSelf: "flex-start",
                  minHeight: "auto",
                  p: 0,
                  borderRadius: 0,
                  color: "#d9861f",
                  borderBottom: "1px solid #d9861f",
                  fontSize: 18,
                  fontWeight: 900,
                }}
              >
                Forgot Password
              </Button>
            )}

            <Button
              variant="contained"
              size="large"
              disabled={submitting}
              onClick={submit}
              sx={{
                mt: { xs: 1, md: 1.5 },
                minHeight: 60,
                borderRadius: 2,
                bgcolor: "#611818",
                color: "#fff",
                fontSize: 18,
                fontWeight: 1000,
                "&:hover": { bgcolor: "#4a1212" },
                "&.Mui-disabled": { bgcolor: "#c9a9a9", color: "#fff" },
              }}
            >
              {submitting ? "Please wait..." : isLogin ? "Login" : "Create Account"}
            </Button>

            <Typography sx={{ color: "#200808", textAlign: "center", fontSize: { xs: 16, sm: 18 }, fontWeight: 900 }}>
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <Button
                href={switchHref}
                sx={{ minHeight: "auto", p: 0, verticalAlign: "baseline", color: "#d9861f", fontSize: "inherit", fontWeight: 1000 }}
              >
                {isLogin ? "Create Account" : "Login"}
              </Button>
            </Typography>
          </Stack>

          <Paper sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3, bgcolor: "#fff", boxShadow: "none" }}>
            <Typography sx={{ color: "#7a5a5a", fontWeight: 1000, fontSize: 15 }}>SECURE ACCESS</Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ mt: 0.5 }}>
              {["Live offers", "Escrow-protected trades", "Trade history"].map((item) => (
                <Box key={item} sx={{ flex: 1, minWidth: 0, p: 1.2, borderRadius: 2, bgcolor: "#faf7f0", color: "#200808", fontWeight: 900, textAlign: "center", fontSize: 13 }}>
                  {item}
                </Box>
              ))}
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}

function AuthField({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  endAdornment,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  endAdornment?: ReactNode;
}) {
  return (
    <Stack spacing={1}>
      <Typography sx={{ color: "#7a5a5a", fontWeight: 900, fontSize: { xs: 15, sm: 16 } }}>{label}</Typography>
      <TextField
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        fullWidth
        InputProps={{ endAdornment }}
        sx={{
          "& .MuiOutlinedInput-root": {
            minHeight: 64,
            bgcolor: "#fff",
            borderRadius: 1,
            fontSize: { xs: 18, sm: 20 },
            color: "#200808",
            "& fieldset": { borderColor: "transparent" },
            "&:hover fieldset": { borderColor: "transparent" },
            "&.Mui-focused": { bgcolor: "#fdf6e9" },
            "&.Mui-focused fieldset": { borderColor: "#d9861f", borderWidth: 2 },
          },
          "& .MuiInputBase-input": {
            px: 2,
            py: 1.65,
            "&::placeholder": { color: "#a58888", opacity: 1, fontWeight: 800 },
          },
        }}
      />
    </Stack>
  );
}
