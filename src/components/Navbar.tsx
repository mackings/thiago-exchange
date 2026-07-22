"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Logo from "@/components/Logo";
import { navLinks } from "@/lib/site";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-maroon-600/10 bg-cream-100/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" onClick={() => setOpen(false)}>
          <Logo markSize={40} />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold tracking-wide transition-colors ${
                  active
                    ? "text-maroon-700"
                    : "text-maroon-950/70 hover:text-maroon-700"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/contact"
            className="rounded-full bg-gradient-to-r from-maroon-600 to-maroon-700 px-5 py-2 text-sm font-bold text-cream-50 shadow-sm shadow-maroon-900/20 transition hover:brightness-110"
          >
            Get Started
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-lg p-2 text-maroon-700 md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-maroon-600/10 bg-cream-100 px-4 pb-4 pt-2 md:hidden">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                  active
                    ? "bg-maroon-600/10 text-maroon-700"
                    : "text-maroon-950/70"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="mt-2 rounded-full bg-gradient-to-r from-maroon-600 to-maroon-700 px-4 py-2 text-center text-sm font-bold text-cream-50"
          >
            Get Started
          </Link>
        </nav>
      )}
    </header>
  );
}
