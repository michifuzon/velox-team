import {
  Users,
  UserPlus,
  ClipboardCheck,
  CalendarPlus,
  LineChart,
  Wallet,
  Megaphone,
  Flag,
} from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SummaryCard } from "@/components/ui/SummaryCard";
import { ButtonLink } from "@/components/ui/Button";
import { requireRole, STAFF_ROLES } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const QUICK_ACTIONS = [
  { label: "Crear alumno", href: "/staff/alumnos", icon: UserPlus },
  { label: "Crear grupo", href: "/staff/grupos", icon: Users },
  { label: "Tomar asistencia", href: "/staff/asistencia", icon: ClipboardCheck },
  { label: "Crear entrenamiento", href: "/staff/planificaciones", icon: CalendarPlus },
  { label: "Cargar evaluación", href: "/staff/evaluaciones", icon: LineChart },
  { label: "Crear cuota", href: "/staff/cuotas", icon: Wallet },
  { label: "Enviar aviso", href: "/staff/avisos", icon: Megaphone },
  { label: "Crear carrera", href: "/staff/carreras", icon: Flag },
];

export default async function StaffDashboardPage() {
  const profile = await requireRole(...STAFF_ROLES);
  const supabase = await createClient();

  const mesActual = new Date().toISOString().slice(0, 7);

  const [
    { count: alumnosActivos },
    { count: cuotasPendientes },
    { count: cuotasVencidas },
    { count: aptosVencidos },
    { count: aptosEnRevision },
    { count: proximasCarreras },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "alumno")
      .eq("activo", true),
    supabase
      .from("cuotas")
      .select("id", { count: "exact", head: true })
      .eq("mes", mesActual)
      .eq("estado", "pendiente"),
    supabase
      .from("cuotas")
      .select("id", { count: "exact", head: true })
      .eq("mes", mesActual)
      .eq("estado", "vencida"),
    supabase
      .from("aptos_medicos")
      .select("id", { count: "exact", head: true })
      .eq("estado", "vencido"),
    supabase
      .from("aptos_medicos")
      .select("id", { count: "exact", head: true })
      .eq("estado", "en_revision"),
    supabase
      .from("carreras")
      .select("id", { count: "exact", head: true })
      .eq("estado", "proxima"),
  ]);

  const INDICATORS = [
    { label: "Alumnos activos", value: alumnosActivos ?? 0, icon: Users },
    { label: "Cuotas pendientes", value: cuotasPendientes ?? 0, icon: Wallet },
    { label: "Cuotas vencidas", value: cuotasVencidas ?? 0, icon: Wallet },
    { label: "Aptos vencidos", value: aptosVencidos ?? 0, icon: ClipboardCheck },
    { label: "Aptos en revisión", value: aptosEnRevision ?? 0, icon: ClipboardCheck },
    { label: "Próximas carreras", value: proximasCarreras ?? 0, icon: Flag },
  ];

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        eyebrow="Panel de gestión"
        title={`Hola, ${profile.nombre}`}
        description="Indicadores generales del equipo y accesos rápidos a las tareas más frecuentes."
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {INDICATORS.map(({ label, value, icon: Icon }) => (
          <SummaryCard key={label} label={label}>
            <div className="flex items-center justify-between">
              <p className="font-display text-2xl font-bold text-ink-950">
                {value}
              </p>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-950/5 text-ink-950">
                <Icon size={16} />
              </span>
            </div>
          </SummaryCard>
        ))}
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-bold text-ink-950">
          Accesos rápidos
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {QUICK_ACTIONS.map(({ label, href, icon: Icon }) => (
            <ButtonLink
              key={href}
              href={href}
              variant="outline"
              className="h-auto flex-col gap-2 rounded-2xl py-5"
            >
              <Icon size={20} />
              <span className="text-xs">{label}</span>
            </ButtonLink>
          ))}
        </div>
      </div>
    </div>
  );
}
