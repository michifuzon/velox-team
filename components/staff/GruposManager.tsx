"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Input, Select, Textarea, FieldError } from "@/components/ui/Field";
import { StatusPill } from "@/components/ui/StatusPill";
import { EmptyState } from "@/components/ui/EmptyState";
import { CalendarRange } from "lucide-react";
import type { GrupoRow, NivelRunning, GrupoEstado } from "@/types/database";

type Profesor = { id: string; nombre: string; apellido: string };

type FormState = {
  nombre: string;
  nivel: NivelRunning;
  profesor_id: string;
  dias: string;
  horario: string;
  lugar: string;
  punto_encuentro: string;
  descripcion: string;
  estado: GrupoEstado;
};

const EMPTY_FORM: FormState = {
  nombre: "",
  nivel: "principiante",
  profesor_id: "",
  dias: "",
  horario: "",
  lugar: "",
  punto_encuentro: "",
  descripcion: "",
  estado: "activo",
};

function grupoToForm(g: GrupoRow): FormState {
  return {
    nombre: g.nombre,
    nivel: g.nivel,
    profesor_id: g.profesor_id ?? "",
    dias: (g.dias ?? []).join(", "),
    horario: g.horario ?? "",
    lugar: g.lugar ?? "",
    punto_encuentro: g.punto_encuentro ?? "",
    descripcion: g.descripcion ?? "",
    estado: g.estado,
  };
}

function GrupoFormFields({
  form,
  setForm,
  profesores,
  includeEstado,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
  profesores: Profesor[];
  includeEstado?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <Label required>Nombre</Label>
        <Input
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          placeholder="Ej: Velox Inicial"
        />
      </div>
      <div>
        <Label required>Nivel</Label>
        <Select
          value={form.nivel}
          onChange={(e) => setForm({ ...form, nivel: e.target.value as NivelRunning })}
        >
          <option value="principiante">Principiante</option>
          <option value="intermedio">Intermedio</option>
          <option value="avanzado">Avanzado</option>
        </Select>
      </div>
      <div>
        <Label>Profesor a cargo</Label>
        <Select
          value={form.profesor_id}
          onChange={(e) => setForm({ ...form, profesor_id: e.target.value })}
        >
          <option value="">Sin asignar</option>
          {profesores.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre} {p.apellido}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label>Días (separados por coma)</Label>
        <Input
          placeholder="Lunes, Miércoles, Viernes"
          value={form.dias}
          onChange={(e) => setForm({ ...form, dias: e.target.value })}
        />
      </div>
      <div>
        <Label>Horario</Label>
        <Input
          placeholder="Ej: 19:00 hs"
          value={form.horario}
          onChange={(e) => setForm({ ...form, horario: e.target.value })}
        />
      </div>
      <div>
        <Label>Lugar</Label>
        <Input value={form.lugar} onChange={(e) => setForm({ ...form, lugar: e.target.value })} />
      </div>
      <div>
        <Label>Punto de encuentro</Label>
        <Input
          value={form.punto_encuentro}
          onChange={(e) => setForm({ ...form, punto_encuentro: e.target.value })}
        />
      </div>
      {includeEstado && (
        <div>
          <Label>Estado</Label>
          <Select
            value={form.estado}
            onChange={(e) => setForm({ ...form, estado: e.target.value as GrupoEstado })}
          >
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </Select>
        </div>
      )}
      <div className="sm:col-span-2">
        <Label>Descripción</Label>
        <Textarea
          rows={2}
          value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
        />
      </div>
    </div>
  );
}

export function GruposManager({
  grupos,
  profesores,
}: {
  grupos: GrupoRow[];
  profesores: Profesor[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [createForm, setCreateForm] = useState<FormState>(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const profesorNombre = (id: string | null) => {
    if (!id) return "Sin asignar";
    const p = profesores.find((x) => x.id === id);
    return p ? `${p.nombre} ${p.apellido}` : "Sin asignar";
  };

  function parseDias(dias: string): string[] {
    return dias
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    if (!createForm.nombre.trim()) {
      setCreateError("El nombre es obligatorio.");
      return;
    }
    setCreating(true);
    const { error } = await supabase.from("grupos").insert({
      nombre: createForm.nombre.trim(),
      nivel: createForm.nivel,
      profesor_id: createForm.profesor_id || null,
      dias: parseDias(createForm.dias),
      horario: createForm.horario || null,
      lugar: createForm.lugar || null,
      punto_encuentro: createForm.punto_encuentro || null,
      descripcion: createForm.descripcion || null,
    });
    setCreating(false);
    if (error) {
      setCreateError("No pudimos crear el horario. Probá de nuevo.");
      return;
    }
    setCreateForm(EMPTY_FORM);
    router.refresh();
  }

  function startEdit(g: GrupoRow) {
    setEditingId(g.id);
    setEditForm(grupoToForm(g));
    setEditError(null);
  }

  async function handleSaveEdit(id: string) {
    setEditError(null);
    if (!editForm.nombre.trim()) {
      setEditError("El nombre es obligatorio.");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("grupos")
      .update({
        nombre: editForm.nombre.trim(),
        nivel: editForm.nivel,
        profesor_id: editForm.profesor_id || null,
        dias: parseDias(editForm.dias),
        horario: editForm.horario || null,
        lugar: editForm.lugar || null,
        punto_encuentro: editForm.punto_encuentro || null,
        descripcion: editForm.descripcion || null,
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
    if (!window.confirm("¿Eliminar este horario? Esta acción no se puede deshacer.")) return;
    await supabase.from("grupos").delete().eq("id", id);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h2 className="mb-4 font-display text-base font-bold text-ink-950">Nuevo horario</h2>
        {createError && <div className="mb-3"><FieldError>{createError}</FieldError></div>}
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <GrupoFormFields form={createForm} setForm={setCreateForm} profesores={profesores} />
          <div>
            <Button type="submit" disabled={creating}>
              <Plus size={16} />
              {creating ? "Creando..." : "Crear horario"}
            </Button>
          </div>
        </form>
      </Card>

      {grupos.length === 0 ? (
        <Card>
          <EmptyState icon={CalendarRange} title="Todavía no hay horarios creados" />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {grupos.map((g) => {
            const isEditing = editingId === g.id;
            return (
              <Card key={g.id} accent>
                {isEditing ? (
                  <div className="flex flex-col gap-4">
                    {editError && <FieldError>{editError}</FieldError>}
                    <GrupoFormFields
                      form={editForm}
                      setForm={setEditForm}
                      profesores={profesores}
                      includeEstado
                    />
                    <div className="flex gap-2">
                      <Button size="sm" type="button" disabled={saving} onClick={() => handleSaveEdit(g.id)}>
                        {saving ? "Guardando..." : "Guardar cambios"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={() => setEditingId(null)}
                      >
                        <X size={14} />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-display text-lg font-bold text-ink-950">{g.nombre}</p>
                        <p className="text-xs uppercase tracking-wide text-ink-700/50">{g.nivel}</p>
                      </div>
                      <StatusPill
                        status={g.estado === "activo" ? "aprobado" : "vencido"}
                        label={g.estado === "activo" ? "Activo" : "Inactivo"}
                      />
                    </div>
                    <div className="mt-3 space-y-1 text-sm text-ink-700/70">
                      <p>Profesor: {profesorNombre(g.profesor_id)}</p>
                      <p>{(g.dias ?? []).join(", ") || "Sin días definidos"} · {g.horario ?? "—"}</p>
                      <p>{g.lugar ?? "—"}</p>
                      {g.descripcion && <p className="text-ink-700/60">{g.descripcion}</p>}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={() => startEdit(g)}
                      >
                        <Pencil size={14} />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        onClick={() => handleDelete(g.id)}
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
