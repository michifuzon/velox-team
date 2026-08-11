"use client";

import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Clock,
  Flag,
  Newspaper,
  Images,
  FileText,
  Settings,
} from "lucide-react";
import { AppNav, type NavItem } from "./AppNav";
import { createClient } from "@/lib/supabase/client";

const ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/staff/dashboard", icon: LayoutDashboard, primary: true },
  { label: "Horarios", href: "/staff/horarios", icon: Clock, primary: true },
  { label: "Carreras", href: "/staff/carreras", icon: Flag, primary: true },
  { label: "Noticias", href: "/staff/noticias", icon: Newspaper, primary: true },
  { label: "Galería", href: "/staff/galeria", icon: Images },
  { label: "Contenido", href: "/staff/contenido", icon: FileText },
  { label: "Configuración", href: "/staff/configuracion", icon: Settings },
];

export function StaffNav({
  user,
}: {
  user: { nombre: string; apellido: string; fotoUrl?: string | null };
}) {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <AppNav
      items={ITEMS}
      homeHref="/staff/dashboard"
      user={user}
      onSignOut={handleSignOut}
    />
  );
}
