import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { coins } from "@/lib/coins";

export default function Hero() {
  const featured = coins.slice(0, 6);

  return (
    <section className="relative overflow-hidden bg-grid">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-[-6%] h-[26rem] w-[26rem] rounded-full border border-gold-400/25"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 right-[2%] h-72 w-72 rounded-full border border-gold-400/20"
      />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 md:items-center md:py-28">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gold-700">
            <ShieldCheck size={14} />
            BeTradeConfident
          </span>

          <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-maroon-950 sm:text-5xl lg:text-6xl">
            Trade crypto with{" "}
            <span className="text-gold-600">conviction</span>, not
            guesswork.
          </h1>

          <p className="mt-5 max-w-lg text-lg text-maroon-950/70">
            Thiago Exchange is your trusted desk for buying and selling
            Bitcoin, USDT, Ethereum and more — real rates, real support,
            settled fast.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 rounded-full bg-maroon-700 px-6 py-3 font-bold text-cream-50 shadow-sm transition-colors hover:bg-maroon-800"
            >
              Start Trading
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
            <Link
              href="/rates"
              className="inline-flex items-center gap-2 rounded-full border-2 border-maroon-600 px-6 py-3 font-bold text-maroon-700 transition-colors hover:bg-maroon-600 hover:text-cream-50"
            >
              View Live Rates
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-semibold text-maroon-950/60">
            <span>Supported assets:</span>
            <div className="flex items-center -space-x-2">
              {featured.map((coin) => (
                <span
                  key={coin.id}
                  title={coin.name}
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-cream-100 bg-white shadow-sm transition-transform hover:z-10 hover:-translate-y-1"
                >
                  <coin.icon size={18} style={{ color: coin.color }} />
                </span>
              ))}
              <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-cream-100 bg-maroon-700 text-xs font-bold text-cream-50">
                +{coins.length - featured.length}
              </span>
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm">
          <div className="rounded-3xl border border-cream-300 bg-white p-6 shadow-xl shadow-maroon-950/[0.06]">
            <div className="h-1 w-10 rounded-full bg-gold-400" />
            <p className="mt-4 text-xs font-bold uppercase tracking-widest text-maroon-950/50">
              This Valentine season debate
            </p>
            <h2 className="mt-2 font-display text-2xl font-extrabold text-maroon-950">
              USDT <span className="text-gold-600">or</span> BTC
            </h2>
            <p className="mt-3 text-sm text-maroon-950/60">
              Stable &amp; predictable, or volatile &amp; potentially
              life-changing? Pick your side and trade it with us.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-cream-300 bg-cream-100 p-4 text-center transition-colors hover:border-maroon-300">
                <p className="text-xs font-bold uppercase tracking-wide text-maroon-950/50">
                  Team Stability
                </p>
                <p className="mt-1 font-display text-xl font-extrabold text-maroon-700">
                  USDT
                </p>
              </div>
              <div className="rounded-xl border border-gold-200 bg-gold-50 p-4 text-center transition-colors hover:border-gold-400">
                <p className="text-xs font-bold uppercase tracking-wide text-maroon-950/50">
                  Team Growth
                </p>
                <p className="mt-1 font-display text-xl font-extrabold text-gold-700">
                  BTC
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
