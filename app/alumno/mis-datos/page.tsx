import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { MisDatosForm } from "@/components/alumno/MisDatosForm";
import type { ProfileRow, FichaDeportivaRow } from "@/types/database";

export default async function MisDatosPage() {
  const profile = await requireRole("alumno");
  const supabase = await createClient();

  const [{ data: fullProfile }, { data: ficha }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", profile.id).single(),
    supabase
      .from("fichas_deportivas")
      .select(
        "nivel, distancia_preferida, ritmo_promedio, dias_disponibles, experiencia_previa, ultima_carrera, marca_5k, marca_10k, marca_21k, marca_maraton, lesiones_previas, observaciones"
      )
      .eq("alumno_id", profile.id)
      .maybeSingle(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Mis datos"
        description="Mantené actualizados tus datos personales, tu contacto de emergencia y tu perfil deportivo."
      />
      <MisDatosForm
        profile={fullProfile as unknown as ProfileRow}
        ficha={ficha as Pick<
          FichaDeportivaRow,
          | "nivel"
          | "distancia_preferida"
          | "ritmo_promedio"
          | "dias_disponibles"
          | "experiencia_previa"
          | "ultima_carrera"
          | "marca_5k"
          | "marca_10k"
          | "marca_21k"
          | "marca_maraton"
          | "lesiones_previas"
          | "observaciones"
        > | null}
      />
    </div>
  );
}
