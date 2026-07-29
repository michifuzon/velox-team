import { requireRole, STAFF_ROLES } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CarrerasManager } from "@/components/staff/CarrerasManager";
import type { CarreraRow, ParticipacionCarreraRow } from "@/types/database";

export default async function StaffCarrerasPage() {
  await requireRole(...STAFF_ROLES);
  const supabase = await createClient();

  const [{ data: carreras }, { data: participaciones }, { data: alumnos }] = await Promise.all([
    supabase.from("carreras").select("*").order("fecha", { ascending: false }),
    supabase.from("participaciones_carrera").select("*"),
    supabase.from("profiles").select("id, nombre, apellido").eq("role", "alumno"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Carreras"
        description="Carreras del equipo, participantes anotados y carga de resultados."
      />
      <CarrerasManager
        carreras={(carreras ?? []) as CarreraRow[]}
        participaciones={(participaciones ?? []) as ParticipacionCarreraRow[]}
        alumnos={alumnos ?? []}
      />
    </div>
  );
}
