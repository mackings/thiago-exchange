"use client";

import type { ComponentProps, ReactNode } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAdminScopeContainer } from "@/components/admin/AdminScope";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({ className, children, ...props }: ComponentProps<typeof DialogPrimitive.Popup>) {
  // Portal into .admin-scope (not the default document.body) so the
  // portaled content stays inside the div that actually defines --card,
  // --background, --border etc. — without this, bg-card/border-border
  // resolve to nothing and the dialog renders see-through.
  const container = useAdminScopeContainer();
  return (
    <DialogPrimitive.Portal container={container}>
      <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/40 transition-opacity duration-150 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0" />
      <DialogPrimitive.Popup
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200/70 bg-card p-5 text-card-foreground shadow-md outline-none transition-all duration-150 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 dark:border-slate-800 max-h-[85vh] overflow-y-auto",
          className,
        )}
        {...props}
      >
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
          <X className="h-4 w-4" />
        </DialogPrimitive.Close>
        {children}
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-1 pr-6", className)} {...props} />;
}

export function DialogTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn("font-heading text-lg font-bold tracking-tight", className)} {...props} />;
}

export function DialogDescription({ className, ...props }: ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cn("text-xs text-muted-foreground", className)} {...props} />;
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />;
}

export function DialogBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mt-4 space-y-4", className)}>{children}</div>;
}
