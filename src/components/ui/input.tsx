import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex h-9 w-full min-w-0 rounded-xl border border-input bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors outline-none focus-visible:border-maroon-500 focus-visible:ring-2 focus-visible:ring-maroon-500/20 disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
