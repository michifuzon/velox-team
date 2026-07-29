"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, ChevronDown, ChevronUp, Flag } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Input, Textarea, FieldError } from "@/components/ui/Field";
import { StatusPill, type PillStatus } from "@/components/ui/StatusPill";
import { EmptyState } from "@/components/ui/EmptyState";
import type { CarreraRow, ParticipacionCarreraRow, CarreraEstado } from "@/types/database";

type Alumno = { id: string; nombre: string; apellido: string };

function estadoPill(estado: CarreraEstado): { status: PillStatus; label: string } {
  if (estado === "realizada") return { status: "completado", label: "Realizada" };
  if (estado === "cancelada") return { status: "rechazado", label: "Cancelada" };
  return { status: "pendiente", label: "Próxima" };
}

function participacionPill(estado: ParticipacionCarreraRow["estado"]): { status: PillStatus; label: string } {
  if (estado === "voy") return { status: "aprobado", label: "Va a correr" };
  if (estado === "tal_vez") return { status: "en_revision", label: "Tal vez" };
  return { status: "pendiente", label: "No participa" };
}

const EMPTY_CREATE = {
  nombre: "",
  fecha: "",
  lugar: "",
  distancia: "",
  horario: "",
  descripcion: "",
  fecha_limite_inscripcion: "",
  costo: "",
  punto_encuentro_equipo: "",
};

export function CarrerasManager({
  carreras,
  participaciones,
  alumnos,
}: {
  carreras: CarreraRow[];
  participaciones: ParticipacionCarreraRow[];
  alumnos: Alumno[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState(EMPTY_CREATE);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const alumnoNombre = (id: string) => {
    const a = alumnos.find((x) => x.id === id);
    return a ? `${a.nombre} ${a.apellido}` : "—";
  };

  const participantesPorCarrera = (carreraId: string) =>
    participaciones.filter((p) => p.carrera_id === carreraId);

  async function handleCrear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.nombre.trim() || !form.fecha) {
      setError("El nombre y la fecha son obligatorios.");
      return;
    }
    setCreating(true);
    const { error: insertError } = await supabase.from("carreras").insert({
      nombre: form.nombre.trim(),
      fecha: form.fecha,
      lugar: form.lugar || null,
      distancia: form.distancia || null,
      horario: form.horario || null,
      descripcion: form.descripcion || null,
      fecha_limite_inscripcion: form.fecha_limite_inscripcion || null,
      costo: form.costo ? Number(form.costo) : null,
      punto_encuentro_equipo: form.punto_encuentro_equipo || null,
      estado: "proxima",
    });
    setCreating(false);
    if (insertError) {
      setError("No pudimos crear la carrera. Probá de nuevo.");
      return;
    }
    setForm(EMPTY_CREATE);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h2 className="mb-4 font-display text-base font-bold text-ink-950">Crear carrera</h2>
        {error && <div className="mb-3"><FieldError>{error}</FieldError></div>}
        <form onSubmit={handleCrear} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label required>Nombre</Label>
              <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div>
              <Label required>Fecha</Label>
              <Input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
            </div>
            <div>
              <Label>Lugar</Label>
              <Input value={form.lugar} onChange={(e) => setForm({ ...form, lugar: e.target.value })} />
            </div>
            <div>
              <Label>Distancia</Label>
              <Input placeholder="Ej: 10 km" value={form.distancia} onChange={(e) => setForm({ ...form, distancia: e.target.value })} />
            </div>
            <div>
              <Label>Horario</Label>
              <Input value={form.horario} onChange={(e) => setForm({ ...form, horario: e.target.value })} />
            </div>
            <div>
              <Label>Costo</Label>
              <Input type="number" min={0} value={form.costo} onChange={(e) => setForm({ ...form, costo: e.target.value })} />
            </div>
            <div>
              <Label>Fecha límite de inscripción</Label>
              <Input
                type="date"
                value={form.fecha_limite_inscripcion}
                onChange={(e) => setForm({ ...form, fecha_limite_inscripcion: e.target.value })}
              />
            </div>
            <div>
              <Label>Punto de encuentro del equipo</Label>
              <Input
                value={form.punto_encuentro_equipo}
                onChange={(e) => setForm({ ...form, punto_encuentro_equipo: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Descripción</Label>
              <Textarea rows={2} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
            </div>
          </div>
          <div>
            <Button type="submit" disabled={creating}>
              <Plus size={16} />
              {creating ? "Creando..." : "Crear carrera"}
            </Button>
          </div>
        </form>
      </Card>

      {carreras.length === 0 ? (
        <Card>
          <EmptyState icon={Flag} title="Todavía no hay carreras cargadas" />
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {carreras.map((c) => {
            const p = estadoPill(c.estado);
            const participantes = participantesPorCarrera(c.id);
            const expanded = expandedId === c.id;
            return (
              <Card key={c.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-bold text-ink-950">{c.nombre}</p>
                    <p className="text-sm text-ink-700/60">
                      {c.fecha} · {c.lugar ?? "—"} · {c.distancia ?? "—"}
                    </p>
                  </div>
                  <StatusPill status={p.status} label={p.label} />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm text-ink-700/60">
                    {participantes.length} participante{participantes.length === 1 ? "" : "s"}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : c.id)}
                  >
                    {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    Participantes
                  </Button>
                </div>
                {expanded && (
                  <div className="mt-3 flex flex-col gap-3 border-t border-mist-200 pt-4">
                    {participantes.length === 0 ? (
                      <p className="text-sm text-ink-700/60">Todavía no hay alumnos anotados.</p>
                    ) : (
                      participantes.map((part) => (
                        <ParticipanteRow
                          key={part.id}
                          participacion={part}
                          nombre={alumnoNombre(part.alumno_id)}
                          onSaved={() => router.refresh()}
                        />
                      ))
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ParticipanteRow({
  participacion,
  nombre,
  onSaved,
}: {
  participacion: ParticipacionCarreraRow;
  nombre: string;
  onSaved: () => void;
}) {
  const supabase = createClient();
  const [tiempoOficial, setTiempoOficial] = useState(participacion.tiempo_oficial ?? "");
  const [tiempoNeto, setTiempoNeto] = useState(participacion.tiempo_neto ?? "");
  const [posicion, setPosicion] = useState(
    participacion.posicion_general != null ? String(participacion.posicion_general) : ""
  );
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await supabase
      .from("participaciones_carrera")
      .update({
        tiempo_oficial: tiempoOficial || null,
        tiempo_neto: tiempoNeto || null,
        posicion_general: posicion === "" ? null : Number(posicion),
      })
      .eq("id", participacion.id);
    setSaving(false);
    onSaved();
  }

  const p = participacionPill(participacion.estado);

  return (
    <div className="rounded-lg border border-mist-200 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold text-ink-950">{nombre}</p>
        <StatusPill status={p.status} label={p.label} />
      </div>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-4">
        <Input
          placeholder="Tiempo oficial"
          value={tiempoOficial}
          onChange={(e) => setTiempoOficial(e.target.value)}
        />
        <Input placeholder="Tiempo neto" value={tiempoNeto} onChange={(e) => setTiempoNeto(e.target.value)} />
        <Input
          type="number"
          placeholder="Posición general"
          value={posicion}
          onChange={(e) => setPosicion(e.target.value)}
        />
        <Button size="sm" type="button" disabled={saving} onClick={handleSave}>
          {saving ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </div>
  );
}
