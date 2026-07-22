import { Clock, Lock, LineChart, Headset } from "lucide-react";

const points = [
  {
    icon: Clock,
    title: "Fast Settlements",
    description: "Trades are confirmed and settled quickly, no long waits.",
  },
  {
    icon: LineChart,
    title: "Transparent Rates",
    description:
      "Rates are based on live market prices with a clear, fair margin.",
  },
  {
    icon: Lock,
    title: "Secure Trading",
    description:
      "Every trade is confirmed step by step before funds are released.",
  },
  {
    icon: Headset,
    title: "Real Human Support",
    description:
      "Chat directly with our team on WhatsApp for any question, anytime.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-maroon-950 py-16 text-cream-100">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="font-display text-3xl font-extrabold">
            Why trade with Thiago Exchange
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-cream-100/60">
            Conviction, confidence and real crypto knowledge — that&apos;s
            what backs every trade.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {points.map((point) => (
            <div
              key={point.title}
              className="rounded-2xl border border-cream-100/10 bg-white/5 p-6"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-400/20 text-gold-300">
                <point.icon size={20} />
              </div>
              <h3 className="mt-4 font-display font-bold">{point.title}</h3>
              <p className="mt-2 text-sm text-cream-100/60">
                {point.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
