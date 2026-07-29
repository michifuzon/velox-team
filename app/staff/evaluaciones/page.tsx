import { requireRole, STAFF_ROLES } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EvaluacionesManager } from "@/components/staff/EvaluacionesManager";
import type { EvaluacionRow } from "@/types/database";

export default async function StaffEvaluacionesPage() {
  await requireRole(...STAFF_ROLES);
  const supabase = await createClient();

  const [{ data: evaluaciones }, { data: alumnos }] = await Promise.all([
    supabase.from("evaluaciones").select("*").order("fecha", { ascending: false }),
    supabase.from("profiles").select("id, nombre, apellido").eq("role", "alumno").order("apellido"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Evaluaciones"
        description="Resultados de tests físicos y seguimiento de la evolución de cada alumno."
      />
      <EvaluacionesManager
        evaluaciones={(evaluaciones ?? []) as EvaluacionRow[]}
        alumnos={alumnos ?? []}
      />
    </div>
  );
}
