// Shared class strings — flat, native-app styling (no gradients, no
// decorative texture blocks, minimal nested borders) matching a modern
// exchange app's actual UI: filled borderless inputs, one unmistakable
// high-contrast pill CTA, thin plain top bars instead of hero banners.

export const inputClass =
  "w-full rounded-xl border-0 bg-cream-200/70 px-4 py-3.5 text-[15px] text-maroon-950 outline-none transition-colors placeholder:text-maroon-950/35 focus:bg-cream-200 focus:ring-2 focus:ring-maroon-700/25 disabled:opacity-50";

export const labelClass = "text-sm font-semibold text-maroon-950/70";

export const primaryButtonClass =
  "inline-flex w-full items-center justify-center gap-2 rounded-full bg-maroon-700 px-6 py-4 text-[15px] font-bold text-white transition-colors hover:bg-maroon-800 disabled:cursor-not-allowed disabled:bg-maroon-700/25 disabled:text-white/60";

export const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-full border border-cream-300 bg-white px-6 py-3 font-bold text-maroon-900 transition hover:bg-cream-100 disabled:cursor-not-allowed disabled:opacity-50";

export const cardClass = "rounded-2xl bg-white p-4";

// Flat, borderless boxes for grouped fields (the "I will pay / I will
// receive" ticket pattern) — no card-in-a-card nesting.
export const flatBoxClass = "rounded-xl bg-cream-200/60 px-4 py-3";

// A slim plain top bar — replaces the old colored hero-with-texture panel.
// Content flows directly beneath it on the page background; no overlap
// trick, no negative margins, no nested nested cards.
export const topBarClass = "flex items-center justify-between px-4 py-3.5";
export const pageClass = "px-4 pb-8 pt-2";
