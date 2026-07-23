import Link from "next/link";
import { Send } from "lucide-react";
import { SiWhatsapp, SiBitcoin } from "react-icons/si";
import { whatsappLink } from "@/lib/site";

export default function CtaBanner() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <div className="bg-grid-dark relative overflow-hidden rounded-3xl border border-gold-400/20 bg-maroon-950 px-8 py-14 text-center text-cream-100 sm:px-16">
        <SiBitcoin
          aria-hidden
          className="pointer-events-none absolute -bottom-10 -right-10 text-gold-300/[0.06]"
          size={220}
        />
        <h2 className="relative font-display text-3xl font-extrabold sm:text-4xl">
          Ready to trade smarter?
        </h2>
        <p className="relative mx-auto mt-3 max-w-xl text-cream-100/70">
          Whether you&apos;re Team Stability or Team Growth, our desk is
          ready. Reach out and let&apos;s get your trade sorted.
        </p>
        <div className="relative mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href={whatsappLink("Hello Thiago Exchange, I'd like to trade.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-bold text-white shadow-lg shadow-black/20 transition-transform hover:-translate-y-0.5"
          >
            <SiWhatsapp size={18} />
            Chat on WhatsApp
          </a>
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2 rounded-full border-2 border-gold-300 px-6 py-3 font-bold text-gold-200 transition-colors hover:bg-gold-300 hover:text-maroon-950"
          >
            <Send
              size={18}
              className="transition-transform group-hover:translate-x-0.5"
            />
            Send a Message
          </Link>
        </div>
      </div>
    </section>
  );
}
