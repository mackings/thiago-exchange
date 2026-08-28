import { Check } from "lucide-react";
import type { OrderDTO } from "@/lib/api";

const steps: { key: OrderDTO["status"]; label: string }[] = [
  { key: "awaiting_payment", label: "Awaiting payment" },
  { key: "payment_marked", label: "Payment marked" },
  { key: "payment_confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
];

export default function OrderStatusStepper({ status }: { status: OrderDTO["status"] }) {
  if (status === "cancelled") {
    return (
      <div className="rounded-lg bg-cream-200 px-4 py-3 text-center text-sm font-bold text-maroon-950/60">
        Order cancelled
      </div>
    );
  }
  if (status === "disputed") {
    return (
      <div className="rounded-lg bg-red-50 px-4 py-3 text-center text-sm font-bold text-red-700">
        Under dispute — our team is reviewing this order
      </div>
    );
  }

  const currentIndex = steps.findIndex((s) => s.key === status);

  return (
    <div className="flex items-center">
      {steps.map((step, i) => {
        const done = i < currentIndex || status === "completed";
        const active = i === currentIndex && status !== "completed";
        return (
          <div key={step.key} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  done
                    ? "bg-maroon-700 text-cream-50"
                    : active
                      ? "border-2 border-maroon-700 text-maroon-700"
                      : "border-2 border-cream-300 text-maroon-950/30"
                }`}
              >
                {done ? <Check size={14} /> : i + 1}
              </span>
              <span
                className={`whitespace-nowrap text-[11px] font-semibold ${
                  done || active ? "text-maroon-950" : "text-maroon-950/40"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`mx-1 h-0.5 flex-1 ${done ? "bg-maroon-700" : "bg-cream-300"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
