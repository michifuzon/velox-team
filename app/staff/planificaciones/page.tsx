import { requireRole, STAFF_ROLES } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { PlanificacionesManager } from "@/components/staff/PlanificacionesManager";
import type { PlanEntrenamientoRow } from "@/types/database";

export default async function PlanificacionesPage() {
  const profile = await requireRole(...STAFF_ROLES);
  const supabase = await createClient();

  const [{ data: planes }, { data: grupos }, { data: alumnos }] = await Promise.all([
    supabase
      .from("planes_entrenamiento")
      .select("*")
      .order("fecha_inicio", { ascending: false }),
    supabase.from("grupos").select("id, nombre").order("nombre"),
    supabase
      .from("profiles")
      .select("id, nombre, apellido")
      .eq("role", "alumno")
      .order("apellido"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Planificaciones"
        description="Planes de entrenamiento individuales o grupales del equipo."
      />
      <PlanificacionesManager
        staffId={profile.id}
        planes={(planes ?? []) as PlanEntrenamientoRow[]}
        grupos={grupos ?? []}
        alumnos={alumnos ?? []}
      />
    </div>
  );
}
