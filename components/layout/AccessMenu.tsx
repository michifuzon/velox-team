"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, LogIn, Users } from "lucide-react";

type AccessMenuProps = {
  role: "admin" | "profesor" | null;
};

export function AccessMenu({ role }: AccessMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isStaff = role === "admin" || role === "profesor";

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const items = isStaff
    ? [{ label: "Panel de administración", href: "/staff/dashboard", icon: Users }]
    : [{ label: "Iniciar sesión", href: "/login", icon: LogIn }];

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-ink-700/50 transition-colors hover:bg-mist-100 hover:text-ink-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
      >
        {role ? "Admin" : "Acceder"}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-mist-200 bg-white p-1.5 shadow-xl"
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-800"
            >
              <item.icon className="h-4 w-4 text-brand-600" />
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
