"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, LineChart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Input, Select, Textarea, FieldError } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/EmptyState";
import type { EvaluacionRow } from "@/types/database";

type Alumno = { id: string; nombre: string; apellido: string };

const TIPOS_COMUNES = [
  "Test de Cooper",
  "Test de 5 km",
  "Peso",
  "Frecuencia cardíaca en reposo",
  "Otro",
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function EvaluacionesManager({
  evaluaciones,
  alumnos,
}: {
  evaluaciones: EvaluacionRow[];
  alumnos: Alumno[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [alumnoId, setAlumnoId] = useState("");
  const [tipoSeleccion, setTipoSeleccion] = useState(TIPOS_COMUNES[0]);
  const [tipoCustom, setTipoCustom] = useState("");
  const [fecha, setFecha] = useState(todayISO());
  const [resultado, setResultado] = useState("");
  const [unidad, setUnidad] = useState("");
  const [comentario, setComentario] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const alumnoNombre = (id: string) => {
    const a = alumnos.find((x) => x.id === id);
    return a ? `${a.nombre} ${a.apellido}` : "—";
  };

  async function handleCrear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const tipo = tipoSeleccion === "Otro" ? tipoCustom.trim() : tipoSeleccion;
    if (!alumnoId) {
      setError("Seleccioná un alumno.");
      return;
    }
    if (!tipo) {
      setError("Indicá el tipo de evaluación.");
      return;
    }
    if (!fecha) {
      setError("Indicá la fecha.");
      return;
    }

    setCreating(true);
    const { error: insertError } = await supabase.from("evaluaciones").insert({
      alumno_id: alumnoId,
      tipo,
      fecha,
      resultado: resultado === "" ? null : Number(resultado),
      unidad: unidad || null,
      comentario_profesor: comentario || null,
    });
    setCreating(false);
    if (insertError) {
      setError("No pudimos guardar la evaluación. Probá de nuevo.");
      return;
    }
    setAlumnoId("");
    setResultado("");
    setUnidad("");
    setComentario("");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h2 className="mb-4 font-display text-base font-bold text-ink-950">Cargar evaluación</h2>
        {error && <div className="mb-3"><FieldError>{error}</FieldError></div>}
        <form onSubmit={handleCrear} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label required>Alumno</Label>
              <Select value={alumnoId} onChange={(e) => setAlumnoId(e.target.value)}>
                <option value="">Seleccionar alumno</option>
                {alumnos.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nombre} {a.apellido}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label required>Tipo</Label>
              <Select value={tipoSeleccion} onChange={(e) => setTipoSeleccion(e.target.value)}>
                {TIPOS_COMUNES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </div>
            {tipoSeleccion === "Otro" && (
              <div>
                <Label required>Especificar tipo</Label>
                <Input value={tipoCustom} onChange={(e) => setTipoCustom(e.target.value)} />
              </div>
            )}
            <div>
              <Label required>Fecha</Label>
              <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
            </div>
            <div>
              <Label>Resultado</Label>
              <Input type="number" step="any" value={resultado} onChange={(e) => setResultado(e.target.value)} />
            </div>
            <div>
              <Label>Unidad</Label>
              <Input placeholder="Ej: min, kg, lpm" value={unidad} onChange={(e) => setUnidad(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label>Comentario</Label>
              <Textarea rows={2} value={comentario} onChange={(e) => setComentario(e.target.value)} />
            </div>
          </div>
          <div>
            <Button type="submit" disabled={creating}>
              <Plus size={16} />
              {creating ? "Guardando..." : "Cargar evaluación"}
            </Button>
          </div>
        </form>
      </Card>

      {evaluaciones.length === 0 ? (
        <Card>
          <EmptyState icon={LineChart} title="Todavía no hay evaluaciones cargadas" />
        </Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-mist-200 text-xs font-semibold uppercase tracking-wide text-ink-700/50">
                <th className="px-4 py-3">Alumno</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Resultado</th>
                <th className="px-4 py-3">Comentario</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mist-200">
              {evaluaciones.map((e) => (
                <tr key={e.id}>
                  <td className="px-4 py-3 font-semibold text-ink-950">{alumnoNombre(e.alumno_id)}</td>
                  <td className="px-4 py-3 text-ink-700/70">{e.tipo}</td>
                  <td className="px-4 py-3 text-ink-700/70">{e.fecha}</td>
                  <td className="px-4 py-3 text-ink-700/70">
                    {e.resultado ?? "—"} {e.unidad ?? ""}
                  </td>
                  <td className="px-4 py-3 text-ink-700/60">{e.comentario_profesor ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
