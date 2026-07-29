"use client";

import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UsersRound,
  Clock,
  CalendarRange,
  ClipboardCheck,
  Wallet,
  HeartPulse,
  LineChart,
  Flag,
  Megaphone,
  Newspaper,
  Quote,
  Settings,
} from "lucide-react";
import { AppNav, type NavItem } from "./AppNav";
import { createClient } from "@/lib/supabase/client";

const ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/staff/dashboard", icon: LayoutDashboard, primary: true },
  { label: "Alumnos", href: "/staff/alumnos", icon: Users, primary: true },
  { label: "Grupos", href: "/staff/grupos", icon: UsersRound },
  { label: "Horarios", href: "/staff/horarios", icon: Clock },
  { label: "Planificaciones", href: "/staff/planificaciones", icon: CalendarRange },
  { label: "Asistencia", href: "/staff/asistencia", icon: ClipboardCheck, primary: true },
  { label: "Cuotas", href: "/staff/cuotas", icon: Wallet },
  { label: "Aptos médicos", href: "/staff/aptos-medicos", icon: HeartPulse },
  { label: "Evaluaciones", href: "/staff/evaluaciones", icon: LineChart },
  { label: "Carreras", href: "/staff/carreras", icon: Flag },
  { label: "Avisos", href: "/staff/avisos", icon: Megaphone, primary: true },
  { label: "Noticias", href: "/staff/noticias", icon: Newspaper },
  { label: "Testimonios", href: "/staff/testimonios", icon: Quote },
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
