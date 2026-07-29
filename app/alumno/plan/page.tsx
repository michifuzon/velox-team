import { CalendarDays } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PlanView } from "@/components/alumno/PlanView";
import type { EntrenamientoRow, RegistroEntrenamientoRow } from "@/types/database";

export default async function PlanPage() {
  const profile = await requireRole("alumno");
  const supabase = await createClient();

  const { data: inscripcion } = await supabase
    .from("inscripciones_grupo")
    .select("grupo_id")
    .eq("alumno_id", profile.id)
    .eq("activo", true)
    .maybeSingle();
  const grupoId = (inscripcion as { grupo_id: string } | null)?.grupo_id ?? null;

  const orFilter = grupoId
    ? `alumno_id.eq.${profile.id},grupo_id.eq.${grupoId}`
    : `alumno_id.eq.${profile.id}`;

  const { data: planes } = await supabase
    .from("planes_entrenamiento")
    .select("*")
    .or(orFilter)
    .order("fecha_inicio", { ascending: false })
    .limit(1);

  const plan = planes?.[0] ?? null;

  let entrenamientos: EntrenamientoRow[] = [];
  let registros: RegistroEntrenamientoRow[] = [];

  if (plan) {
    const { data: semanas } = await supabase
      .from("semanas_entrenamiento")
      .select("*")
      .eq("plan_id", plan.id)
      .order("numero_semana", { ascending: false })
      .limit(1);

    const semana = semanas?.[0] ?? null;

    if (semana) {
      const { data: ents } = await supabase
        .from("entrenamientos")
        .select("*")
        .eq("semana_id", semana.id)
        .order("fecha", { ascending: true });
      entrenamientos = (ents as EntrenamientoRow[]) ?? [];

      if (entrenamientos.length > 0) {
        const { data: regs } = await supabase
          .from("registros_entrenamiento")
          .select("*")
          .eq("alumno_id", profile.id)
          .in("entrenamiento_id", entrenamientos.map((e) => e.id));
        registros = (regs as RegistroEntrenamientoRow[]) ?? [];
      }
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Plan de entrenamiento"
        description="Tu planificación semanal. Marcá cada entrenamiento como realizado y registrá cómo te fue."
      />

      {entrenamientos.length === 0 ? (
        <Card>
          <EmptyState
            icon={CalendarDays}
            title="No hay entrenamientos asignados para esta semana"
            description="Cuando tu profesor cargue tu planificación, la vas a ver acá."
          />
        </Card>
      ) : (
        <PlanView entrenamientos={entrenamientos} registros={registros} alumnoId={profile.id} />
      )}
    </div>
  );
}
