"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { cn } from "@/lib/cn";

export function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-transparent bg-slate-200 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-maroon-500/40 data-[checked]:bg-maroon-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-700",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block h-4 w-4 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform data-[checked]:translate-x-[18px]" />
    </SwitchPrimitive.Root>
  );
}
