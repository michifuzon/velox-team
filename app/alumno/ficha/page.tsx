import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FichaForm } from "@/components/alumno/FichaForm";
import type { FichaDeportivaRow } from "@/types/database";

export default async function FichaPage() {
  const profile = await requireRole("alumno");
  const supabase = await createClient();

  const { data: ficha } = await supabase
    .from("fichas_deportivas")
    .select(
      "objetivo_principal, distancia_preferida, fecha_carrera_objetivo, ritmo_actual, ritmo_deseado, horarios_disponibles, antecedentes_deportivos, lesiones_previas, cirugias, medicacion, alergias, observaciones_medicas, info_para_profesor"
    )
    .eq("alumno_id", profile.id)
    .maybeSingle();

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Ficha deportiva"
        description="Contanos tu objetivo y tus antecedentes para planificar mejor tu entrenamiento."
      />
      <FichaForm
        alumnoId={profile.id}
        ficha={
          ficha as Pick<
            FichaDeportivaRow,
            | "objetivo_principal"
            | "distancia_preferida"
            | "fecha_carrera_objetivo"
            | "ritmo_actual"
            | "ritmo_deseado"
            | "horarios_disponibles"
            | "antecedentes_deportivos"
            | "lesiones_previas"
            | "cirugias"
            | "medicacion"
            | "alergias"
            | "observaciones_medicas"
            | "info_para_profesor"
          > | null
        }
      />
    </div>
  );
}
