import Link from "next/link";
import Logo from "@/components/Logo";

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
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-grid px-4 py-10">
      <Link href="/" className="mb-8">
        <Logo markSize={40} />
      </Link>
      <div className="w-full max-w-sm rounded-2xl border border-cream-300 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="font-display text-2xl font-extrabold text-maroon-950">{title}</h1>
        <p className="mt-1 text-sm text-maroon-950/60">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
      <p className="mt-6 text-sm text-maroon-950/60">{footer}</p>
    </div>
  );
}
