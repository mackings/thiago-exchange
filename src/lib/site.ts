export const site = {
  name: "Thiago Exchange",
  tagline: "BeTradeConfident",
  description:
    "Fast, secure and reliable crypto exchange for BTC, USDT, ETH and more.",
  whatsappNumber: "2348167556757",
  whatsappDisplay: "+234 (0) 816 755 6757",
  instagramHandle: "Thiago_crypto_02",
  instagramUrl: "https://instagram.com/Thiago_crypto_02",
} as const;

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${site.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/rates", label: "Rates" },
  { href: "/contact", label: "Contact" },
] as const;
