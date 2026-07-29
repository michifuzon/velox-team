import { requireRole, STAFF_ROLES } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { AsistenciaManager } from "@/components/staff/AsistenciaManager";

export default async function AsistenciaPage() {
  const profile = await requireRole(...STAFF_ROLES);
  const supabase = await createClient();

  const { data: grupos } = await supabase
    .from("grupos")
    .select("id, nombre")
    .eq("estado", "activo")
    .order("nombre");

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Asistencia"
        description="Elegí un grupo y una fecha para tomar asistencia. Consultá el porcentaje de regularidad del mes."
      />
      <AsistenciaManager staffId={profile.id} grupos={grupos ?? []} />
    </div>
  );
}
