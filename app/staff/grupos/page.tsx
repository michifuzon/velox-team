import { requireRole, STAFF_ROLES } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { GruposManager } from "@/components/staff/GruposManager";
import type { GrupoRow } from "@/types/database";

export default async function GruposPage() {
  await requireRole(...STAFF_ROLES);
  const supabase = await createClient();

  const [{ data: grupos }, { data: profesores }, { data: inscripciones }] = await Promise.all([
    supabase.from("grupos").select("*").order("nombre"),
    supabase
      .from("profiles")
      .select("id, nombre, apellido")
      .in("role", ["admin", "profesor", "profesor_secundario"])
      .order("nombre"),
    supabase.from("inscripciones_grupo").select("grupo_id").eq("activo", true),
  ]);

  const cupoOcupadoByGrupo = new Map<string, number>();
  for (const i of inscripciones ?? []) {
    cupoOcupadoByGrupo.set(i.grupo_id, (cupoOcupadoByGrupo.get(i.grupo_id) ?? 0) + 1);
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Grupos"
        description="Gestioná los grupos de entrenamiento: profesor a cargo, días, horario y cupo."
      />
      <GruposManager
        grupos={(grupos ?? []) as GrupoRow[]}
        profesores={profesores ?? []}
        inscriptosPorGrupo={Object.fromEntries(cupoOcupadoByGrupo)}
      />
    </div>
  );
}
