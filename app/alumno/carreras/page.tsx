import { Flag } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { CarreraCard } from "@/components/alumno/CarreraCard";
import type { CarreraRow, ParticipacionCarreraRow } from "@/types/database";

export default async function CarrerasPage() {
  const profile = await requireRole("alumno");
  const supabase = await createClient();

  const [{ data: carreras }, { data: participaciones }] = await Promise.all([
    supabase.from("carreras").select("*").order("fecha", { ascending: true }),
    supabase
      .from("participaciones_carrera")
      .select("carrera_id, estado")
      .eq("alumno_id", profile.id),
  ]);

  const rows = (carreras as CarreraRow[]) ?? [];
  const misParticipaciones = new Map(
    ((participaciones as Pick<ParticipacionCarreraRow, "carrera_id" | "estado">[]) ?? []).map(
      (p) => [p.carrera_id, p.estado]
    )
  );

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Carreras"
        description="Próximas competencias del equipo. Confirmá tu participación."
      />

      {rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={Flag}
            title="Sin carreras próximas"
            description="Todavía no hay carreras cargadas. El equipo va a publicar los próximos eventos acá."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {rows.map((carrera) => (
            <CarreraCard
              key={carrera.id}
              carrera={carrera}
              alumnoId={profile.id}
              estadoInicial={misParticipaciones.get(carrera.id) ?? null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
