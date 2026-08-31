import { forwardRef, type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

// The app-wide status-pill formula: bg-{color}-100 text-{color}-700
// dark:bg-{color}-950-or-500/15 dark:text-{color}-300 — one fixed tone per
// meaning, used everywhere so color alone is a reliable signal. Built from
// Thiago's maroon/gold brand family (no green, no generic SaaS indigo) —
// "danger" and "brand" both live in the maroon family, distinguished by
// how saturated/dark the pairing is, since maroon *is* this app's red.
const badgeVariants = cva("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold", {
  variants: {
    tone: {
      brand: "bg-maroon-50 text-maroon-700 dark:bg-maroon-950 dark:text-maroon-300",
      success: "bg-gold-200 text-gold-800 dark:bg-gold-900 dark:text-gold-100",
      warning: "bg-gold-100 text-gold-700 dark:bg-gold-900/70 dark:text-gold-200",
      danger: "bg-maroon-200 text-maroon-800 dark:bg-maroon-900 dark:text-maroon-200",
      info: "bg-maroon-50 text-maroon-600 dark:bg-maroon-950/70 dark:text-maroon-300",
      neutral: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    },
  },
  defaultVariants: { tone: "neutral" },
});

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(({ className, tone, ...props }, ref) => (
  <span ref={ref} className={cn(badgeVariants({ tone }), className)} {...props} />
));
Badge.displayName = "Badge";
