"use client";

import { useEffect, useState } from "react";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TimerIcon from "@mui/icons-material/Timer";

const paymentWindowMs = 30 * 60 * 1000;

export function TradeTimer({ deadline, onExpired, dark = false }: { deadline: string; onExpired: () => void; dark?: boolean }) {
  const [now, setNow] = useState(Date.now());
  const expiresAt = new Date(deadline).getTime();
  const remaining = Math.max(0, expiresAt - now);
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  const progress = Math.max(0, Math.min(100, (remaining / paymentWindowMs) * 100));

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (remaining === 0) onExpired();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);

  return (
    <Stack spacing={0.7}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <TimerIcon color={dark ? "secondary" : "primary"} sx={{ fontSize: { xs: 22, md: 24 } }} />
        <Typography sx={{ fontWeight: 1000, color: dark ? "#fff" : "text.primary", fontSize: { xs: 20, md: 24 }, lineHeight: 1 }}>
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </Typography>
      </Stack>
      <LinearProgress variant="determinate" value={progress} color={progress < 25 ? "error" : "secondary"} sx={{ height: 6, borderRadius: 999 }} />
    </Stack>
  );
}
