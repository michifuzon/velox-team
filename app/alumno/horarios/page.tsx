import { Clock, MapPin, User as UserIcon, Users } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { UbicacionCard } from "@/components/shared/UbicacionCard";
import type { GrupoRow, ProfileRow } from "@/types/database";

export default async function HorariosPage() {
  const profile = await requireRole("alumno");
  const supabase = await createClient();

  const { data: inscripcion } = await supabase
    .from("inscripciones_grupo")
    .select("grupo:grupos(*)")
    .eq("alumno_id", profile.id)
    .eq("activo", true)
    .maybeSingle();

  const grupo =
    ((inscripcion as unknown as { grupo: GrupoRow | null } | null)?.grupo) ?? null;

  let profesor: Pick<ProfileRow, "nombre" | "apellido"> | null = null;
  if (grupo?.profesor_id) {
    const { data } = await supabase
      .from("profiles")
      .select("nombre, apellido")
      .eq("id", grupo.profesor_id)
      .maybeSingle();
    profesor = data as Pick<ProfileRow, "nombre" | "apellido"> | null;
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Horarios"
        description="Días, horario, lugar y profesor de tu grupo de entrenamiento."
      />

      {!grupo ? (
        <Card>
          <EmptyState
            icon={Users}
            title="Sin grupo asignado"
            description="Todavía no formás parte de un grupo. El equipo de Velox te va a asignar uno pronto."
          />
        </Card>
      ) : (
        <Card accent>
          <h2 className="font-display text-2xl font-bold text-ink-950">
            {grupo.nombre}
          </h2>
          {grupo.descripcion && (
            <p className="mt-1 text-sm text-ink-700/60">{grupo.descripcion}</p>
          )}

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <Clock size={18} className="mt-0.5 text-brand-600" />
              <div>
                <p className="text-sm font-semibold text-ink-950">
                  {grupo.dias?.join(", ") || "Días a confirmar"}
                </p>
                <p className="text-sm text-ink-700/60">{grupo.horario ?? "Horario a confirmar"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin size={18} className="mt-0.5 text-brand-600" />
              <div>
                <p className="text-sm font-semibold text-ink-950">{grupo.lugar ?? "—"}</p>
                {grupo.punto_encuentro && (
                  <p className="text-sm text-ink-700/60">Punto de encuentro: {grupo.punto_encuentro}</p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <UserIcon size={18} className="mt-0.5 text-brand-600" />
              <div>
                <p className="text-sm font-semibold text-ink-950">
                  {profesor ? `${profesor.nombre} ${profesor.apellido}` : "Profesor a confirmar"}
                </p>
                <p className="text-sm text-ink-700/60">Profesor a cargo</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {grupo && (
        <div className="mt-3 pb-6 sm:mt-5 sm:pb-2">
          <UbicacionCard lugar={grupo.lugar} puntoEncuentro={grupo.punto_encuentro} />
        </div>
      )}
    </div>
  );
}
