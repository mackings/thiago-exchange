"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/cn";

const storageKey = "thiago.admin.theme";

// Every design token (--card, --background, --border, etc.) is scoped to
// the .admin-scope div, not :root — so anything Base UI portals straight to
// document.body (Dialog, Popover, ...) would render outside that scope and
// lose every token. This context exposes the scope div itself so those
// components can portal INTO it instead, via Portal's `container` prop.
const AdminScopeContext = createContext<HTMLDivElement | null>(null);

export function useAdminScopeContainer() {
  return useContext(AdminScopeContext);
}

// Dark mode is scoped to the admin dashboard only — toggling here adds/removes
// .dark on this wrapper div, not <html>, so nothing outside /admin (which has
// no dark: styles defined) is ever affected.
export function AdminScope({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const scopeRef = useRef<HTMLDivElement>(null);
  const [scopeNode, setScopeNode] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    setDark(localStorage.getItem(storageKey) === "dark");
    setMounted(true);
    setScopeNode(scopeRef.current);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    localStorage.setItem(storageKey, next ? "dark" : "light");
  }

  return (
    <div ref={scopeRef} className={cn("admin-scope font-sans", mounted && dark && "dark")} suppressHydrationWarning>
      <AdminScopeContext.Provider value={scopeNode}>
        <button
          type="button"
          onClick={toggle}
          aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          className="fixed bottom-4 right-4 z-50 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/70 bg-card text-foreground shadow-sm transition-colors hover:bg-accent dark:border-slate-800"
        >
          {mounted && dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        {children}
      </AdminScopeContext.Provider>
    </div>
  );
}
