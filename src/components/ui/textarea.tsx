import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-16 w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors outline-none focus-visible:border-maroon-500 focus-visible:ring-2 focus-visible:ring-maroon-500/20 disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
