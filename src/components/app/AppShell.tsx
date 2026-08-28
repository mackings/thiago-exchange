"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ListOrdered, ShieldCheck, Store, UserRound } from "lucide-react";
import { useSession } from "@/lib/session-context";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, pathname, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center py-24">
        <p className="text-sm text-maroon-950/50">Loading…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-1 flex-col bg-cream-100">
      <main className="flex-1 pb-24">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md">
        <div className="relative flex items-end justify-around border-t border-cream-300 bg-white px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
          <NavLink href="/orders" label="Orders" icon={ListOrdered} active={isActive(pathname, "/orders")} />

          <Link
            href="/market"
            className="-mt-7 flex flex-col items-center gap-1"
            aria-label="Market"
          >
            <span
              className={`flex h-14 w-14 items-center justify-center rounded-full border-4 border-white shadow-lg transition-colors ${
                isActive(pathname, "/market") ? "bg-maroon-700" : "bg-gold-500"
              }`}
            >
              <Store size={24} className="text-white" />
            </span>
            <span
              className={`text-[11px] font-bold ${isActive(pathname, "/market") ? "text-maroon-700" : "text-maroon-950/50"}`}
            >
              Market
            </span>
          </Link>

          <NavLink href="/kyc" label="Profile" icon={UserRound} active={isActive(pathname, "/kyc")} />

          {user.role === "admin" && (
            <NavLink href="/admin" label="Admin" icon={ShieldCheck} active={isActive(pathname, "/admin")} />
          )}
        </div>
      </nav>
    </div>
  );
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof ListOrdered;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-1 flex-col items-center gap-1 py-2 text-xs font-semibold ${
        active ? "text-maroon-700" : "text-maroon-950/40"
      }`}
    >
      <Icon size={20} />
      {label}
    </Link>
  );
}
