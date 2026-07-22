import Link from "next/link";
import { Mail } from "lucide-react";
import { SiInstagram, SiWhatsapp } from "react-icons/si";
import Logo from "@/components/Logo";
import { navLinks, site, whatsappLink } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="border-t border-cream-300 bg-maroon-950 text-cream-100">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <Logo variant="light" markSize={44} />
          <p className="mt-4 max-w-xs text-sm text-cream-100/70">
            {site.description} Pick your side, trade with conviction —{" "}
            {site.tagline}.
          </p>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-widest text-gold-300">
            Quick Links
          </h3>
          <ul className="mt-4 space-y-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-cream-100/80 hover:text-gold-300"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-widest text-gold-300">
            Get In Touch
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-cream-100/80">
            <li className="flex items-center gap-2">
              <SiWhatsapp size={16} className="text-gold-300" />
              <a
                href={whatsappLink("Hello Thiago Exchange, I'd like to trade.")}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold-300"
              >
                {site.whatsappDisplay}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <SiInstagram size={16} className="text-gold-300" />
              <a
                href={site.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold-300"
              >
                @{site.instagramHandle}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} className="text-gold-300" />
              <Link href="/contact" className="hover:text-gold-300">
                Send us a message
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream-100/10 px-4 py-5 text-center text-xs text-cream-100/50 sm:px-6">
        © {new Date().getFullYear()} {site.name}. All rights reserved.
      </div>
    </footer>
  );
}
