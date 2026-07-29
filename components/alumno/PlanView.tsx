"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Clock, Ruler, Gauge } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusPill, type PillStatus } from "@/components/ui/StatusPill";
import { Label, Input, Textarea, FileInput } from "@/components/ui/Field";
import type { EntrenamientoRow, EntrenamientoTipo, RegistroEntrenamientoRow } from "@/types/database";

const TIPO_LABEL: Record<EntrenamientoTipo, string> = {
  rodaje_suave: "Rodaje suave",
  fondo: "Fondo",
  pasadas: "Pasadas",
  series: "Series",
  cambios_ritmo: "Cambios de ritmo",
  tempo: "Tempo",
  cuestas: "Cuestas",
  tecnica: "Técnica de carrera",
  fuerza: "Fuerza",
  movilidad: "Movilidad",
  descanso: "Descanso",
  competencia: "Competencia",
};

function pillFor(estado: RegistroEntrenamientoRow["estado"] | undefined): PillStatus {
  if (estado === "realizado") return "completado";
  if (estado === "no_realizado") return "vencido";
  if (estado === "modificado") return "en_revision";
  return "pendiente";
}

function EntrenamientoCard({
  entrenamiento,
  registro,
  alumnoId,
}: {
  entrenamiento: EntrenamientoRow;
  registro: RegistroEntrenamientoRow | null;
  alumnoId: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [distancia, setDistancia] = useState(registro?.distancia_realizada?.toString() ?? "");
  const [tiempo, setTiempo] = useState(registro?.tiempo ?? "");
  const [ritmo, setRitmo] = useState(registro?.ritmo_promedio ?? "");
  const [fc, setFc] = useState(registro?.frecuencia_cardiaca?.toString() ?? "");
  const [sensacion, setSensacion] = useState(registro?.sensacion ?? 7);
  const [comentario, setComentario] = useState(registro?.comentario ?? "");
  const [foto, setFoto] = useState<File | null>(null);

  async function guardar(estado: "realizado" | "no_realizado") {
    setSaving(true);
    let foto_url = registro?.foto_url ?? null;

    if (foto) {
      const ext = foto.name.split(".").pop();
      const path = `${alumnoId}/registro-${entrenamiento.id}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("entrenamientos").upload(path, foto);
      if (!upErr) foto_url = path;
    }

    await supabase.from("registros_entrenamiento").upsert(
      {
        entrenamiento_id: entrenamiento.id,
        alumno_id: alumnoId,
        estado,
        distancia_realizada: distancia ? Number(distancia) : null,
        tiempo: tiempo || null,
        ritmo_promedio: ritmo || null,
        frecuencia_cardiaca: fc ? Number(fc) : null,
        sensacion: estado === "realizado" ? sensacion : null,
        comentario: comentario || null,
        foto_url,
      },
      { onConflict: "entrenamiento_id,alumno_id" }
    );

    setSaving(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-700">
            {entrenamiento.fecha} · {TIPO_LABEL[entrenamiento.tipo]}
          </p>
          <h3 className="mt-1 font-display text-base font-bold text-ink-950">
            {entrenamiento.titulo}
          </h3>
        </div>
        <StatusPill status={pillFor(registro?.estado)} />
      </div>

      <div className="mt-3 flex flex-wrap gap-4 text-sm text-ink-700/60">
        {entrenamiento.distancia && (
          <span className="flex items-center gap-1.5"><Ruler size={14} /> {entrenamiento.distancia} km</span>
        )}
        {entrenamiento.duracion_estimada && (
          <span className="flex items-center gap-1.5"><Clock size={14} /> {entrenamiento.duracion_estimada} min</span>
        )}
        {entrenamiento.ritmo_objetivo && (
          <span className="flex items-center gap-1.5"><Gauge size={14} /> {entrenamiento.ritmo_objetivo}</span>
        )}
      </div>
      {entrenamiento.observaciones && (
        <p className="mt-2 text-sm text-ink-700/60">{entrenamiento.observaciones}</p>
      )}

      {!open ? (
        <div className="mt-4 flex gap-2">
          <Button size="sm" onClick={() => setOpen(true)}>
            <Check size={15} /> Marcar como realizado
          </Button>
          <Button size="sm" variant="outline" onClick={() => guardar("no_realizado")} disabled={saving}>
            <X size={15} /> No realizado
          </Button>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3 border-t border-mist-200 pt-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <Label htmlFor={`dist-${entrenamiento.id}`}>Distancia (km)</Label>
              <Input id={`dist-${entrenamiento.id}`} value={distancia} onChange={(e) => setDistancia(e.target.value)} />
            </div>
            <div>
              <Label htmlFor={`tiempo-${entrenamiento.id}`}>Tiempo</Label>
              <Input id={`tiempo-${entrenamiento.id}`} placeholder="45:00" value={tiempo} onChange={(e) => setTiempo(e.target.value)} />
            </div>
            <div>
              <Label htmlFor={`ritmo-${entrenamiento.id}`}>Ritmo promedio</Label>
              <Input id={`ritmo-${entrenamiento.id}`} placeholder="5:30/km" value={ritmo} onChange={(e) => setRitmo(e.target.value)} />
            </div>
            <div>
              <Label htmlFor={`fc-${entrenamiento.id}`}>FC promedio</Label>
              <Input id={`fc-${entrenamiento.id}`} value={fc} onChange={(e) => setFc(e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor={`sens-${entrenamiento.id}`}>Sensación (1 a 10): {sensacion}</Label>
            <input
              id={`sens-${entrenamiento.id}`}
              type="range"
              min={1}
              max={10}
              value={sensacion}
              onChange={(e) => setSensacion(Number(e.target.value))}
              className="w-full accent-[var(--color-brand-600)]"
            />
          </div>
          <div>
            <Label htmlFor={`com-${entrenamiento.id}`}>Comentario</Label>
            <Textarea id={`com-${entrenamiento.id}`} rows={2} value={comentario} onChange={(e) => setComentario(e.target.value)} />
          </div>
          <div>
            <Label>Foto (opcional)</Label>
            <FileInput accept="image/*" onChange={(e) => setFoto(e.target.files?.[0] ?? null)} />
          </div>
          {registro?.devolucion_profesor && (
            <p className="rounded-lg bg-brand-50 p-3 text-sm text-ink-700/80">
              <strong className="text-ink-950">Devolución del profesor:</strong> {registro.devolucion_profesor}
            </p>
          )}
          <div className="flex gap-2">
            <Button size="sm" onClick={() => guardar("realizado")} disabled={saving}>
              {saving ? "Guardando..." : "Guardar entrenamiento"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

export function PlanView({
  entrenamientos,
  registros,
  alumnoId,
}: {
  entrenamientos: EntrenamientoRow[];
  registros: RegistroEntrenamientoRow[];
  alumnoId: string;
}) {
  const registroPorEntrenamiento = new Map(registros.map((r) => [r.entrenamiento_id, r]));

  return (
    <div className="flex flex-col gap-4">
      {entrenamientos.map((e) => (
        <EntrenamientoCard
          key={e.id}
          entrenamiento={e}
          registro={registroPorEntrenamiento.get(e.id) ?? null}
          alumnoId={alumnoId}
        />
      ))}
    </div>
  );
}
