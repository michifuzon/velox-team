import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CuotaView } from "@/components/alumno/CuotaView";
import type { CuotaRow, ConfiguracionRow } from "@/types/database";

export default async function CuotaPage() {
  const profile = await requireRole("alumno");
  const supabase = await createClient();

  const [{ data: cuotas }, { data: config }] = await Promise.all([
    supabase
      .from("cuotas")
      .select("*")
      .eq("alumno_id", profile.id)
      .order("mes", { ascending: false }),
    supabase.from("configuracion").select("metodos_pago, datos_bancarios").eq("id", 1).maybeSingle(),
  ]);

  const rows = (cuotas as unknown as CuotaRow[]) ?? [];
  const [actual, ...historial] = rows;

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Cuota"
        description="Consultá el monto, el vencimiento y el historial de tus cuotas."
      />
      <CuotaView
        alumnoId={profile.id}
        actual={actual ?? null}
        historial={historial}
        config={config as Pick<ConfiguracionRow, "metodos_pago" | "datos_bancarios"> | null}
      />
    </div>
  );
}
