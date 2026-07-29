"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { StatusPill, type PillStatus } from "@/components/ui/StatusPill";
import { FileInput, FieldError, FieldHint } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { Wallet } from "lucide-react";
import type { CuotaRow, ConfiguracionRow } from "@/types/database";

const MAX_SIZE_MB = 8;
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

function pillStatus(estado: CuotaRow["estado"]): PillStatus {
  if (estado === "pagada" || estado === "bonificada") return "aprobado";
  if (estado === "vencida") return "vencido";
  return "pendiente";
}

const ESTADO_LABEL: Record<CuotaRow["estado"], string> = {
  pendiente: "Pendiente",
  pagada: "Pagada",
  vencida: "Vencida",
  bonificada: "Bonificada",
  cancelada: "Cancelada",
};

export function CuotaView({
  alumnoId,
  actual,
  historial,
  config,
}: {
  alumnoId: string;
  actual: CuotaRow | null;
  historial: CuotaRow[];
  config: Pick<ConfiguracionRow, "metodos_pago" | "datos_bancarios"> | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!actual) return;

    if (!file) {
      setError("Seleccioná un comprobante para subir.");
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Formato no admitido. Usá PDF, JPG o PNG.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`El archivo supera el tamaño permitido (${MAX_SIZE_MB} MB).`);
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${alumnoId}/comprobante-${actual.mes}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("comprobantes")
      .upload(path, file);

    if (uploadError) {
      setError("No pudimos subir el comprobante. Probá de nuevo.");
      setUploading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("cuotas")
      .update({ comprobante_url: path })
      .eq("id", actual.id);

    if (updateError) {
      setError("No pudimos registrar el comprobante. Probá de nuevo.");
      setUploading(false);
      return;
    }

    setUploading(false);
    setSuccess(true);
    setFile(null);
    router.refresh();
  }

  if (!actual && historial.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={Wallet}
          title="Sin cuotas cargadas"
          description="Todavía no tenés cuotas registradas. Cuando el equipo cargue tu primera cuota, la vas a ver acá."
        />
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {actual && (
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-ink-700/50">
                {actual.mes}
              </p>
              <p className="mt-1 font-display text-3xl font-bold text-ink-950">
                ${actual.monto.toLocaleString("es-AR")}
              </p>
              <p className="mt-1 text-sm text-ink-700/60">
                Vencimiento: {actual.fecha_vencimiento ?? "—"}
              </p>
            </div>
            <StatusPill status={pillStatus(actual.estado)} label={ESTADO_LABEL[actual.estado]} />
          </div>

          {(config?.metodos_pago || config?.datos_bancarios) && actual.estado !== "pagada" && (
            <div className="mt-4 rounded-lg bg-mist-100 p-4 text-sm text-ink-700/70">
              {config.metodos_pago && <p><strong className="text-ink-950">Métodos de pago:</strong> {config.metodos_pago}</p>}
              {config.datos_bancarios && <p className="mt-1"><strong className="text-ink-950">Datos bancarios:</strong> {config.datos_bancarios}</p>}
            </div>
          )}

          {actual.estado !== "pagada" && actual.estado !== "bonificada" && (
            <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4 border-t border-mist-200 pt-5 sm:flex-row sm:items-end">
              <div className="flex-1">
                <p className="mb-1.5 text-sm font-medium text-ink-950">
                  {actual.comprobante_url ? "Reemplazar comprobante" : "Subir comprobante"}
                </p>
                <FileInput
                  accept="application/pdf,image/jpeg,image/png"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                <FieldHint>PDF, JPG o PNG. Máximo {MAX_SIZE_MB} MB.</FieldHint>
              </div>
              <Button type="submit" disabled={uploading}>
                {uploading ? "Subiendo..." : "Subir comprobante"}
              </Button>
            </form>
          )}
          {error && <div className="mt-2"><FieldError>{error}</FieldError></div>}
          {success && <Alert variant="success" className="mt-3">Comprobante subido. Quedará pendiente de aprobación.</Alert>}
        </Card>
      )}

      <Card>
        <h2 className="mb-4 font-display text-base font-bold text-ink-950">
          Historial de pagos
        </h2>
        {historial.length === 0 ? (
          <p className="text-sm text-ink-700/60">Sin historial todavía.</p>
        ) : (
          <div className="divide-y divide-mist-200">
            {historial.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-ink-950">{c.mes}</p>
                  <p className="text-xs text-ink-700/50">
                    ${c.monto.toLocaleString("es-AR")}
                    {c.fecha_pago ? ` · pagada el ${c.fecha_pago}` : ""}
                  </p>
                </div>
                <StatusPill status={pillStatus(c.estado)} label={ESTADO_LABEL[c.estado]} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
