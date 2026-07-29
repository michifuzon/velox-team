"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, CalendarRange } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Input, Select, Textarea, FieldError } from "@/components/ui/Field";
import { StatusPill } from "@/components/ui/StatusPill";
import { EmptyState } from "@/components/ui/EmptyState";
import type { PlanEntrenamientoRow, PlanTipo } from "@/types/database";

type Persona = { id: string; nombre: string; apellido: string };

export function PlanificacionesManager({
  staffId,
  planes,
  grupos,
  alumnos,
}: {
  staffId: string;
  planes: PlanEntrenamientoRow[];
  grupos: { id: string; nombre: string }[];
  alumnos: Persona[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState<PlanTipo>("grupal");
  const [grupoId, setGrupoId] = useState("");
  const [alumnoId, setAlumnoId] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const grupoNombre = (id: string | null) => grupos.find((g) => g.id === id)?.nombre ?? "—";
  const alumnoNombre = (id: string | null) => {
    const a = alumnos.find((x) => x.id === id);
    return a ? `${a.nombre} ${a.apellido}` : "—";
  };

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!nombre.trim()) {
      setError("El nombre del plan es obligatorio.");
      return;
    }
    if (!fechaInicio) {
      setError("Indicá la fecha de inicio.");
      return;
    }
    if (tipo === "grupal" && !grupoId) {
      setError("Seleccioná un grupo destino.");
      return;
    }
    if (tipo === "individual" && !alumnoId) {
      setError("Seleccioná un alumno destino.");
      return;
    }

    setCreating(true);
    const { error: insertError } = await supabase.from("planes_entrenamiento").insert({
      nombre: nombre.trim(),
      tipo,
      grupo_id: tipo === "grupal" ? grupoId : null,
      alumno_id: tipo === "individual" ? alumnoId : null,
      objetivo: objetivo || null,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin || null,
      creado_por: staffId,
    });
    setCreating(false);
    if (insertError) {
      setError("No pudimos crear el plan. Probá de nuevo.");
      return;
    }
    setNombre("");
    setObjetivo("");
    setFechaInicio("");
    setFechaFin("");
    setGrupoId("");
    setAlumnoId("");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h2 className="mb-4 font-display text-base font-bold text-ink-950">Crear plan</h2>
        {error && <div className="mb-3"><FieldError>{error}</FieldError></div>}
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label required>Nombre del plan</Label>
              <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>
            <div>
              <Label required>Tipo</Label>
              <Select value={tipo} onChange={(e) => setTipo(e.target.value as PlanTipo)}>
                <option value="grupal">Grupal</option>
                <option value="individual">Individual</option>
              </Select>
            </div>
            {tipo === "grupal" ? (
              <div>
                <Label required>Grupo destino</Label>
                <Select value={grupoId} onChange={(e) => setGrupoId(e.target.value)}>
                  <option value="">Seleccionar grupo</option>
                  {grupos.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nombre}
                    </option>
                  ))}
                </Select>
              </div>
            ) : (
              <div>
                <Label required>Alumno destino</Label>
                <Select value={alumnoId} onChange={(e) => setAlumnoId(e.target.value)}>
                  <option value="">Seleccionar alumno</option>
                  {alumnos.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre} {a.apellido}
                    </option>
                  ))}
                </Select>
              </div>
            )}
            <div>
              <Label>Fecha de inicio</Label>
              <Input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
            </div>
            <div>
              <Label>Fecha de fin</Label>
              <Input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label>Objetivo</Label>
              <Textarea rows={2} value={objetivo} onChange={(e) => setObjetivo(e.target.value)} />
            </div>
          </div>
          <div>
            <Button type="submit" disabled={creating}>
              <Plus size={16} />
              {creating ? "Creando..." : "Crear plan"}
            </Button>
          </div>
        </form>
      </Card>

      {planes.length === 0 ? (
        <Card>
          <EmptyState icon={CalendarRange} title="Todavía no hay planes de entrenamiento cargados" />
        </Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-mist-200 text-xs font-semibold uppercase tracking-wide text-ink-700/50">
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Destino</th>
                <th className="px-4 py-3">Inicio</th>
                <th className="px-4 py-3">Fin</th>
                <th className="px-4 py-3">Tipo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mist-200">
              {planes.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-ink-950">{p.nombre}</p>
                    {p.objetivo && <p className="text-xs text-ink-700/50">{p.objetivo}</p>}
                  </td>
                  <td className="px-4 py-3 text-ink-700/70">
                    {p.tipo === "grupal" ? grupoNombre(p.grupo_id) : alumnoNombre(p.alumno_id)}
                  </td>
                  <td className="px-4 py-3 text-ink-700/70">{p.fecha_inicio}</td>
                  <td className="px-4 py-3 text-ink-700/70">{p.fecha_fin ?? "—"}</td>
                  <td className="px-4 py-3">
                    <StatusPill
                      status="al_dia"
                      label={p.tipo === "grupal" ? "Grupal" : "Individual"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
