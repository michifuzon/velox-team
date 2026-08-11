"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, X, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, FieldError } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/EmptyState";
import { Wrench, Lightbulb, CircleHelp } from "lucide-react";
import type { ServicioRow, ConsejoRow, FaqRow } from "@/types/database";

function ItemRow({
  title,
  body,
  onEdit,
  onDelete,
}: {
  title: string;
  body: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-mist-200 py-4 last:border-0">
      <div className="min-w-0">
        <p className="font-semibold text-ink-950">{title}</p>
        <p className="mt-1 text-sm text-ink-700/60">{body}</p>
      </div>
      <div className="flex shrink-0 gap-1.5">
        <button
          type="button"
          onClick={onEdit}
          aria-label="Editar"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-700/60 hover:bg-mist-100 hover:text-ink-950"
        >
          <Pencil size={14} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label="Eliminar"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-status-overdue-fg hover:bg-status-overdue-bg"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

function ServiciosSection({ servicios }: { servicios: ServicioRow[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [form, setForm] = useState({ titulo: "", descripcion: "", orden: "0" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function startEdit(s: ServicioRow) {
    setEditingId(s.id);
    setForm({ titulo: s.titulo, descripcion: s.descripcion, orden: String(s.orden) });
    setError(null);
  }

  function cancel() {
    setEditingId(null);
    setForm({ titulo: "", descripcion: "", orden: "0" });
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.titulo.trim() || !form.descripcion.trim()) {
      setError("Completá título y descripción.");
      return;
    }
    setSaving(true);
    const payload = {
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim(),
      orden: Number(form.orden) || 0,
    };
    const { error: dbError } = editingId
      ? await supabase.from("servicios").update(payload).eq("id", editingId)
      : await supabase.from("servicios").insert(payload);
    setSaving(false);
    if (dbError) {
      setError("No pudimos guardar. Probá de nuevo.");
      return;
    }
    cancel();
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!window.confirm("¿Eliminar este servicio?")) return;
    await supabase.from("servicios").delete().eq("id", id);
    router.refresh();
  }

  return (
    <Card>
      <div className="mb-4 flex items-center gap-2">
        <Wrench className="h-4 w-4 text-brand-600" />
        <h2 className="font-display text-base font-bold text-ink-950">Servicios</h2>
      </div>
      {servicios.length === 0 ? (
        <EmptyState icon={Wrench} title="Sin servicios cargados" />
      ) : (
        <div>
          {servicios.map((s) => (
            <ItemRow
              key={s.id}
              title={s.titulo}
              body={s.descripcion}
              onEdit={() => startEdit(s)}
              onDelete={() => handleDelete(s.id)}
            />
          ))}
        </div>
      )}
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 border-t border-mist-200 pt-4">
        {error && <FieldError>{error}</FieldError>}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_80px]">
          <Input
            placeholder="Título"
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
          />
          <Input
            placeholder="Descripción"
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Orden"
            value={form.orden}
            onChange={(e) => setForm({ ...form, orden: e.target.value })}
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={saving}>
            {editingId ? <Pencil size={14} /> : <Plus size={14} />}
            {saving ? "Guardando..." : editingId ? "Guardar cambios" : "Agregar servicio"}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" size="sm" onClick={cancel}>
              <X size={14} />
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}

function ConsejosSection({ consejos }: { consejos: ConsejoRow[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [form, setForm] = useState({ titulo: "", texto: "", orden: "0" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function startEdit(c: ConsejoRow) {
    setEditingId(c.id);
    setForm({ titulo: c.titulo, texto: c.texto, orden: String(c.orden) });
    setError(null);
  }

  function cancel() {
    setEditingId(null);
    setForm({ titulo: "", texto: "", orden: "0" });
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.titulo.trim() || !form.texto.trim()) {
      setError("Completá título y texto.");
      return;
    }
    setSaving(true);
    const payload = {
      titulo: form.titulo.trim(),
      texto: form.texto.trim(),
      orden: Number(form.orden) || 0,
    };
    const { error: dbError } = editingId
      ? await supabase.from("consejos").update(payload).eq("id", editingId)
      : await supabase.from("consejos").insert(payload);
    setSaving(false);
    if (dbError) {
      setError("No pudimos guardar. Probá de nuevo.");
      return;
    }
    cancel();
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!window.confirm("¿Eliminar este consejo?")) return;
    await supabase.from("consejos").delete().eq("id", id);
    router.refresh();
  }

  return (
    <Card>
      <div className="mb-4 flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-brand-600" />
        <h2 className="font-display text-base font-bold text-ink-950">Consejos</h2>
      </div>
      {consejos.length === 0 ? (
        <EmptyState icon={Lightbulb} title="Sin consejos cargados" />
      ) : (
        <div>
          {consejos.map((c) => (
            <ItemRow
              key={c.id}
              title={c.titulo}
              body={c.texto}
              onEdit={() => startEdit(c)}
              onDelete={() => handleDelete(c.id)}
            />
          ))}
        </div>
      )}
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 border-t border-mist-200 pt-4">
        {error && <FieldError>{error}</FieldError>}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_80px]">
          <Input
            placeholder="Título"
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Orden"
            value={form.orden}
            onChange={(e) => setForm({ ...form, orden: e.target.value })}
          />
        </div>
        <Textarea
          rows={2}
          placeholder="Texto del consejo"
          value={form.texto}
          onChange={(e) => setForm({ ...form, texto: e.target.value })}
        />
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={saving}>
            {editingId ? <Pencil size={14} /> : <Plus size={14} />}
            {saving ? "Guardando..." : editingId ? "Guardar cambios" : "Agregar consejo"}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" size="sm" onClick={cancel}>
              <X size={14} />
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}

function FaqsSection({ faqs }: { faqs: FaqRow[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [form, setForm] = useState({ pregunta: "", respuesta: "", orden: "0" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function startEdit(f: FaqRow) {
    setEditingId(f.id);
    setForm({ pregunta: f.pregunta, respuesta: f.respuesta, orden: String(f.orden) });
    setError(null);
  }

  function cancel() {
    setEditingId(null);
    setForm({ pregunta: "", respuesta: "", orden: "0" });
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.pregunta.trim() || !form.respuesta.trim()) {
      setError("Completá la pregunta y la respuesta.");
      return;
    }
    setSaving(true);
    const payload = {
      pregunta: form.pregunta.trim(),
      respuesta: form.respuesta.trim(),
      orden: Number(form.orden) || 0,
    };
    const { error: dbError } = editingId
      ? await supabase.from("faqs").update(payload).eq("id", editingId)
      : await supabase.from("faqs").insert(payload);
    setSaving(false);
    if (dbError) {
      setError("No pudimos guardar. Probá de nuevo.");
      return;
    }
    cancel();
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!window.confirm("¿Eliminar esta pregunta?")) return;
    await supabase.from("faqs").delete().eq("id", id);
    router.refresh();
  }

  return (
    <Card>
      <div className="mb-4 flex items-center gap-2">
        <CircleHelp className="h-4 w-4 text-brand-600" />
        <h2 className="font-display text-base font-bold text-ink-950">Preguntas frecuentes</h2>
      </div>
      {faqs.length === 0 ? (
        <EmptyState icon={CircleHelp} title="Sin preguntas cargadas" />
      ) : (
        <div>
          {faqs.map((f) => (
            <ItemRow
              key={f.id}
              title={f.pregunta}
              body={f.respuesta}
              onEdit={() => startEdit(f)}
              onDelete={() => handleDelete(f.id)}
            />
          ))}
        </div>
      )}
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 border-t border-mist-200 pt-4">
        {error && <FieldError>{error}</FieldError>}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_80px]">
          <Input
            placeholder="Pregunta"
            value={form.pregunta}
            onChange={(e) => setForm({ ...form, pregunta: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Orden"
            value={form.orden}
            onChange={(e) => setForm({ ...form, orden: e.target.value })}
          />
        </div>
        <Textarea
          rows={2}
          placeholder="Respuesta"
          value={form.respuesta}
          onChange={(e) => setForm({ ...form, respuesta: e.target.value })}
        />
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={saving}>
            {editingId ? <Pencil size={14} /> : <Plus size={14} />}
            {saving ? "Guardando..." : editingId ? "Guardar cambios" : "Agregar pregunta"}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" size="sm" onClick={cancel}>
              <X size={14} />
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}

export function ContenidoManager({
  servicios,
  consejos,
  faqs,
}: {
  servicios: ServicioRow[];
  consejos: ConsejoRow[];
  faqs: FaqRow[];
}) {
  return (
    <div className="flex flex-col gap-6">
      <ServiciosSection servicios={servicios} />
      <ConsejosSection consejos={consejos} />
      <FaqsSection faqs={faqs} />
    </div>
  );
}
