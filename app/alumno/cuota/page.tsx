import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CuotaView } from "@/components/alumno/CuotaView";
import type { CuotaRow } from "@/types/database";

export default async function CuotaPage() {
  const profile = await requireRole("alumno");
  const supabase = await createClient();

  const { data: cuotas } = await supabase
    .from("cuotas")
    .select("*")
    .eq("alumno_id", profile.id)
    .order("mes", { ascending: false });

  const rows = (cuotas as unknown as CuotaRow[]) ?? [];
  const [actual, ...historial] = rows;

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Cuota"
        description="Consultá el estado administrativo de tu cuota. Los pagos se coordinan fuera de la aplicación."
      />
      <CuotaView actual={actual ?? null} historial={historial} />
    </div>
  );
}
