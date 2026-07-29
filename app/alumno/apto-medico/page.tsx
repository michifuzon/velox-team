import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { AptoMedicoManager } from "@/components/alumno/AptoMedicoManager";
import type { AptoMedicoRow } from "@/types/database";

export default async function AptoMedicoPage() {
  const profile = await requireRole("alumno");
  const supabase = await createClient();

  const { data: apto } = await supabase
    .from("aptos_medicos")
    .select("*")
    .eq("alumno_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Apto médico"
        description="Subí y consultá el estado de tu apto médico vigente."
      />
      <AptoMedicoManager alumnoId={profile.id} apto={apto as unknown as AptoMedicoRow | null} />
    </div>
  );
}
