import { coins } from "@/lib/coins";

export default function CoinsStrip() {
  return (
    <section className="border-y border-cream-300 bg-cream-200/60 py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-maroon-950/50">
          Trade all major coins on one desk
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-6">
          {coins.map((coin) => (
            <div
              key={coin.id}
              className="flex items-center gap-2 text-maroon-950/70"
              title={coin.name}
            >
              <coin.icon size={22} style={{ color: coin.color }} />
              <span className="text-sm font-semibold">{coin.symbol}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
