import { requireRole, STAFF_ROLES } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CuotasManager } from "@/components/staff/CuotasManager";
import type { CuotaRow } from "@/types/database";

export default async function StaffCuotasPage() {
  await requireRole(...STAFF_ROLES);
  const supabase = await createClient();

  const mesActual = new Date().toISOString().slice(0, 7);

  const [{ data: cuotas }, { data: alumnos }] = await Promise.all([
    supabase.from("cuotas").select("*").eq("mes", mesActual).order("fecha_vencimiento"),
    supabase
      .from("profiles")
      .select("id, nombre, apellido")
      .eq("role", "alumno")
      .order("apellido"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Cuotas"
        description="Registro interno del estado de las cuotas. La información se actualiza manualmente y no procesa pagos."
      />
      <CuotasManager
        alumnos={alumnos ?? []}
        mesInicial={mesActual}
        cuotasIniciales={(cuotas ?? []) as CuotaRow[]}
      />
    </div>
  );
}
