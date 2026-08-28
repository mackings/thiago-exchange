import Link from "next/link";
import { SiBitcoin } from "react-icons/si";
import { heroPanelClass, heroSheetClass } from "@/lib/ui";

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-1 flex-col bg-cream-100">
      <div className={`${heroPanelClass} flex flex-col items-center pb-16 pt-10 text-center`}>
        <Link href="/" className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-500">
          <SiBitcoin size={26} className="text-maroon-900" />
        </Link>
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-white/50">Thiago Exchange</p>
        <h1 className="mt-1 font-display text-2xl font-extrabold">{title}</h1>
        <p className="mt-1 text-sm text-white/60">{subtitle}</p>
      </div>

      <div className={`${heroSheetClass} -mt-10 flex flex-1 flex-col`}>
        <div className="rounded-2xl border border-cream-300 bg-white p-6">{children}</div>
        <p className="mt-6 text-center text-sm text-maroon-950/60">{footer}</p>
      </div>
    </div>
  );
}
