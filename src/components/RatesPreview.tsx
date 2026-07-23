import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getRates } from "@/lib/rates";
import LiveRatesPreviewGrid from "@/components/LiveRatesPreviewGrid";

export default async function RatesPreview() {
  const { rates } = await getRates();
  const preview = rates.slice(0, 6);

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="inline-flex rounded-full border border-maroon-600/20 bg-maroon-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-maroon-700">
            Live Market
          </span>
          <h2 className="mt-4 font-display text-3xl font-extrabold text-maroon-950 sm:text-4xl">
            Today&apos;s rates
          </h2>
          <p className="mt-2 text-maroon-950/60">
            A quick look at our buy &amp; sell rates. See the full board for
            all supported coins.
          </p>
        </div>
        <Link
          href="/rates"
          className="group inline-flex items-center gap-1 font-bold text-maroon-700 hover:text-maroon-800"
        >
          Full rates board
          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>
      </div>

      <div className="mt-8">
        <LiveRatesPreviewGrid initialRates={preview} />
      </div>
    </section>
  );
}
