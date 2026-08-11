"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Check, X, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { StatusPill, type PillStatus } from "@/components/ui/StatusPill";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";
import { Alert } from "@/components/ui/Alert";
import type {
  ProfileRow,
  FichaDeportivaRow,
  CuotaRow,
  AptoMedicoRow,
  EvaluacionRow,
  GrupoRow,
} from "@/types/database";

function cuotaPill(estado: CuotaRow["estado"]): { status: PillStatus; label: string } {
  if (estado === "pagada") return { status: "aprobado", label: "Al día" };
  if (estado === "bonificada") return { status: "aprobado", label: "Bonificada" };
  if (estado === "vencida") return { status: "vencido", label: "Vencida" };
  if (estado === "cancelada") return { status: "pendiente", label: "Cancelada" };
  return { status: "pendiente", label: "Pendiente" };
}

function aptoPill(estado: AptoMedicoRow["estado"]): { status: PillStatus; label: string } {
  if (estado === "aprobado") return { status: "aprobado", label: "Aprobado" };
  if (estado === "rechazado") return { status: "rechazado", label: "Rechazado" };
  if (estado === "vencido") return { status: "vencido", label: "Vencido" };
  if (estado === "en_revision") return { status: "en_revision", label: "En revisión" };
  return { status: "pendiente", label: "Pendiente" };
}

type ObservacionConAutor = {
  id: string;
  alumno_id: string;
  profesor_id: string | null;
  texto: string;
  created_at: string;
  profesorNombre: string | null;
};

export function AlumnoDetail({
  staffId,
  alumno,
  ficha,
  grupoActual,
  cuotas,
  aptos,
  evaluaciones,
  observaciones,
}: {
  staffId: string;
  alumno: ProfileRow;
  ficha: FichaDeportivaRow | null;
  grupoActual: Pick<GrupoRow, "id" | "nombre" | "nivel" | "dias" | "horario" | "lugar" | "punto_encuentro"> | null;
  cuotas: CuotaRow[];
  aptos: AptoMedicoRow[];
  evaluaciones: EvaluacionRow[];
  observaciones: ObservacionConAutor[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [aptoObservacion, setAptoObservacion] = useState<Record<string, string>>({});
  const [aptoBusy, setAptoBusy] = useState<string | null>(null);
  const [notaTexto, setNotaTexto] = useState("");
  const [notaBusy, setNotaBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function verArchivo(archivoUrl: string) {
    const { data } = await supabase.storage
      .from("aptos-medicos")
      .createSignedUrl(archivoUrl, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  }

  async function actualizarApto(id: string, estado: "aprobado" | "rechazado") {
    setAptoBusy(id);
    setError(null);
    const { error: updateError } = await supabase
      .from("aptos_medicos")
      .update({
        estado,
        observacion_profesor: aptoObservacion[id] || null,
      })
      .eq("id", id);
    setAptoBusy(null);
    if (updateError) {
      setError("No pudimos actualizar el apto médico.");
      return;
    }
    router.refresh();
  }

  async function agregarNota() {
    if (!notaTexto.trim()) return;
    setNotaBusy(true);
    setError(null);
    const { error: insertError } = await supabase.from("observaciones_privadas").insert({
      alumno_id: alumno.id,
      profesor_id: staffId,
      texto: notaTexto.trim(),
    });
    setNotaBusy(false);
    if (insertError) {
      setError("No pudimos guardar la nota.");
      return;
    }
    setNotaTexto("");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      {error && <Alert variant="error">{error}</Alert>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-display text-base font-bold text-ink-950">
            Datos personales
          </h2>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <dt className="text-xs text-ink-700/50">DNI</dt>
              <dd className="text-ink-950">{alumno.dni ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-700/50">Teléfono</dt>
              <dd className="text-ink-950">{alumno.telefono ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-700/50">Fecha de nacimiento</dt>
              <dd className="text-ink-950">{alumno.fecha_nacimiento ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-700/50">Género</dt>
              <dd className="text-ink-950">{alumno.genero ?? "—"}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-xs text-ink-700/50">Domicilio</dt>
              <dd className="text-ink-950">
                {[alumno.domicilio, alumno.localidad, alumno.provincia].filter(Boolean).join(", ") || "—"}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-xs text-ink-700/50">Contacto de emergencia</dt>
              <dd className="text-ink-950">
                {alumno.contacto_emergencia_nombre
                  ? `${alumno.contacto_emergencia_nombre} (${alumno.contacto_emergencia_relacion ?? "—"}) · ${alumno.contacto_emergencia_telefono ?? "—"}`
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-ink-700/50">Perfil completado</dt>
              <dd className="text-ink-950">{alumno.perfil_completado_pct}%</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-700/50">Estado</dt>
              <dd>
                <StatusPill
                  status={alumno.activo ? "aprobado" : "vencido"}
                  label={alumno.activo ? "Activo" : "Inactivo"}
                />
              </dd>
            </div>
          </dl>
        </Card>

        <Card>
          <h2 className="mb-4 font-display text-base font-bold text-ink-950">
            Grupo y ficha deportiva
          </h2>
          {grupoActual ? (
            <div className="mb-4 rounded-lg bg-mist-100 p-3 text-sm">
              <p className="font-display font-bold text-ink-950">{grupoActual.nombre}</p>
              <p className="text-ink-700/60">
                {grupoActual.dias?.join(", ") || "—"} · {grupoActual.horario ?? "—"}
              </p>
              <p className="text-ink-700/60">{grupoActual.lugar ?? "—"}</p>
            </div>
          ) : (
            <p className="mb-4 text-sm text-ink-700/60">Sin grupo asignado.</p>
          )}
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <dt className="text-xs text-ink-700/50">Nivel</dt>
              <dd className="text-ink-950">{ficha?.nivel ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-700/50">Objetivo principal</dt>
              <dd className="text-ink-950">{ficha?.objetivo_principal ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-700/50">Marca 5k</dt>
              <dd className="text-ink-950">{ficha?.marca_5k ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-700/50">Marca 10k</dt>
              <dd className="text-ink-950">{ficha?.marca_10k ?? "—"}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-xs text-ink-700/50">Lesiones previas</dt>
              <dd className="text-ink-950">{ficha?.lesiones_previas ?? "—"}</dd>
            </div>
          </dl>
        </Card>
      </div>

      <Card>
        <h2 className="mb-4 font-display text-base font-bold text-ink-950">
          Historial de cuotas
        </h2>
        {cuotas.length === 0 ? (
          <p className="text-sm text-ink-700/60">Sin cuotas cargadas.</p>
        ) : (
          <div className="divide-y divide-mist-200">
            {cuotas.map((c) => {
              const p = cuotaPill(c.estado);
              return (
                <div key={c.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <div>
                    <p className="font-semibold text-ink-950">{c.mes}</p>
                    <p className="text-xs text-ink-700/50">
                      ${c.monto.toLocaleString("es-AR")}
                      {c.fecha_pago ? ` · actualizado el ${c.fecha_pago}` : ""}
                    </p>
                  </div>
                  <StatusPill status={p.status} label={p.label} />
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card>
        <h2 className="mb-4 font-display text-base font-bold text-ink-950">
          Aptos médicos
        </h2>
        {aptos.length === 0 ? (
          <p className="text-sm text-ink-700/60">Sin aptos médicos cargados.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {aptos.map((a) => {
              const p = aptoPill(a.estado);
              const pendiente = a.estado === "pendiente" || a.estado === "en_revision";
              return (
                <div key={a.id} className="rounded-lg border border-mist-200 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm">
                      <p className="text-ink-950">
                        Emisión: {a.fecha_emision ?? "—"} · Vencimiento: {a.fecha_vencimiento ?? "—"}
                      </p>
                      {a.observacion_profesor && (
                        <p className="text-status-overdue-fg">Observación: {a.observacion_profesor}</p>
                      )}
                    </div>
                    <StatusPill status={p.status} label={p.label} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm" type="button" onClick={() => verArchivo(a.archivo_url)}>
                      <FileText size={14} />
                      Ver archivo
                    </Button>
                    {pendiente && (
                      <>
                        <input
                          type="text"
                          placeholder="Observación (opcional)"
                          value={aptoObservacion[a.id] ?? ""}
                          onChange={(e) =>
                            setAptoObservacion((prev) => ({ ...prev, [a.id]: e.target.value }))
                          }
                          className="h-9 flex-1 min-w-[160px] rounded-lg border border-mist-300 bg-mist-50 px-3 text-xs text-ink-950 focus:border-brand-600 focus:bg-white focus:outline-none"
                        />
                        <Button
                          size="sm"
                          type="button"
                          disabled={aptoBusy === a.id}
                          onClick={() => actualizarApto(a.id, "aprobado")}
                        >
                          <Check size={14} />
                          Aprobar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          disabled={aptoBusy === a.id}
                          onClick={() => actualizarApto(a.id, "rechazado")}
                        >
                          <X size={14} />
                          Rechazar
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card>
        <h2 className="mb-4 font-display text-base font-bold text-ink-950">
          Evaluaciones
        </h2>
        {evaluaciones.length === 0 ? (
          <p className="text-sm text-ink-700/60">Sin evaluaciones cargadas.</p>
        ) : (
          <div className="divide-y divide-mist-200">
            {evaluaciones.map((e) => (
              <div key={e.id} className="py-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-semibold text-ink-950">{e.tipo}</p>
                  <p className="text-xs text-ink-700/50">{e.fecha}</p>
                </div>
                <p className="text-ink-700/70">
                  {e.resultado ?? "—"} {e.unidad ?? ""}
                </p>
                {e.comentario_profesor && (
                  <p className="text-xs text-ink-700/50">{e.comentario_profesor}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h2 className="mb-1 font-display text-base font-bold text-ink-950">
          Observaciones privadas
        </h2>
        <p className="mb-4 text-sm text-ink-700/60">
          Notas visibles solo para el equipo, nunca para el alumno.
        </p>
        <div className="flex flex-col gap-3">
          <Textarea
            placeholder="Escribí una nota..."
            value={notaTexto}
            onChange={(e) => setNotaTexto(e.target.value)}
            rows={2}
          />
          <div>
            <Button size="sm" type="button" disabled={notaBusy || !notaTexto.trim()} onClick={agregarNota}>
              <Plus size={14} />
              {notaBusy ? "Guardando..." : "Agregar nota"}
            </Button>
          </div>
        </div>
        {observaciones.length > 0 && (
          <div className="mt-5 flex flex-col gap-3 border-t border-mist-200 pt-4">
            {observaciones.map((o) => (
              <div key={o.id} className="rounded-lg bg-mist-100 p-3 text-sm">
                <p className="text-ink-950">{o.texto}</p>
                <p className="mt-1 text-xs text-ink-700/50">
                  {o.profesorNombre ?? "Equipo"} · {new Date(o.created_at).toLocaleDateString("es-AR")}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
