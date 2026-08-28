import type { Metadata } from "next";
import { Clock, MessageCircle } from "lucide-react";
import { SiInstagram, SiWhatsapp } from "react-icons/si";
import PageHeader from "@/components/PageHeader";
import ContactForm from "@/components/ContactForm";
import { site, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us | Thiago Exchange",
  description:
    "Get in touch with Thiago Exchange on WhatsApp, Instagram, or send us a message directly.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact Us"
        title="Let's get your trade sorted"
        description="Have a question about a rate, a coin we support, or how to get started? Reach out — we reply fast."
      />

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <ContactForm />

        <div className="space-y-4">
          <a
            href={whatsappLink("Hello Thiago Exchange, I'd like to trade.")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-2xl border border-cream-300 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-[#25D366]/40 hover:shadow-md"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#25D366]/10 text-[#25D366]">
              <SiWhatsapp size={22} />
            </span>
            <div>
              <p className="font-display font-bold text-maroon-950">
                WhatsApp
              </p>
              <p className="text-sm text-maroon-950/60">
                {site.whatsappDisplay}
              </p>
            </div>
          </a>

          <a
            href={site.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-2xl border border-cream-300 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-gold-400/50 hover:shadow-md"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold-400/10 text-gold-600">
              <SiInstagram size={22} />
            </span>
            <div>
              <p className="font-display font-bold text-maroon-950">
                Instagram
              </p>
              <p className="text-sm text-maroon-950/60">
                @{site.instagramHandle}
              </p>
            </div>
          </a>

          <div className="flex items-center gap-4 rounded-2xl border border-cream-300 bg-white p-5 shadow-sm">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-maroon-600/10 text-maroon-700">
              <Clock size={22} />
            </span>
            <div>
              <p className="font-display font-bold text-maroon-950">
                Response Time
              </p>
              <p className="text-sm text-maroon-950/60">
                We aim to reply to every message as quickly as possible.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-gold-300/50 bg-gold-50 p-5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold-400/20 text-gold-700">
              <MessageCircle size={22} />
            </span>
            <p className="text-sm text-maroon-950/70">
              For the fastest response, message us directly on WhatsApp with
              the coin and amount you&apos;d like to trade.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
