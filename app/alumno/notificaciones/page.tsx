import { Bell } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { AvisosReader } from "@/components/alumno/AvisosReader";
import type { AvisoRow } from "@/types/database";

export default async function NotificacionesPage() {
  const profile = await requireRole("alumno");
  const supabase = await createClient();

  const { data: inscripcion } = await supabase
    .from("inscripciones_grupo")
    .select("grupo_id")
    .eq("alumno_id", profile.id)
    .eq("activo", true)
    .maybeSingle();
  const grupoId = (inscripcion as { grupo_id: string } | null)?.grupo_id ?? null;

  const queries = [
    supabase.from("avisos").select("*").eq("destino", "todos"),
    supabase.from("avisos").select("*").eq("destino", "alumno").eq("alumno_id", profile.id),
  ];
  if (grupoId) {
    queries.push(supabase.from("avisos").select("*").eq("destino", "grupo").eq("grupo_id", grupoId));
  }

  const [{ data: aLeidas }, ...results] = await Promise.all([
    supabase.from("avisos_lecturas").select("aviso_id").eq("alumno_id", profile.id),
    ...queries,
  ]);

  const avisos = (results.flatMap((r) => (r.data as AvisoRow[]) ?? []) as AvisoRow[]).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const leidas = new Set(((aLeidas as { aviso_id: string }[]) ?? []).map((l) => l.aviso_id));
  const noLeidos = avisos.filter((a) => !leidas.has(a.id)).map((a) => a.id);

  return (
    <div className="flex flex-col gap-6">
      <AvisosReader alumnoId={profile.id} avisoIds={noLeidos} />
      <SectionHeader
        title="Notificaciones"
        description="Avisos del profesor sobre horarios, cuotas, aptos médicos y carreras."
      />

      {avisos.length === 0 ? (
        <Card>
          <EmptyState
            icon={Bell}
            title="Sin novedades"
            description="Todavía no recibiste avisos del equipo."
          />
        </Card>
      ) : (
        <Card className="divide-y divide-mist-200 p-2 sm:p-3">
          {avisos.map((aviso) => (
            <div key={aviso.id} className="flex items-start gap-3 px-3 py-3.5">
              {!leidas.has(aviso.id) && (
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-600" />
              )}
              <div className={leidas.has(aviso.id) ? "opacity-70" : ""}>
                <p className="text-sm font-bold text-ink-950">{aviso.titulo}</p>
                <p className="mt-0.5 text-sm text-ink-700/70">{aviso.mensaje}</p>
                <p className="mt-1 text-xs text-ink-700/40">
                  {new Date(aviso.created_at).toLocaleDateString("es-AR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
