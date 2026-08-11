import { requireRole, STAFF_ROLES } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { GruposManager } from "@/components/staff/GruposManager";
import type { GrupoRow } from "@/types/database";

export default async function StaffHorariosPage() {
  await requireRole(...STAFF_ROLES);
  const supabase = await createClient();

  const [{ data: grupos }, { data: profesores }] = await Promise.all([
    supabase.from("grupos").select("*").order("nombre"),
    supabase.from("profiles").select("id, nombre, apellido").in("role", ["admin", "profesor"]).order("nombre"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Horarios"
        description="Días, horarios y lugares de entrenamiento que se muestran en la web."
      />
      <GruposManager grupos={(grupos ?? []) as GrupoRow[]} profesores={profesores ?? []} />
    </div>
  );
}
