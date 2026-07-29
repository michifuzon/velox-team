"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Check, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Select } from "@/components/ui/Field";
import { StatusPill, type PillStatus } from "@/components/ui/StatusPill";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { HeartPulse } from "lucide-react";
import type { AptoMedicoRow, AptoEstado } from "@/types/database";

type Alumno = { id: string; nombre: string; apellido: string };

function pill(estado: AptoEstado): { status: PillStatus; label: string } {
  if (estado === "aprobado") return { status: "aprobado", label: "Aprobado" };
  if (estado === "rechazado") return { status: "rechazado", label: "Rechazado" };
  if (estado === "vencido") return { status: "vencido", label: "Vencido" };
  if (estado === "en_revision") return { status: "en_revision", label: "En revisión" };
  return { status: "pendiente", label: "Pendiente" };
}

export function AptosMedicosManager({
  aptos,
  alumnos,
}: {
  aptos: AptoMedicoRow[];
  alumnos: Alumno[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [filtro, setFiltro] = useState<"todos" | AptoEstado>("todos");
  const [observaciones, setObservaciones] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const alumnoNombre = (id: string) => {
    const a = alumnos.find((x) => x.id === id);
    return a ? `${a.nombre} ${a.apellido}` : "—";
  };

  const visibles = useMemo(
    () => (filtro === "todos" ? aptos : aptos.filter((a) => a.estado === filtro)),
    [aptos, filtro]
  );

  async function verArchivo(archivoUrl: string) {
    const { data } = await supabase.storage
      .from("aptos-medicos")
      .createSignedUrl(archivoUrl, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  }

  async function actualizar(id: string, estado: "aprobado" | "rechazado") {
    setBusyId(id);
    setError(null);
    const { error: updateError } = await supabase
      .from("aptos_medicos")
      .update({ estado, observacion_profesor: observaciones[id] || null })
      .eq("id", id);
    setBusyId(null);
    if (updateError) {
      setError("No pudimos actualizar el apto médico.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <Label>Filtrar por estado</Label>
        <Select
          value={filtro}
          onChange={(e) => setFiltro(e.target.value as "todos" | AptoEstado)}
          className="sm:w-64"
        >
          <option value="todos">Todos</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_revision">En revisión</option>
          <option value="aprobado">Aprobado</option>
          <option value="rechazado">Rechazado</option>
          <option value="vencido">Vencido</option>
        </Select>
      </Card>

      {error && <Alert variant="error">{error}</Alert>}

      {visibles.length === 0 ? (
        <Card>
          <EmptyState icon={HeartPulse} title="No hay aptos médicos para este filtro" />
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {visibles.map((a) => {
            const p = pill(a.estado);
            const pendiente = a.estado === "pendiente" || a.estado === "en_revision";
            return (
              <Card key={a.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-sm font-bold text-ink-950">
                      {alumnoNombre(a.alumno_id)}
                    </p>
                    <p className="text-sm text-ink-700/60">
                      Emisión: {a.fecha_emision ?? "—"} · Vencimiento: {a.fecha_vencimiento ?? "—"}
                    </p>
                    {a.observacion_profesor && (
                      <p className="text-sm text-status-overdue-fg">
                        Observación: {a.observacion_profesor}
                      </p>
                    )}
                  </div>
                  <StatusPill status={p.status} label={p.label} />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" type="button" onClick={() => verArchivo(a.archivo_url)}>
                    <FileText size={14} />
                    Ver archivo
                  </Button>
                  {pendiente && (
                    <>
                      <input
                        type="text"
                        placeholder="Observación (opcional, útil para rechazos)"
                        value={observaciones[a.id] ?? ""}
                        onChange={(e) =>
                          setObservaciones((prev) => ({ ...prev, [a.id]: e.target.value }))
                        }
                        className="h-9 min-w-[220px] flex-1 rounded-lg border border-mist-300 bg-mist-50 px-3 text-xs text-ink-950 focus:border-brand-600 focus:bg-white focus:outline-none"
                      />
                      <Button
                        size="sm"
                        type="button"
                        disabled={busyId === a.id}
                        onClick={() => actualizar(a.id, "aprobado")}
                      >
                        <Check size={14} />
                        Aprobar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        disabled={busyId === a.id}
                        onClick={() => actualizar(a.id, "rechazado")}
                      >
                        <X size={14} />
                        Rechazar
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
