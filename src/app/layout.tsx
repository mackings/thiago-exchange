import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/lib/session-context";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Thiago Exchange | Trade Crypto with Confidence",
  description:
    "Thiago Exchange is a trusted crypto exchange platform for buying and selling Bitcoin, USDT, Ethereum and more. Fast, secure and reliable trading — BeTradeConfident.",
  keywords: [
    "Thiago Exchange",
    "crypto exchange",
    "buy bitcoin",
    "sell usdt",
    "crypto trading Nigeria",
  ],
  openGraph: {
    title: "Thiago Exchange | Trade Crypto with Confidence",
    description:
      "Fast, secure and reliable crypto exchange for BTC, USDT, ETH and more.",
    siteName: "Thiago Exchange",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable} h-full`}>
      <body
        className="min-h-full flex flex-col bg-cream-100 text-maroon-950 antialiased"
        suppressHydrationWarning
      >
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
