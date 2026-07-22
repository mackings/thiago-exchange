import { SiBitcoin } from "react-icons/si";

export default function Logo({
  className = "",
  markSize = 44,
  variant = "default",
}: {
  className?: string;
  markSize?: number;
  variant?: "default" | "light";
}) {
  const isLight = variant === "light";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className="relative shrink-0"
        style={{ width: markSize, height: markSize }}
      >
        <svg
          viewBox="0 0 48 48"
          width={markSize}
          height={markSize}
          className="drop-shadow-sm"
        >
          <defs>
            <linearGradient id="goldRing" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f0b654" />
              <stop offset="100%" stopColor="#b96a17" />
            </linearGradient>
          </defs>
          <path
            d="M24 6a18 18 0 0 1 16.6 11"
            fill="none"
            stroke="url(#goldRing)"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M35 12 L41.5 13.5 L39 6.5"
            fill="none"
            stroke="url(#goldRing)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M24 42a18 18 0 0 1-16.6-11"
            fill="none"
            stroke="url(#goldRing)"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M13 36 L6.5 34.5 L9 41.5"
            fill="none"
            stroke="url(#goldRing)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="absolute inset-[9px] flex items-center justify-center rounded-full bg-gradient-to-br from-gold-400 to-gold-600 shadow-inner">
          <SiBitcoin className="text-maroon-900" size={markSize * 0.42} />
        </div>
      </div>
      <div className="flex flex-col leading-none">
        <span
          className={`font-display font-extrabold tracking-tight text-[1.15em] ${
            isLight ? "text-white" : "text-maroon-700"
          }`}
          style={{ fontSize: markSize * 0.34 }}
        >
          THIAGO
        </span>
        <span
          className={`font-display font-bold tracking-[0.2em] ${
            isLight ? "text-gold-200" : "text-maroon-950"
          }`}
          style={{ fontSize: markSize * 0.24 }}
        >
          EXCHANGE
        </span>
      </div>
    </div>
  );
}
