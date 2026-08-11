"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Input, Select } from "@/components/ui/Field";
import { StatusPill, type PillStatus } from "@/components/ui/StatusPill";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { Wallet } from "lucide-react";
import type { CuotaRow, CuotaEstado } from "@/types/database";

type Alumno = { id: string; nombre: string; apellido: string };

function pill(estado: CuotaEstado): { status: PillStatus; label: string } {
  if (estado === "pagada") return { status: "aprobado", label: "Al día" };
  if (estado === "bonificada") return { status: "aprobado", label: "Al día" };
  if (estado === "vencida") return { status: "vencido", label: "Vencida" };
  if (estado === "cancelada") return { status: "pendiente", label: "Sin vigencia" };
  return { status: "pendiente", label: "Pendiente" };
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function CuotasManager({
  alumnos,
  mesInicial,
  cuotasIniciales,
}: {
  alumnos: Alumno[];
  mesInicial: string;
  cuotasIniciales: CuotaRow[];
}) {
  const supabase = createClient();

  const [mes, setMes] = useState(mesInicial);
  const [cuotas, setCuotas] = useState<CuotaRow[]>(cuotasIniciales);
  const [loading, setLoading] = useState(false);
  const [soloDeuda, setSoloDeuda] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [nuevoAlumno, setNuevoAlumno] = useState("");
  const [nuevoMonto, setNuevoMonto] = useState("");
  const [nuevoVencimiento, setNuevoVencimiento] = useState("");
  const [creating, setCreating] = useState(false);

  const alumnoNombre = (id: string) => {
    const a = alumnos.find((x) => x.id === id);
    return a ? `${a.nombre} ${a.apellido}` : "—";
  };

  const loadCuotas = useCallback(
    async (m: string) => {
      setLoading(true);
      const { data } = await supabase
        .from("cuotas")
        .select("*")
        .eq("mes", m)
        .order("fecha_vencimiento");
      setCuotas((data ?? []) as CuotaRow[]);
      setLoading(false);
    },
    [supabase]
  );

  useEffect(() => {
    // Fetch the selected month's remote billing records.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (mes !== mesInicial) loadCuotas(mes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mes]);

  async function marcarAlDia(c: CuotaRow) {
    setBusyId(c.id);
    setError(null);
    const { error: updateError } = await supabase
      .from("cuotas")
      .update({ estado: "pagada", fecha_pago: todayISO() })
      .eq("id", c.id);
    setBusyId(null);
    if (updateError) {
      setError("No pudimos actualizar el estado de la cuota.");
      return;
    }
    loadCuotas(mes);
  }

  async function handleCrear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!nuevoAlumno || !nuevoMonto) {
      setError("Seleccioná un alumno e indicá el monto.");
      return;
    }
    setCreating(true);
    const { error: insertError } = await supabase.from("cuotas").insert({
      alumno_id: nuevoAlumno,
      mes,
      monto: Number(nuevoMonto),
      fecha_emision: todayISO(),
      fecha_vencimiento: nuevoVencimiento || null,
      estado: "pendiente",
    });
    setCreating(false);
    if (insertError) {
      setError("No pudimos crear la cuota. Probá de nuevo.");
      return;
    }
    setNuevoAlumno("");
    setNuevoMonto("");
    setNuevoVencimiento("");
    setShowCreate(false);
    loadCuotas(mes);
  }

  const visibles = soloDeuda
    ? cuotas.filter((c) => c.estado === "pendiente" || c.estado === "vencida")
    : cuotas;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div>
              <Label>Mes</Label>
              <Input type="month" value={mes} onChange={(e) => setMes(e.target.value)} />
            </div>
            <label className="flex h-11 items-center gap-2 text-sm text-ink-700/70">
              <input
                type="checkbox"
                checked={soloDeuda}
                onChange={(e) => setSoloDeuda(e.target.checked)}
                className="h-4 w-4 rounded border-mist-300 text-brand-600 focus:ring-brand-600"
              />
              Solo pendientes / vencidas
            </label>
          </div>
          <Button type="button" variant="outline" onClick={() => setShowCreate((v) => !v)}>
            <Plus size={16} />
            Crear cuota
          </Button>
        </div>

        {showCreate && (
          <form onSubmit={handleCrear} className="mt-5 flex flex-col gap-4 border-t border-mist-200 pt-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Label required>Alumno</Label>
              <Select value={nuevoAlumno} onChange={(e) => setNuevoAlumno(e.target.value)}>
                <option value="">Seleccionar alumno</option>
                {alumnos.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nombre} {a.apellido}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label required>Monto</Label>
              <Input
                type="number"
                min={0}
                value={nuevoMonto}
                onChange={(e) => setNuevoMonto(e.target.value)}
              />
            </div>
            <div>
              <Label>Vencimiento</Label>
              <Input
                type="date"
                value={nuevoVencimiento}
                onChange={(e) => setNuevoVencimiento(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={creating}>
              {creating ? "Creando..." : "Crear"}
            </Button>
          </form>
        )}
      </Card>

      {error && <Alert variant="error">{error}</Alert>}

      {loading ? (
        <Card>
          <p className="text-sm text-ink-700/60">Cargando cuotas...</p>
        </Card>
      ) : visibles.length === 0 ? (
        <Card>
          <EmptyState icon={Wallet} title="No hay cuotas para este mes" />
        </Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-mist-200 text-xs font-semibold uppercase tracking-wide text-ink-700/50">
                <th className="px-4 py-3">Alumno</th>
                <th className="px-4 py-3">Monto</th>
                <th className="px-4 py-3">Vencimiento</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mist-200">
              {visibles.map((c) => {
                const p = pill(c.estado);
                return (
                  <tr key={c.id}>
                    <td className="px-4 py-3 font-semibold text-ink-950">
                      {alumnoNombre(c.alumno_id)}
                    </td>
                    <td className="px-4 py-3 text-ink-700/70">
                      ${c.monto.toLocaleString("es-AR")}
                    </td>
                    <td className="px-4 py-3 text-ink-700/70">{c.fecha_vencimiento ?? "—"}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={p.status} label={p.label} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {c.estado !== "pagada" && (
                          <Button
                            size="sm"
                            type="button"
                            disabled={busyId === c.id}
                            onClick={() => marcarAlDia(c)}
                          >
                            <Check size={14} />
                            Marcar al día
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
