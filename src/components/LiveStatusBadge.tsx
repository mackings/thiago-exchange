import type { LiveStatus } from "@/hooks/useLiveRates";

const copy: Record<LiveStatus, string> = {
  connecting: "Connecting to live feed…",
  live: "Live prices",
  reconnecting: "Reconnecting…",
};

export default function LiveStatusBadge({ status }: { status: LiveStatus }) {
  const dotColor =
    status === "live"
      ? "bg-emerald-500"
      : status === "reconnecting"
        ? "bg-red-500"
        : "bg-gold-500";

  return (
    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-maroon-950/60">
      <span className="relative flex h-2.5 w-2.5">
        {status !== "reconnecting" && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full ${dotColor} opacity-60`}
          />
        )}
        <span
          className={`relative inline-flex h-2.5 w-2.5 rounded-full ${dotColor}`}
        />
      </span>
      {copy[status]}
    </span>
  );
}
