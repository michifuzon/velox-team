"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, GraduationCap, LogIn, UserPlus, Users } from "lucide-react";

type AccessMenuProps = {
  role: "admin" | "profesor" | "profesor_secundario" | "alumno" | null;
};

export function AccessMenu({ role }: AccessMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isStaff = role === "admin" || role === "profesor" || role === "profesor_secundario";

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

  const items = [
    ...(!role ? [{ label: "Iniciar sesión", href: "/login", icon: LogIn }] : []),
    ...(!role ? [{ label: "Registrarse", href: "/registro", icon: UserPlus }] : []),
    ...(role === "alumno"
      ? [{ label: "Portal del alumno", href: "/alumno/dashboard", icon: GraduationCap }]
      : []),
    ...(isStaff
      ? [{ label: "Panel del profesor", href: "/staff/dashboard", icon: Users }]
      : []),
  ];

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
      >
        {role ? "Mi portal" : "Acceder"}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
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
