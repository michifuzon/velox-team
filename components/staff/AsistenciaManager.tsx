"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Select, Input, Textarea } from "@/components/ui/Field";
import { Avatar } from "@/components/ui/Avatar";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ClipboardCheck } from "lucide-react";
import type { AsistenciaEstado } from "@/types/database";

type Grupo = { id: string; nombre: string };
type Alumno = { id: string; nombre: string; apellido: string; foto_url: string | null };

type RowState = {
  estado: AsistenciaEstado;
  justificada: boolean;
  observacion: string;
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

const ESTADOS: { value: AsistenciaEstado; label: string }[] = [
  { value: "presente", label: "Presente" },
  { value: "ausente", label: "Ausente" },
  { value: "tarde", label: "Tarde" },
];

export function AsistenciaManager({
  staffId,
  grupos,
}: {
  staffId: string;
  grupos: Grupo[];
}) {
  const supabase = createClient();

  const [grupoId, setGrupoId] = useState(grupos[0]?.id ?? "");
  const [fecha, setFecha] = useState(todayISO());
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [rows, setRows] = useState<Record<string, RowState>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pctMes, setPctMes] = useState<{ presentes: number; total: number } | null>(null);

  const loadAlumnos = useCallback(
    async (gId: string) => {
      if (!gId) {
        setAlumnos([]);
        return;
      }
      setLoading(true);
      const { data } = await supabase
        .from("inscripciones_grupo")
        .select("alumno:profiles(id, nombre, apellido, foto_url)")
        .eq("grupo_id", gId)
        .eq("activo", true);
      const list = (
        (data as unknown as { alumno: Alumno | null }[] | null) ?? []
      )
        .map((r) => r.alumno)
        .filter((a): a is Alumno => !!a)
        .sort((a, b) => a.apellido.localeCompare(b.apellido));
      setAlumnos(list);
      setLoading(false);
    },
    [supabase]
  );

  const loadAsistencia = useCallback(
    async (gId: string, f: string, alumnosList: Alumno[]) => {
      if (!gId || alumnosList.length === 0) {
        setRows({});
        return;
      }
      const { data } = await supabase
        .from("asistencias")
        .select("alumno_id, estado, justificada, observacion")
        .eq("grupo_id", gId)
        .eq("fecha", f);

      const initial: Record<string, RowState> = {};
      for (const a of alumnosList) {
        const existing = (data ?? []).find((d) => d.alumno_id === a.id);
        initial[a.id] = {
          estado: existing?.estado ?? "presente",
          justificada: existing?.justificada ?? false,
          observacion: existing?.observacion ?? "",
        };
      }
      setRows(initial);
    },
    [supabase]
  );

  const loadStats = useCallback(
    async (gId: string) => {
      if (!gId) {
        setPctMes(null);
        return;
      }
      const mesActual = new Date().toISOString().slice(0, 7);
      const { data } = await supabase
        .from("asistencias")
        .select("estado, fecha")
        .eq("grupo_id", gId)
        .gte("fecha", `${mesActual}-01`)
        .lte("fecha", `${mesActual}-31`);
      const total = data?.length ?? 0;
      const presentes = (data ?? []).filter((d) => d.estado === "presente").length;
      setPctMes({ presentes, total });
    },
    [supabase]
  );

  useEffect(() => {
    loadAlumnos(grupoId);
    loadStats(grupoId);
  }, [grupoId, loadAlumnos, loadStats]);

  useEffect(() => {
    loadAsistencia(grupoId, fecha, alumnos);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grupoId, fecha, alumnos]);

  function updateRow(alumnoId: string, patch: Partial<RowState>) {
    setRows((prev) => ({ ...prev, [alumnoId]: { ...prev[alumnoId], ...patch } }));
  }

  async function handleGuardar() {
    if (!grupoId || alumnos.length === 0) return;
    setSaving(true);
    setError(null);
    setSuccess(false);

    const payload = alumnos.map((a) => ({
      grupo_id: grupoId,
      alumno_id: a.id,
      fecha,
      estado: rows[a.id]?.estado ?? "presente",
      justificada: rows[a.id]?.justificada ?? false,
      observacion: rows[a.id]?.observacion || null,
      registrado_por: staffId,
    }));

    const { error: upsertError } = await supabase
      .from("asistencias")
      .upsert(payload, { onConflict: "grupo_id,alumno_id,fecha" });

    setSaving(false);
    if (upsertError) {
      setError("No pudimos guardar la asistencia. Probá de nuevo.");
      return;
    }
    setSuccess(true);
    loadStats(grupoId);
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>Grupo</Label>
            <Select value={grupoId} onChange={(e) => setGrupoId(e.target.value)}>
              <option value="">Seleccionar grupo</option>
              {grupos.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nombre}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Fecha</Label>
            <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </div>
        </div>

        {pctMes && pctMes.total > 0 && (
          <div className="mt-5 border-t border-mist-200 pt-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-ink-700/60">Asistencia del grupo este mes</span>
              <span className="font-display font-bold text-ink-950">
                {Math.round((pctMes.presentes / pctMes.total) * 100)}%
              </span>
            </div>
            <ProgressBar value={(pctMes.presentes / pctMes.total) * 100} />
          </div>
        )}
      </Card>

      {!grupoId ? (
        <Card>
          <EmptyState icon={ClipboardCheck} title="Elegí un grupo para tomar asistencia" />
        </Card>
      ) : loading ? (
        <Card>
          <p className="text-sm text-ink-700/60">Cargando alumnos...</p>
        </Card>
      ) : alumnos.length === 0 ? (
        <Card>
          <EmptyState
            icon={ClipboardCheck}
            title="Este grupo no tiene alumnos inscriptos activos"
          />
        </Card>
      ) : (
        <Card>
          {error && <div className="mb-4"><Alert variant="error">{error}</Alert></div>}
          {success && <div className="mb-4"><Alert variant="success">Asistencia guardada.</Alert></div>}
          <div className="flex flex-col gap-4">
            {alumnos.map((a) => {
              const row = rows[a.id] ?? { estado: "presente" as AsistenciaEstado, justificada: false, observacion: "" };
              return (
                <div key={a.id} className="rounded-lg border border-mist-200 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar nombre={a.nombre} apellido={a.apellido} fotoUrl={a.foto_url} size={36} />
                      <p className="font-display text-sm font-bold text-ink-950">
                        {a.nombre} {a.apellido}
                      </p>
                    </div>
                    <div className="flex gap-1.5">
                      {ESTADOS.map((es) => (
                        <button
                          key={es.value}
                          type="button"
                          onClick={() => updateRow(a.id, { estado: es.value })}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                            row.estado === es.value
                              ? "border-brand-600 bg-brand-600 text-white"
                              : "border-mist-300 bg-white text-ink-700/70 hover:border-brand-600"
                          }`}
                        >
                          {es.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                    <label className="flex items-center gap-2 text-xs text-ink-700/70">
                      <input
                        type="checkbox"
                        checked={row.justificada}
                        onChange={(e) => updateRow(a.id, { justificada: e.target.checked })}
                        className="h-4 w-4 rounded border-mist-300 text-brand-600 focus:ring-brand-600"
                      />
                      Ausencia justificada
                    </label>
                    <Textarea
                      placeholder="Observación (opcional)"
                      rows={1}
                      value={row.observacion}
                      onChange={(e) => updateRow(a.id, { observacion: e.target.value })}
                      className="min-h-9 flex-1 py-1.5"
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5">
            <Button type="button" disabled={saving} onClick={handleGuardar}>
              {saving ? "Guardando..." : "Guardar asistencia"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
