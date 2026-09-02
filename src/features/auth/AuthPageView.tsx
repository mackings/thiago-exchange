"use client";

import { useEffect, useState, type ReactNode } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
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
      if (err instanceof ApiError && err.status === 409) {
        setError("An account with this email already exists. Try logging in instead.");
      } else {
        setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const isLogin = mode === "login";
  const switchHref = `${isLogin ? "/signup" : "/login"}?next=${encodeURIComponent(nextPath)}`;

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
          }}
        >
          <Typography sx={{ color: "#200808", fontWeight: 1000, fontSize: { xs: 22, sm: 26 }, letterSpacing: "-0.02em" }}>
            {isLogin ? "Welcome back" : "Create your account"}
          </Typography>
          <Typography sx={{ mt: 0.5, color: "#7a5a5a", fontSize: { xs: 13.5, sm: 14.5 } }}>
            {isLogin ? "Log in to your Thiago Exchange account." : "Sign up to start trading with Thiago Exchange."}
          </Typography>

          <Stack spacing={2.25} sx={{ mt: { xs: 3, sm: 3.5 } }}>
            {error && (
              <Box sx={{ p: 1.4, borderRadius: 2, bgcolor: "#fbebeb", border: "1px solid rgba(97,24,24,0.14)" }}>
                <Typography sx={{ fontWeight: 700, fontSize: 13.5, color: "#611818" }}>{error}</Typography>
              </Box>
            )}

            {mode === "register" && (
              <>
                <AuthField label="Full name" placeholder="Your full name" value={name} onChange={setName} />
                <AuthField label="Phone number" placeholder="+234..." value={phone} onChange={setPhone} />
              </>
            )}

            <AuthField label="Email" placeholder="you@example.com" value={email} onChange={setEmail} type="email" />

            <AuthField
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={setPassword}
              type={showPassword ? "text" : "password"}
              labelAction={
                isLogin ? (
                  <Button
                    href="/forgot-password"
                    sx={{ minHeight: "auto", p: 0, fontSize: 12.5, fontWeight: 800, color: "#d9861f" }}
                  >
                    Forgot password?
                  </Button>
                ) : undefined
              }
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    aria-label={showPassword ? "hide password" : "show password"}
                    onClick={() => setShowPassword((value) => !value)}
                    sx={{ color: "#a58888" }}
                  >
                    {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              }
            />

            <Button
              variant="contained"
              size="large"
              fullWidth
              disabled={submitting}
              onClick={submit}
              sx={{
                mt: 0.5,
                minHeight: 50,
                borderRadius: 2,
                bgcolor: "#611818",
                color: "#fff",
                fontSize: 15.5,
                fontWeight: 900,
                textTransform: "none",
                boxShadow: "none",
                "&:hover": { bgcolor: "#4a1212", boxShadow: "none" },
                "&.Mui-disabled": { bgcolor: "#c9a9a9", color: "#fff" },
              }}
            >
              {submitting ? "Please wait..." : isLogin ? "Log in" : "Create account"}
            </Button>

            <Typography sx={{ color: "#7a5a5a", textAlign: "center", fontSize: 13.5, fontWeight: 600 }}>
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <Button
                href={switchHref}
                sx={{ minHeight: "auto", p: 0, verticalAlign: "baseline", color: "#611818", fontSize: "inherit", fontWeight: 900, textTransform: "none" }}
              >
                {isLogin ? "Sign up" : "Log in"}
              </Button>
            </Typography>
          </Stack>
        </Box>
      </Box>
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
  labelAction,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  endAdornment?: ReactNode;
  labelAction?: ReactNode;
}) {
  return (
    <Stack spacing={0.75}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography sx={{ color: "#4a3838", fontWeight: 700, fontSize: 13 }}>{label}</Typography>
        {labelAction}
      </Stack>
      <TextField
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        fullWidth
        InputProps={{ endAdornment }}
        sx={{
          "& .MuiOutlinedInput-root": {
            minHeight: 46,
            bgcolor: "#fff",
            borderRadius: 1.5,
            fontSize: 14.5,
            color: "#200808",
            "& fieldset": { borderColor: "rgba(32,8,8,0.14)" },
            "&:hover fieldset": { borderColor: "rgba(32,8,8,0.24)" },
            "&.Mui-focused fieldset": { borderColor: "#d9861f", borderWidth: 1.5 },
          },
          "& .MuiInputBase-input": {
            px: 1.6,
            py: 1.2,
            "&::placeholder": { color: "#b8a3a3", opacity: 1, fontWeight: 500 },
          },
        }}
      />
    </Stack>
  );
}
