import type { Metadata } from "next";
import { Compass, ShieldCheck, BookOpen, Scale } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import CtaBanner from "@/components/CtaBanner";
import { coins } from "@/lib/coins";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Us | Thiago Exchange",
  description:
    "Learn what drives Thiago Exchange — conviction, confidence and real crypto knowledge behind every trade.",
};

const values = [
  {
    icon: Compass,
    title: "Conviction",
    description:
      "We believe in trading with a clear head — know your side, know your reasons, and stand your ground.",
  },
  {
    icon: ShieldCheck,
    title: "Confidence",
    description:
      "Every rate we quote and every trade we settle is built to earn your trust, one transaction at a time.",
  },
  {
    icon: BookOpen,
    title: "Crypto Knowledge",
    description:
      "The market moves fast. We stay close to it so you always get an informed, fair rate.",
  },
  {
    icon: Scale,
    title: "Stability & Growth",
    description:
      "Whether you're Team USDT or Team BTC, we support both sides of the trade with equal care.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About Us"
        title={`Behind every trade at ${site.name}`}
        description="Not about roses or chocolates. Not about hype either. It's about conviction, confidence, and real crypto knowledge — the same values that guide how we treat every customer who trades with us."
      />

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-2xl font-extrabold text-maroon-950">
          Our story
        </h2>
        <p className="mt-4 text-maroon-950/70">
          {site.name}{" "}
          started as a straightforward idea: crypto trading
          shouldn&apos;t feel confusing or risky for the person on the other
          side of the screen. We built a desk where you can buy and sell the
          coins you already know — Bitcoin, USDT, Ethereum and more — backed
          by real people who understand the market and treat your trade like
          it matters, because it does.
        </p>
        <p className="mt-4 text-maroon-950/70">
          We run our exchange the way we&apos;d want to be treated as
          customers: clear rates before you commit, quick confirmations, and
          a support line that actually replies. Under the banner{" "}
          <span className="font-bold text-maroon-700">
            {site.tagline}
          </span>
          , that&apos;s the standard we hold ourselves to on every single
          trade.
        </p>
      </section>

      <section className="bg-cream-200/60 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center font-display text-3xl font-extrabold text-maroon-950">
            What we stand for
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl border border-cream-300 bg-white p-6 text-center shadow-sm"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-maroon-600 to-maroon-700 text-cream-50">
                  <value.icon size={22} />
                </div>
                <h3 className="mt-4 font-display font-bold text-maroon-950">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm text-maroon-950/60">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <h2 className="font-display text-3xl font-extrabold text-maroon-950">
            Coins we trade
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-maroon-950/60">
            One desk, every major coin — buy or sell with confidence.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {coins.map((coin) => (
            <div
              key={coin.id}
              className="flex flex-col items-center gap-2 rounded-2xl border border-cream-300 bg-white px-4 py-5 text-center shadow-sm"
            >
              <coin.icon size={28} style={{ color: coin.color }} />
              <span className="text-sm font-bold text-maroon-950">
                {coin.symbol}
              </span>
              <span className="text-xs text-maroon-950/50">{coin.name}</span>
            </div>
          ))}
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
