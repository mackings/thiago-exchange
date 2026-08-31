"use client";

import Chip from "@mui/material/Chip";
import type { OrderDTO } from "@/lib/api";

const colorFor: Record<OrderDTO["status"], "success" | "info" | "warning" | "error" | undefined> = {
  created: "warning",
  awaiting_payment: "warning",
  payment_marked: "warning",
  payment_confirmed: "info",
  released: "info",
  completed: "success",
  cancelled: undefined,
  disputed: "error",
};

const labelFor: Record<OrderDTO["status"], string> = {
  created: "PENDING",
  awaiting_payment: "PENDING",
  payment_marked: "PAYMENT MARKED",
  payment_confirmed: "CONFIRMED",
  released: "RELEASED",
  completed: "PAID",
  cancelled: "CANCELLED",
  disputed: "DISPUTED",
};

export function StatusChip({ status }: { status: OrderDTO["status"] }) {
  return (
    <Chip
      size="small"
      color={colorFor[status]}
      label={labelFor[status]}
      sx={{
        fontWeight: 900,
        alignSelf: "flex-start",
        // MUI's "default" chip is a faint translucent fill with dark text —
        // unreadable on the dark maroon chat header this also renders on, so
        // cancelled gets an explicit solid style instead of relying on it.
        ...(status === "cancelled" && { bgcolor: "#7a5a5a", color: "#fff" }),
      }}
    />
  );
}
