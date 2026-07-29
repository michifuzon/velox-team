"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Quote } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Textarea, FieldError, FieldHint } from "@/components/ui/Field";
import { StatusPill } from "@/components/ui/StatusPill";
import type { TestimonioRow } from "@/types/database";

const MAX_LEN = 500;

export function TestimonioForm({
  alumnoId,
  ultimo,
}: {
  alumnoId: string;
  ultimo: TestimonioRow | null;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [texto, setTexto] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!texto.trim()) {
      setError("Contanos brevemente tu historia antes de enviarla.");
      return;
    }
    if (texto.trim().length > MAX_LEN) {
      setError(`Tu historia no puede superar los ${MAX_LEN} caracteres.`);
      return;
    }
    setSending(true);
    const { error: insertError } = await supabase.from("testimonios").insert({
      alumno_id: alumnoId,
      texto: texto.trim(),
    });
    setSending(false);
    if (insertError) {
      setError("No pudimos enviar tu historia. Probá de nuevo.");
      return;
    }
    setTexto("");
    setSent(true);
    router.refresh();
  }

  // Once the alumno has a submission on record (or just sent a new one), show
  // its status instead of the form — one story shared and tracked at a time.
  if (ultimo || sent) {
    const aprobado = ultimo?.aprobado ?? false;
    return (
      <Card>
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-base font-bold text-ink-950">Tu historia</h2>
          <StatusPill
            status={aprobado ? "aprobado" : "pendiente"}
            label={aprobado ? "Publicada" : "En revisión"}
          />
        </div>
        {ultimo && (
          <blockquote className="mt-3 text-sm leading-relaxed text-ink-700/80">
            &ldquo;{ultimo.texto}&rdquo;
          </blockquote>
        )}
        <p className="mt-3 text-sm text-ink-700/60">
          {aprobado
            ? "¡Gracias por compartirla! Ya está publicada en la web de Velox Running Team."
            : "Gracias por compartirla. Nuestro equipo la está revisando antes de publicarla."}
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
          <Quote size={16} />
        </span>
        <h2 className="font-display text-base font-bold text-ink-950">Compartí tu historia</h2>
      </div>
      <p className="mt-2 text-sm text-ink-700/60">
        Contanos tu historia con Velox Running Team. Si nuestro equipo la aprueba, la vamos a
        mostrar en la web para inspirar a otros corredores.
      </p>
      {error && <div className="mt-3"><FieldError>{error}</FieldError></div>}
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
        <div>
          <Label required>Tu historia</Label>
          <Textarea
            rows={5}
            maxLength={MAX_LEN}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Hace un año no podía correr dos kilómetros y hoy..."
          />
          <FieldHint>{texto.length}/{MAX_LEN} caracteres</FieldHint>
        </div>
        <div>
          <Button type="submit" disabled={sending}>
            {sending ? "Enviando..." : "Enviar mi historia"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
