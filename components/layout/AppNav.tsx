"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid2x2, LogOut, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Shown in the mobile bottom bar (max ~4); every item is always reachable via "Más". */
  primary?: boolean;
};

export function AppNav({
  items,
  homeHref,
  user,
  onSignOut,
}: {
  items: NavItem[];
  homeHref: string;
  user: { nombre: string; apellido: string; fotoUrl?: string | null };
  onSignOut: () => void;
}) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (href: string) =>
    href === homeHref ? pathname === href : pathname.startsWith(href);

  const primaryItems = items.filter((i) => i.primary).slice(0, 4);

  return (
    <>
      {/* ===== Desktop sidebar ===== */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-brand-800 lg:flex">
        <div className="px-5 pb-2 pt-6">
          <Logo href={homeHref} size="sm" tone="dark" />
        </div>

        <nav className="mt-4 flex-1 space-y-1 overflow-y-auto px-3">
          {items.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-semibold transition-colors",
                  active
                    ? "bg-brand-100 text-brand-800"
                    : "text-white/60 hover:bg-white/8 hover:text-white"
                )}
              >
                <item.icon size={18} strokeWidth={2.25} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/5 p-2.5">
            <Avatar nombre={user.nombre} apellido={user.apellido} fotoUrl={user.fotoUrl} size={36} />
            <span className="truncate text-sm font-semibold text-white">
              {user.nombre} {user.apellido}
            </span>
          </div>
          <button
            onClick={onSignOut}
            className="flex w-full items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white/55 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut size={17} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ===== Mobile top bar ===== */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-mist-200 bg-white/95 px-4 backdrop-blur lg:hidden">
        <Logo href={homeHref} size="sm" />
        <div className="flex items-center gap-2">
          <Avatar nombre={user.nombre} apellido={user.apellido} fotoUrl={user.fotoUrl} size={34} />
          <button
            onClick={onSignOut}
            aria-label="Cerrar sesión"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-mist-300 bg-white text-ink-950"
          >
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {/* ===== Mobile bottom nav ===== */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-ink-950/8 bg-white/95 backdrop-blur lg:hidden">
        {primaryItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-semibold",
                active ? "text-brand-700" : "text-ink-700/50"
              )}
            >
              <item.icon size={20} strokeWidth={active ? 2.5 : 2} />
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={() => setMoreOpen(true)}
          className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-semibold text-ink-700/50"
        >
          <Grid2x2 size={20} />
          Más
        </button>
      </nav>

      {moreOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-950/40"
            onClick={() => setMoreOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[75vh] overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display text-base font-bold text-ink-950">
                Menú
              </span>
              <button
                onClick={() => setMoreOpen(false)}
                aria-label="Cerrar menú"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-mist-300 bg-white"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex flex-col gap-1.5 pb-4">
              {items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border px-4 py-3.5 text-sm font-semibold",
                      active
                        ? "border-brand-500 bg-brand-50 text-brand-800"
                        : "border-mist-200 bg-white text-ink-700"
                    )}
                  >
                    <item.icon size={19} className="shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
