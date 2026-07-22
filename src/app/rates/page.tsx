import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import CtaBanner from "@/components/CtaBanner";
import LiveRatesBoard from "@/components/LiveRatesBoard";
import { getRates } from "@/lib/rates";

export const metadata: Metadata = {
  title: "Rates | Thiago Exchange",
  description:
    "Live buy and sell rates for Bitcoin, USDT, Ethereum and other major coins on Thiago Exchange.",
};

export default async function RatesPage() {
  const { rates } = await getRates();

  return (
    <>
      <PageHeader
        eyebrow="Live Rates"
        title="Today's buy & sell rates"
        description="Rates are tied to the live market price with a transparent margin. Always confirm your exact quote with our team before sending funds."
      />

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <LiveRatesBoard initialRates={rates} />
      </section>

      <CtaBanner />
    </>
  );
}
