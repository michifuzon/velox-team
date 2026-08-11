"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Input } from "@/components/ui/Field";
import { Alert } from "@/components/ui/Alert";
import type { ConfiguracionRow } from "@/types/database";

export function ConfiguracionForm({
  configuracion,
  readOnly,
}: {
  configuracion: ConfiguracionRow;
  readOnly: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    nombre_equipo: configuracion.nombre_equipo ?? "",
    contacto_whatsapp: configuracion.contacto_whatsapp ?? "",
    contacto_instagram: configuracion.contacto_instagram ?? "",
    color_primario: configuracion.color_primario ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("idle");
    setSaving(true);
    const { error } = await supabase
      .from("configuracion")
      .update({
        nombre_equipo: form.nombre_equipo || null,
        contacto_whatsapp: form.contacto_whatsapp || null,
        contacto_instagram: form.contacto_instagram || null,
        color_primario: form.color_primario || null,
      })
      .eq("id", 1);
    setSaving(false);
    if (error) {
      setStatus("error");
      return;
    }
    setStatus("success");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {status === "success" && <Alert variant="success">Configuración actualizada.</Alert>}
      {status === "error" && <Alert variant="error">No pudimos guardar los cambios.</Alert>}

      <Card>
        <h2 className="mb-4 font-display text-base font-bold text-ink-950">Equipo y contacto</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>Nombre del equipo</Label>
            <Input
              disabled={readOnly}
              value={form.nombre_equipo}
              onChange={(e) => setForm({ ...form, nombre_equipo: e.target.value })}
            />
          </div>
          <div>
            <Label>WhatsApp de contacto</Label>
            <Input
              disabled={readOnly}
              value={form.contacto_whatsapp}
              onChange={(e) => setForm({ ...form, contacto_whatsapp: e.target.value })}
            />
          </div>
          <div>
            <Label>Instagram</Label>
            <Input
              disabled={readOnly}
              value={form.contacto_instagram}
              onChange={(e) => setForm({ ...form, contacto_instagram: e.target.value })}
            />
          </div>
          <div>
            <Label>Color primario</Label>
            <Input
              disabled={readOnly}
              placeholder="#0B4F3C"
              value={form.color_primario}
              onChange={(e) => setForm({ ...form, color_primario: e.target.value })}
            />
          </div>
        </div>
      </Card>

      {!readOnly && (
        <div className="sticky bottom-20 z-10 flex justify-end lg:bottom-4">
          <Button type="submit" size="lg" disabled={saving}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      )}
    </form>
  );
}
