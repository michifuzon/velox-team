"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Input, Textarea } from "@/components/ui/Field";
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
    contacto_email: configuracion.contacto_email ?? "",
    monto_cuota_general: configuracion.monto_cuota_general != null ? String(configuracion.monto_cuota_general) : "",
    dia_vencimiento_cuota: configuracion.dia_vencimiento_cuota != null ? String(configuracion.dia_vencimiento_cuota) : "",
    metodos_pago: configuracion.metodos_pago ?? "",
    datos_bancarios: configuracion.datos_bancarios ?? "",
    terminos_condiciones: configuracion.terminos_condiciones ?? "",
    politica_privacidad: configuracion.politica_privacidad ?? "",
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
        contacto_email: form.contacto_email || null,
        monto_cuota_general: form.monto_cuota_general === "" ? null : Number(form.monto_cuota_general),
        dia_vencimiento_cuota:
          form.dia_vencimiento_cuota === "" ? null : Number(form.dia_vencimiento_cuota),
        metodos_pago: form.metodos_pago || null,
        datos_bancarios: form.datos_bancarios || null,
        terminos_condiciones: form.terminos_condiciones || null,
        politica_privacidad: form.politica_privacidad || null,
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
            <Label>Email de contacto</Label>
            <Input
              disabled={readOnly}
              type="email"
              value={form.contacto_email}
              onChange={(e) => setForm({ ...form, contacto_email: e.target.value })}
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

      <Card>
        <h2 className="mb-4 font-display text-base font-bold text-ink-950">Cuotas y pagos</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>Monto de cuota general</Label>
            <Input
              disabled={readOnly}
              type="number"
              min={0}
              value={form.monto_cuota_general}
              onChange={(e) => setForm({ ...form, monto_cuota_general: e.target.value })}
            />
          </div>
          <div>
            <Label>Día de vencimiento de cuota</Label>
            <Input
              disabled={readOnly}
              type="number"
              min={1}
              max={31}
              value={form.dia_vencimiento_cuota}
              onChange={(e) => setForm({ ...form, dia_vencimiento_cuota: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Métodos de pago</Label>
            <Textarea
              disabled={readOnly}
              rows={2}
              value={form.metodos_pago}
              onChange={(e) => setForm({ ...form, metodos_pago: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Datos bancarios</Label>
            <Textarea
              disabled={readOnly}
              rows={2}
              value={form.datos_bancarios}
              onChange={(e) => setForm({ ...form, datos_bancarios: e.target.value })}
            />
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 font-display text-base font-bold text-ink-950">Textos legales</h2>
        <div className="flex flex-col gap-4">
          <div>
            <Label>Términos y condiciones</Label>
            <Textarea
              disabled={readOnly}
              rows={4}
              value={form.terminos_condiciones}
              onChange={(e) => setForm({ ...form, terminos_condiciones: e.target.value })}
            />
          </div>
          <div>
            <Label>Política de privacidad</Label>
            <Textarea
              disabled={readOnly}
              rows={4}
              value={form.politica_privacidad}
              onChange={(e) => setForm({ ...form, politica_privacidad: e.target.value })}
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
