import { MessageSquareText, ShieldCheck, Wallet } from "lucide-react";

const steps = [
  {
    icon: MessageSquareText,
    title: "1. Tell us what you want to trade",
    description:
      "Reach out on WhatsApp or the contact form with the coin and amount you want to buy or sell.",
  },
  {
    icon: ShieldCheck,
    title: "2. Confirm the rate",
    description:
      "We give you a clear, live rate. No hidden charges, no surprises — you confirm before anything moves.",
  },
  {
    icon: Wallet,
    title: "3. Get settled fast",
    description:
      "Send your coin or payment and receive your payout promptly once confirmed on our end.",
  },
];

export default function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <h2 className="font-display text-3xl font-extrabold text-maroon-950">
          How it works
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-maroon-950/60">
          A simple, three-step process built around clarity and speed.
        </p>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {steps.map((step) => (
          <div
            key={step.title}
            className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 text-maroon-950">
              <step.icon size={22} />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-maroon-950">
              {step.title}
            </h3>
            <p className="mt-2 text-sm text-maroon-950/60">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
