"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LineChart, ListOrdered, ShieldCheck, UserRound } from "lucide-react";
import Logo from "@/components/Logo";
import { useSession } from "@/lib/session-context";

const navItems = [
  { href: "/market", label: "Market", icon: LineChart },
  { href: "/orders", label: "Orders", icon: ListOrdered },
  { href: "/kyc", label: "Profile", icon: UserRound },
] as const;

const adminItem = { href: "/admin", label: "Admin", icon: ShieldCheck };

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, pathname, router]);

  const items = user?.role === "admin" ? [...navItems, adminItem] : navItems;

  if (loading || !user) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center py-24">
        <p className="text-sm text-maroon-950/50">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-cream-100">
      <header className="sticky top-0 z-40 border-b border-cream-300 bg-cream-100/95 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/market">
            <Logo markSize={32} />
          </Link>
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="text-sm font-semibold text-maroon-950/60 hover:text-maroon-700"
          >
            Log out
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        <nav className="hidden w-56 shrink-0 flex-col gap-1 border-r border-cream-300 bg-white p-4 sm:flex">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                  active ? "bg-maroon-700/10 text-maroon-700" : "text-maroon-950/60 hover:bg-cream-200"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-24 pt-4 sm:pb-8">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-cream-300 bg-white/95 backdrop-blur sm:hidden">
        <div className="flex items-stretch justify-around">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-semibold ${
                  active ? "text-maroon-700" : "text-maroon-950/50"
                }`}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
