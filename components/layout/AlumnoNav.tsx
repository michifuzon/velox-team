"use client";

import { useRouter } from "next/navigation";
import {
  Home,
  User,
  ClipboardList,
  CalendarDays,
  Clock,
  Wallet,
  HeartPulse,
  LineChart,
  Flag,
  Bell,
} from "lucide-react";
import { AppNav, type NavItem } from "./AppNav";
import { createClient } from "@/lib/supabase/client";

const ITEMS: NavItem[] = [
  { label: "Inicio", href: "/alumno/dashboard", icon: Home, primary: true },
  { label: "Mis datos", href: "/alumno/mis-datos", icon: User },
  { label: "Ficha", href: "/alumno/ficha", icon: ClipboardList },
  { label: "Plan", href: "/alumno/plan", icon: CalendarDays, primary: true },
  { label: "Horarios", href: "/alumno/horarios", icon: Clock },
  { label: "Cuota", href: "/alumno/cuota", icon: Wallet, primary: true },
  { label: "Apto médico", href: "/alumno/apto-medico", icon: HeartPulse },
  { label: "Evaluaciones", href: "/alumno/evaluaciones", icon: LineChart },
  { label: "Carreras", href: "/alumno/carreras", icon: Flag },
  { label: "Avisos", href: "/alumno/notificaciones", icon: Bell, primary: true },
];

export function AlumnoNav({
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
      homeHref="/alumno/dashboard"
      user={user}
      onSignOut={handleSignOut}
    />
  );
}
