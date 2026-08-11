import { requireRole, STAFF_ROLES } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { GaleriaManager } from "@/components/staff/GaleriaManager";
import type { GaleriaRow } from "@/types/database";

export default async function StaffGaleriaPage() {
  await requireRole(...STAFF_ROLES);
  const supabase = await createClient();

  const { data: fotos } = await supabase
    .from("galeria")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Galería"
        description="Fotos de entrenamientos, carreras y trail que se muestran en la web."
      />
      <GaleriaManager fotos={(fotos ?? []) as GaleriaRow[]} />
    </div>
  );
}
