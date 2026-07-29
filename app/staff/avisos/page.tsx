import { requireRole, STAFF_ROLES } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { AvisosManager } from "@/components/staff/AvisosManager";
import type { AvisoRow } from "@/types/database";

export default async function AvisosPage() {
  const profile = await requireRole(...STAFF_ROLES);
  const supabase = await createClient();

  const [{ data: avisos }, { data: grupos }, { data: alumnos }] = await Promise.all([
    supabase.from("avisos").select("*").order("created_at", { ascending: false }),
    supabase.from("grupos").select("id, nombre").order("nombre"),
    supabase.from("profiles").select("id, nombre, apellido").eq("role", "alumno").order("apellido"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Avisos"
        description="Comunicados para todo el equipo, un grupo puntual o un alumno."
      />
      <AvisosManager
        staffId={profile.id}
        avisos={(avisos ?? []) as AvisoRow[]}
        grupos={grupos ?? []}
        alumnos={alumnos ?? []}
      />
    </div>
  );
}
