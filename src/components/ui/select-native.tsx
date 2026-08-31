import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

// A plain native <select>, styled to match Input, rather than a full Base UI
// Select — this app's dropdowns (status/role/rate-type filters) don't need
// custom option rendering, so the native control is simpler and free a11y.
export const SelectNative = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(
        "flex h-9 w-full appearance-none rounded-xl border border-input bg-card px-3 pr-8 text-sm text-foreground transition-colors outline-none focus-visible:border-maroon-500 focus-visible:ring-2 focus-visible:ring-maroon-500/20 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
  </div>
));
SelectNative.displayName = "SelectNative";
