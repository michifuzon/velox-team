"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, X, Flag } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Input, Select, Textarea, FieldError } from "@/components/ui/Field";
import { StatusPill, type PillStatus } from "@/components/ui/StatusPill";
import { EmptyState } from "@/components/ui/EmptyState";
import type { CarreraRow, CarreraEstado } from "@/types/database";

function estadoPill(estado: CarreraEstado): { status: PillStatus; label: string } {
  if (estado === "realizada") return { status: "completado", label: "Realizada" };
  if (estado === "cancelada") return { status: "rechazado", label: "Cancelada" };
  return { status: "pendiente", label: "Próxima" };
}

type FormState = {
  nombre: string;
  fecha: string;
  lugar: string;
  distancia: string;
  horario: string;
  descripcion: string;
  fecha_limite_inscripcion: string;
  costo: string;
  punto_encuentro_equipo: string;
  imagen_url: string;
  enlace_oficial: string;
  estado: CarreraEstado;
};

const EMPTY_FORM: FormState = {
  nombre: "",
  fecha: "",
  lugar: "",
  distancia: "",
  horario: "",
  descripcion: "",
  fecha_limite_inscripcion: "",
  costo: "",
  punto_encuentro_equipo: "",
  imagen_url: "",
  enlace_oficial: "",
  estado: "proxima",
};

function carreraToForm(c: CarreraRow): FormState {
  return {
    nombre: c.nombre,
    fecha: c.fecha,
    lugar: c.lugar ?? "",
    distancia: c.distancia ?? "",
    horario: c.horario ?? "",
    descripcion: c.descripcion ?? "",
    fecha_limite_inscripcion: c.fecha_limite_inscripcion ?? "",
    costo: c.costo != null ? String(c.costo) : "",
    punto_encuentro_equipo: c.punto_encuentro_equipo ?? "",
    imagen_url: c.imagen_url ?? "",
    enlace_oficial: c.enlace_oficial ?? "",
    estado: c.estado,
  };
}

function CarreraFormFields({
  form,
  setForm,
  includeEstado,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
  includeEstado?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <Label required>Nombre</Label>
        <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
      </div>
      <div>
        <Label required>Fecha</Label>
        <Input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
      </div>
      <div>
        <Label>Lugar</Label>
        <Input value={form.lugar} onChange={(e) => setForm({ ...form, lugar: e.target.value })} />
      </div>
      <div>
        <Label>Distancia</Label>
        <Input placeholder="Ej: 10 km" value={form.distancia} onChange={(e) => setForm({ ...form, distancia: e.target.value })} />
      </div>
      <div>
        <Label>Horario</Label>
        <Input value={form.horario} onChange={(e) => setForm({ ...form, horario: e.target.value })} />
      </div>
      <div>
        <Label>Costo</Label>
        <Input type="number" min={0} value={form.costo} onChange={(e) => setForm({ ...form, costo: e.target.value })} />
      </div>
      <div>
        <Label>Fecha límite de inscripción</Label>
        <Input
          type="date"
          value={form.fecha_limite_inscripcion}
          onChange={(e) => setForm({ ...form, fecha_limite_inscripcion: e.target.value })}
        />
      </div>
      <div>
        <Label>Punto de encuentro del equipo</Label>
        <Input
          value={form.punto_encuentro_equipo}
          onChange={(e) => setForm({ ...form, punto_encuentro_equipo: e.target.value })}
        />
      </div>
      <div>
        <Label>Imagen (URL)</Label>
        <Input placeholder="https://..." value={form.imagen_url} onChange={(e) => setForm({ ...form, imagen_url: e.target.value })} />
      </div>
      <div>
        <Label>Link oficial de la carrera</Label>
        <Input placeholder="https://..." value={form.enlace_oficial} onChange={(e) => setForm({ ...form, enlace_oficial: e.target.value })} />
      </div>
      {includeEstado && (
        <div>
          <Label>Estado</Label>
          <Select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value as CarreraEstado })}>
            <option value="proxima">Próxima</option>
            <option value="realizada">Realizada</option>
            <option value="cancelada">Cancelada</option>
          </Select>
        </div>
      )}
      <div className="sm:col-span-2">
        <Label>Descripción</Label>
        <Textarea rows={2} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
      </div>
    </div>
  );
}

export function CarrerasManager({ carreras }: { carreras: CarreraRow[] }) {
  const router = useRouter();
  const supabase = createClient();

  const [createForm, setCreateForm] = useState<FormState>(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  async function handleCrear(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    if (!createForm.nombre.trim() || !createForm.fecha) {
      setCreateError("El nombre y la fecha son obligatorios.");
      return;
    }
    setCreating(true);
    const { error } = await supabase.from("carreras").insert({
      nombre: createForm.nombre.trim(),
      fecha: createForm.fecha,
      lugar: createForm.lugar || null,
      distancia: createForm.distancia || null,
      horario: createForm.horario || null,
      descripcion: createForm.descripcion || null,
      fecha_limite_inscripcion: createForm.fecha_limite_inscripcion || null,
      costo: createForm.costo ? Number(createForm.costo) : null,
      punto_encuentro_equipo: createForm.punto_encuentro_equipo || null,
      imagen_url: createForm.imagen_url || null,
      enlace_oficial: createForm.enlace_oficial || null,
      estado: "proxima",
    });
    setCreating(false);
    if (error) {
      setCreateError("No pudimos crear la carrera. Probá de nuevo.");
      return;
    }
    setCreateForm(EMPTY_FORM);
    router.refresh();
  }

  function startEdit(c: CarreraRow) {
    setEditingId(c.id);
    setEditForm(carreraToForm(c));
    setEditError(null);
  }

  async function handleSaveEdit(id: string) {
    setEditError(null);
    if (!editForm.nombre.trim() || !editForm.fecha) {
      setEditError("El nombre y la fecha son obligatorios.");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("carreras")
      .update({
        nombre: editForm.nombre.trim(),
        fecha: editForm.fecha,
        lugar: editForm.lugar || null,
        distancia: editForm.distancia || null,
        horario: editForm.horario || null,
        descripcion: editForm.descripcion || null,
        fecha_limite_inscripcion: editForm.fecha_limite_inscripcion || null,
        costo: editForm.costo ? Number(editForm.costo) : null,
        punto_encuentro_equipo: editForm.punto_encuentro_equipo || null,
        imagen_url: editForm.imagen_url || null,
        enlace_oficial: editForm.enlace_oficial || null,
        estado: editForm.estado,
      })
      .eq("id", id);
    setSaving(false);
    if (error) {
      setEditError("No pudimos guardar los cambios.");
      return;
    }
    setEditingId(null);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!window.confirm("¿Eliminar esta carrera? Esta acción no se puede deshacer.")) return;
    await supabase.from("carreras").delete().eq("id", id);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h2 className="mb-4 font-display text-base font-bold text-ink-950">Nueva carrera</h2>
        {createError && <div className="mb-3"><FieldError>{createError}</FieldError></div>}
        <form onSubmit={handleCrear} className="flex flex-col gap-4">
          <CarreraFormFields form={createForm} setForm={setCreateForm} />
          <div>
            <Button type="submit" disabled={creating}>
              <Plus size={16} />
              {creating ? "Creando..." : "Crear carrera"}
            </Button>
          </div>
        </form>
      </Card>

      {carreras.length === 0 ? (
        <Card>
          <EmptyState icon={Flag} title="Todavía no hay carreras cargadas" />
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {carreras.map((c) => {
            const p = estadoPill(c.estado);
            const isEditing = editingId === c.id;
            return (
              <Card key={c.id}>
                {isEditing ? (
                  <div className="flex flex-col gap-4">
                    {editError && <FieldError>{editError}</FieldError>}
                    <CarreraFormFields form={editForm} setForm={setEditForm} includeEstado />
                    <div className="flex gap-2">
                      <Button size="sm" type="button" disabled={saving} onClick={() => handleSaveEdit(c.id)}>
                        {saving ? "Guardando..." : "Guardar cambios"}
                      </Button>
                      <Button variant="outline" size="sm" type="button" onClick={() => setEditingId(null)}>
                        <X size={14} />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-display text-lg font-bold text-ink-950">{c.nombre}</p>
                        <p className="text-sm text-ink-700/60">
                          {c.fecha} · {c.lugar ?? "—"} · {c.distancia ?? "—"}
                        </p>
                      </div>
                      <StatusPill status={p.status} label={p.label} />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" type="button" onClick={() => startEdit(c)}>
                        <Pencil size={14} />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        onClick={() => handleDelete(c.id)}
                        className="text-status-overdue-fg hover:bg-status-overdue-bg"
                      >
                        <X size={14} />
                        Eliminar
                      </Button>
                    </div>
                  </>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
