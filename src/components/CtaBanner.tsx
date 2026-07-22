import Link from "next/link";
import { Send } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { whatsappLink } from "@/lib/site";

export default function CtaBanner() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-maroon-700 to-maroon-950 px-8 py-14 text-center text-cream-100 sm:px-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gold-400/20 blur-3xl"
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
            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-bold text-white shadow-lg transition hover:brightness-110"
          >
            <SiWhatsapp size={18} />
            Chat on WhatsApp
          </a>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full border-2 border-gold-300 px-6 py-3 font-bold text-gold-200 transition hover:bg-gold-300 hover:text-maroon-950"
          >
            <Send size={18} />
            Send a Message
          </Link>
        </div>
      </div>
    </section>
  );
}
