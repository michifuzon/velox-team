"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X, Newspaper, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Input, Select, Textarea, FieldError, FieldHint } from "@/components/ui/Field";
import { StatusPill } from "@/components/ui/StatusPill";
import { EmptyState } from "@/components/ui/EmptyState";
import type { NoticiaRow } from "@/types/database";

const MAX_IMAGE_MB = 8;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

async function uploadImage(file: File): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const path = `noticias/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return data.publicUrl;
}

export const CATEGORIAS_NOTICIA = [
  "Novedades del equipo",
  "Entrenamientos",
  "Carreras",
  "Resultados",
  "Historias del equipo",
  "Nutrición",
  "Técnica",
  "Trail Running",
  "Running Urbano",
  "Consejos",
  "Eventos",
] as const;

type FormState = {
  titulo: string;
  bajada: string;
  contenido: string;
  imagen_url: string;
  imagenes_adicionales: string;
  categoria: string;
  publicado: boolean;
};

const EMPTY_FORM: FormState = {
  titulo: "",
  bajada: "",
  contenido: "",
  imagen_url: "",
  imagenes_adicionales: "",
  categoria: CATEGORIAS_NOTICIA[0],
  publicado: false,
};

function noticiaToForm(n: NoticiaRow): FormState {
  return {
    titulo: n.titulo,
    bajada: n.bajada ?? "",
    contenido: n.contenido,
    imagen_url: n.imagen_url ?? "",
    imagenes_adicionales: (n.imagenes_adicionales ?? []).join("\n"),
    categoria: n.categoria,
    publicado: n.publicado,
  };
}

function NoticiaFormFields({
  form,
  setForm,
  onImageUploaded,
  uploadingImage,
  imageError,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
  onImageUploaded: (file: File) => void;
  uploadingImage: boolean;
  imageError: string | null;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label required>Título</Label>
        <Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
      </div>
      <div>
        <Label>Bajada</Label>
        <Input
          placeholder="Copete corto que resume la noticia"
          value={form.bajada}
          onChange={(e) => setForm({ ...form, bajada: e.target.value })}
        />
      </div>
      <div>
        <Label required>Contenido</Label>
        <Textarea
          rows={8}
          value={form.contenido}
          onChange={(e) => setForm({ ...form, contenido: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label>Imagen principal</Label>
          {form.imagen_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.imagen_url} alt="" className="mb-2 h-24 w-full rounded-lg object-cover" />
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={uploadingImage}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImageUploaded(file);
            }}
            className="block w-full text-sm text-ink-700/70 file:mr-4 file:rounded-lg file:border-0 file:bg-ink-950 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white hover:file:bg-ink-800"
          />
          <FieldHint>{uploadingImage ? "Subiendo..." : "JPG, PNG o WebP."}</FieldHint>
          {imageError && <FieldError>{imageError}</FieldError>}
        </div>
        <div>
          <Label required>Categoría</Label>
          <Select
            value={form.categoria}
            onChange={(e) => setForm({ ...form, categoria: e.target.value })}
          >
            {CATEGORIAS_NOTICIA.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div>
        <Label>Imágenes adicionales (opcionales)</Label>
        <Textarea
          rows={3}
          placeholder={"Una URL por línea\nhttps://..."}
          value={form.imagenes_adicionales}
          onChange={(e) => setForm({ ...form, imagenes_adicionales: e.target.value })}
        />
        <p className="mt-1.5 text-xs text-ink-700/50">
          Se mostrarán como galería al final de la noticia.
        </p>
      </div>
      <label className="flex items-center gap-2.5 text-sm text-ink-700/70">
        <input
          type="checkbox"
          checked={form.publicado}
          onChange={(e) => setForm({ ...form, publicado: e.target.checked })}
          className="h-4 w-4 rounded border-mist-300 text-brand-600 focus:ring-brand-600"
        />
        Publicada (visible en la web)
      </label>
    </div>
  );
}

export function NoticiasManager({
  staffId,
  noticias,
}: {
  staffId: string;
  noticias: NoticiaRow[];
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

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [uploadingCreateImage, setUploadingCreateImage] = useState(false);
  const [createImageError, setCreateImageError] = useState<string | null>(null);
  const [uploadingEditImage, setUploadingEditImage] = useState(false);
  const [editImageError, setEditImageError] = useState<string | null>(null);

  async function handleImageUpload(file: File, target: "create" | "edit") {
    const setUploading = target === "create" ? setUploadingCreateImage : setUploadingEditImage;
    const setImageError = target === "create" ? setCreateImageError : setEditImageError;
    const setForm = target === "create" ? setCreateForm : setEditForm;
    const currentForm = target === "create" ? createForm : editForm;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError("Formato no admitido. Usá JPG, PNG o WebP.");
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setImageError(`El archivo supera el tamaño permitido (${MAX_IMAGE_MB} MB).`);
      return;
    }

    setImageError(null);
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setForm({ ...currentForm, imagen_url: url });
    } catch {
      setImageError("No pudimos subir la imagen. Probá de nuevo.");
    }
    setUploading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    if (!createForm.titulo.trim() || !createForm.contenido.trim()) {
      setCreateError("El título y el contenido son obligatorios.");
      return;
    }
    setCreating(true);
    const { error } = await supabase.from("noticias").insert({
      titulo: createForm.titulo.trim(),
      bajada: createForm.bajada.trim() || null,
      contenido: createForm.contenido.trim(),
      imagen_url: createForm.imagen_url.trim() || null,
      imagenes_adicionales: createForm.imagenes_adicionales
        .split("\n")
        .map((url) => url.trim())
        .filter(Boolean),
      categoria: createForm.categoria,
      publicado: createForm.publicado,
      autor_id: staffId,
    });
    setCreating(false);
    if (error) {
      setCreateError("No pudimos crear la noticia. Probá de nuevo.");
      return;
    }
    setCreateForm(EMPTY_FORM);
    router.refresh();
  }

  function startEdit(n: NoticiaRow) {
    setEditingId(n.id);
    setEditForm(noticiaToForm(n));
    setEditError(null);
  }

  async function handleSaveEdit(id: string) {
    setEditError(null);
    if (!editForm.titulo.trim() || !editForm.contenido.trim()) {
      setEditError("El título y el contenido son obligatorios.");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("noticias")
      .update({
        titulo: editForm.titulo.trim(),
        bajada: editForm.bajada.trim() || null,
        contenido: editForm.contenido.trim(),
        imagen_url: editForm.imagen_url.trim() || null,
        imagenes_adicionales: editForm.imagenes_adicionales
          .split("\n")
          .map((url) => url.trim())
          .filter(Boolean),
        categoria: editForm.categoria,
        publicado: editForm.publicado,
        updated_at: new Date().toISOString(),
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

  async function handleTogglePublicado(n: NoticiaRow) {
    setTogglingId(n.id);
    await supabase
      .from("noticias")
      .update({ publicado: !n.publicado, updated_at: new Date().toISOString() })
      .eq("id", n.id);
    setTogglingId(null);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!window.confirm("¿Eliminar esta noticia? Esta acción no se puede deshacer.")) return;
    setDeletingId(id);
    await supabase.from("noticias").delete().eq("id", id);
    setDeletingId(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h2 className="mb-4 font-display text-base font-bold text-ink-950">Nueva noticia</h2>
        {createError && <div className="mb-3"><FieldError>{createError}</FieldError></div>}
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <NoticiaFormFields
            form={createForm}
            setForm={setCreateForm}
            onImageUploaded={(file) => handleImageUpload(file, "create")}
            uploadingImage={uploadingCreateImage}
            imageError={createImageError}
          />
          <div>
            <Button type="submit" disabled={creating}>
              <Plus size={16} />
              {creating ? "Guardando..." : "Guardar noticia"}
            </Button>
          </div>
        </form>
      </Card>

      {noticias.length === 0 ? (
        <Card>
          <EmptyState icon={Newspaper} title="Todavía no se cargaron noticias" />
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {noticias.map((n) => {
            const isEditing = editingId === n.id;
            return (
              <Card key={n.id} accent={n.publicado}>
                {isEditing ? (
                  <div className="flex flex-col gap-4">
                    {editError && <FieldError>{editError}</FieldError>}
                    <NoticiaFormFields
                      form={editForm}
                      setForm={setEditForm}
                      onImageUploaded={(file) => handleImageUpload(file, "edit")}
                      uploadingImage={uploadingEditImage}
                      imageError={editImageError}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" type="button" disabled={saving} onClick={() => handleSaveEdit(n.id)}>
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
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-display text-lg font-bold text-ink-950">{n.titulo}</p>
                        {n.bajada && <p className="mt-1 text-sm text-ink-700/70">{n.bajada}</p>}
                      </div>
                      <StatusPill
                        status={n.publicado ? "aprobado" : "pendiente"}
                        label={n.publicado ? "Publicada" : "Borrador"}
                      />
                    </div>
                    <p className="mt-3 text-xs text-ink-700/50">
                      {n.categoria} · {new Date(n.created_at).toLocaleDateString("es-AR")}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" type="button" onClick={() => startEdit(n)}>
                        <Pencil size={14} />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        disabled={togglingId === n.id}
                        onClick={() => handleTogglePublicado(n)}
                      >
                        {n.publicado ? <EyeOff size={14} /> : <Eye size={14} />}
                        {n.publicado ? "Pasar a borrador" : "Publicar"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        disabled={deletingId === n.id}
                        onClick={() => handleDelete(n.id)}
                        className="text-status-overdue-fg hover:bg-status-overdue-bg"
                      >
                        <Trash2 size={14} />
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
