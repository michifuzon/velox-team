import { LineChart as LineChartIcon } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { EvaluacionesView } from "@/components/alumno/EvaluacionesView";
import type { EvaluacionRow } from "@/types/database";

export default async function EvaluacionesPage() {
  const profile = await requireRole("alumno");
  const supabase = await createClient();

  const { data } = await supabase
    .from("evaluaciones")
    .select("*")
    .eq("alumno_id", profile.id)
    .order("fecha", { ascending: true });

  const evaluaciones = (data as EvaluacionRow[]) ?? [];

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Evaluaciones y tests"
        description="Resultados de tus pruebas físicas y tu evolución en el tiempo."
      />

      {evaluaciones.length === 0 ? (
        <Card>
          <EmptyState
            icon={LineChartIcon}
            title="Sin evaluaciones cargadas"
            description="Cuando el equipo registre tus tests y evaluaciones físicas, los vas a ver acá."
          />
        </Card>
      ) : (
        <EvaluacionesView evaluaciones={evaluaciones} />
      )}
    </div>
  );
}
