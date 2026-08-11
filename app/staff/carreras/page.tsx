import { requireRole, STAFF_ROLES } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CarrerasManager } from "@/components/staff/CarrerasManager";
import type { CarreraRow } from "@/types/database";

export default async function StaffCarrerasPage() {
  await requireRole(...STAFF_ROLES);
  const supabase = await createClient();

  const { data: carreras } = await supabase.from("carreras").select("*").order("fecha", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Carreras"
        description="Próximas carreras y eventos del equipo que se muestran en la web."
      />
      <CarrerasManager carreras={(carreras ?? []) as CarreraRow[]} />
    </div>
  );
}
