import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

export const statTones = {
  maroon: { bg: "bg-maroon-100 dark:bg-maroon-950", fg: "text-maroon-700 dark:text-maroon-300" },
  maroonMuted: { bg: "bg-maroon-50 dark:bg-maroon-950/70", fg: "text-maroon-600 dark:text-maroon-300" },
  maroonStrong: { bg: "bg-maroon-200 dark:bg-maroon-900", fg: "text-maroon-800 dark:text-maroon-200" },
  gold: { bg: "bg-gold-100 dark:bg-gold-900", fg: "text-gold-700 dark:text-gold-200" },
  slate: { bg: "bg-slate-100 dark:bg-slate-800", fg: "text-slate-600 dark:text-slate-300" },
} as const;

export function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  tone: keyof typeof statTones;
}) {
  const t = statTones[tone];
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
        </div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${t.bg} ${t.fg}`}>{icon}</div>
      </CardContent>
    </Card>
  );
}
