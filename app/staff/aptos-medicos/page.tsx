import { requireRole, STAFF_ROLES } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { AptosMedicosManager } from "@/components/staff/AptosMedicosManager";
import type { AptoMedicoRow } from "@/types/database";

export default async function StaffAptosMedicosPage() {
  await requireRole(...STAFF_ROLES);
  const supabase = await createClient();

  const [{ data: aptos }, { data: alumnos }] = await Promise.all([
    supabase.from("aptos_medicos").select("*").order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, nombre, apellido").eq("role", "alumno"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Aptos médicos"
        description="Revisá, aprobá o rechazá los aptos médicos cargados por los alumnos."
      />
      <AptosMedicosManager
        aptos={(aptos ?? []) as AptoMedicoRow[]}
        alumnos={alumnos ?? []}
      />
    </div>
  );
}
