"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Download } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { recomputePerfilPct } from "@/lib/perfil";
import { Card } from "@/components/ui/Card";
import { StatusPill, type PillStatus } from "@/components/ui/StatusPill";
import { Label, Input, FileInput, FieldError, FieldHint } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import type { AptoMedicoRow } from "@/types/database";

const MAX_SIZE_MB = 10;
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

function pillStatus(estado: AptoMedicoRow["estado"]): PillStatus {
  if (estado === "aprobado") return "aprobado";
  if (estado === "en_revision") return "en_revision";
  if (estado === "rechazado") return "rechazado";
  if (estado === "vencido") return "vencido";
  return "pendiente";
}

export function AptoMedicoManager({
  alumnoId,
  apto,
}: {
  alumnoId: string;
  apto: AptoMedicoRow | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [fechaEmision, setFechaEmision] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  async function verArchivo() {
    if (!apto) return;
    if (signedUrl) {
      window.open(signedUrl, "_blank");
      return;
    }
    const { data } = await supabase.storage
      .from("aptos-medicos")
      .createSignedUrl(apto.archivo_url, 3600);
    if (data?.signedUrl) {
      setSignedUrl(data.signedUrl);
      window.open(data.signedUrl, "_blank");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!file) {
      setError("Seleccioná un archivo para subir.");
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
    if (!fechaEmision) {
      setError("Indicá la fecha de emisión.");
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${alumnoId}/apto-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("aptos-medicos")
      .upload(path, file);

    if (uploadError) {
      setError("No pudimos subir el archivo. Probá de nuevo.");
      setUploading(false);
      return;
    }

    const { error: insertError } = await supabase.from("aptos_medicos").insert({
      alumno_id: alumnoId,
      archivo_url: path,
      fecha_emision: fechaEmision,
      estado: "pendiente",
    });

    if (insertError) {
      setError("No pudimos registrar el apto médico. Probá de nuevo.");
      setUploading(false);
      return;
    }

    await recomputePerfilPct(supabase, alumnoId);
    setUploading(false);
    setSuccess(true);
    setFile(null);
    setFechaEmision("");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-base font-bold text-ink-950">
              Estado actual
            </h2>
            {apto ? (
              <div className="mt-3 space-y-1 text-sm text-ink-700/70">
                <p>
                  Emisión: {apto.fecha_emision ?? "—"} · Vencimiento:{" "}
                  {apto.fecha_vencimiento ?? "—"}
                </p>
                {apto.observacion_profesor && (
                  <p className="text-status-overdue-fg">
                    Observación: {apto.observacion_profesor}
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-3 text-sm text-ink-700/60">
                Todavía no cargaste tu apto médico.
              </p>
            )}
          </div>
          {apto && <StatusPill status={pillStatus(apto.estado)} />}
        </div>
        {apto && (
          <Button variant="outline" size="sm" className="mt-4" onClick={verArchivo} type="button">
            <FileText size={16} />
            Ver archivo actual
            <Download size={14} />
          </Button>
        )}
      </Card>

      <Card>
        <h2 className="mb-1 font-display text-base font-bold text-ink-950">
          {apto ? "Reemplazar apto médico" : "Subir apto médico"}
        </h2>
        <p className="mb-4 text-sm text-ink-700/60">
          Al subir un nuevo archivo, tu apto queda en estado &quot;Pendiente&quot; hasta que el equipo lo revise.
        </p>
        {success && (
          <Alert variant="success" className="mb-4">
            Tu apto médico se encuentra en revisión.
          </Alert>
        )}
        {error && (
          <div className="mb-4">
            <FieldError>{error}</FieldError>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Label htmlFor="fechaEmision" required>Fecha de emisión</Label>
            <Input
              id="fechaEmision"
              type="date"
              value={fechaEmision}
              onChange={(e) => setFechaEmision(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="archivo" required>Archivo</Label>
            <FileInput
              id="archivo"
              accept="application/pdf,image/jpeg,image/png"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <FieldHint>PDF, JPG o PNG. Máximo {MAX_SIZE_MB} MB.</FieldHint>
          </div>
          <Button type="submit" disabled={uploading}>
            {uploading ? "Subiendo..." : "Subir"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
