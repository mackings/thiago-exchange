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
          <h2 className="font-display text-3xl font-extrabold text-maroon-950">
            Today&apos;s rates
          </h2>
          <p className="mt-2 text-maroon-950/60">
            A quick look at our buy &amp; sell rates. See the full board for
            all supported coins.
          </p>
        </div>
        <Link
          href="/rates"
          className="inline-flex items-center gap-1 font-bold text-maroon-700 hover:text-maroon-800"
        >
          Full rates board
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="mt-8">
        <LiveRatesPreviewGrid initialRates={preview} />
      </div>
    </section>
  );
}
