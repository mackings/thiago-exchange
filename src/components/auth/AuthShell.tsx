import Link from "next/link";
import Logo from "@/components/Logo";

export default function AuthShell({
  title,
  switchHref,
  switchLabel,
  children,
  footer,
}: {
  title: string;
  switchHref: string;
  switchLabel: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-1 flex-col bg-white px-5 pt-8">
      <Link href="/">
        <Logo markSize={30} />
      </Link>

      <div className="mt-10 flex items-center justify-between border-b border-cream-200 pb-4">
        <h1 className="font-display text-xl font-extrabold text-maroon-950">{title}</h1>
        <Link href={switchHref} className="text-sm font-bold text-maroon-700">
          {switchLabel}
        </Link>
      </div>

      <div className="mt-6 flex-1">{children}</div>

      <p className="pb-8 pt-6 text-center text-xs text-maroon-950/40">{footer}</p>
    </div>
  );
}
