"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Input, FieldHint } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/EmptyState";
import { Images } from "lucide-react";
import type { GaleriaRow } from "@/types/database";

const MAX_SIZE_MB = 8;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function randomPath(ext: string | undefined) {
  return `galeria/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
}

export function GaleriaManager({ fotos }: { fotos: GaleriaRow[] }) {
  const router = useRouter();
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const [titulo, setTitulo] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Formato no admitido. Usá JPG, PNG o WebP.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`El archivo supera el tamaño permitido (${MAX_SIZE_MB} MB).`);
      return;
    }

    setUploading(true);
    const path = randomPath(file.name.split(".").pop());

    const { error: uploadError } = await supabase.storage.from("media").upload(path, file);
    if (uploadError) {
      setError("No pudimos subir la foto. Probá de nuevo.");
      setUploading(false);
      return;
    }

    const { data: publicUrl } = supabase.storage.from("media").getPublicUrl(path);
    const { error: insertError } = await supabase.from("galeria").insert({
      imagen_url: publicUrl.publicUrl,
      titulo: titulo.trim() || null,
    });

    setUploading(false);
    if (insertError) {
      setError("Subimos la foto pero no pudimos guardarla en la galería.");
      return;
    }

    setTitulo("");
    if (inputRef.current) inputRef.current.value = "";
    router.refresh();
  }

  async function handleDelete(foto: GaleriaRow) {
    if (!window.confirm("¿Eliminar esta foto de la galería?")) return;
    setDeletingId(foto.id);
    await supabase.from("galeria").delete().eq("id", foto.id);
    setDeletingId(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h2 className="mb-4 font-display text-base font-bold text-ink-950">Subir foto</h2>
        {error && <p className="mb-3 text-xs font-medium text-status-overdue-fg">{error}</p>}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Input
              placeholder="Descripción (opcional)"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
          </div>
          <div>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="block text-sm text-ink-700/70 file:mr-4 file:rounded-lg file:border-0 file:bg-ink-950 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white hover:file:bg-ink-800"
              onChange={handleUpload}
              disabled={uploading}
            />
          </div>
        </div>
        <FieldHint>JPG, PNG o WebP. Máximo {MAX_SIZE_MB} MB. {uploading ? "Subiendo..." : ""}</FieldHint>
      </Card>

      {fotos.length === 0 ? (
        <Card>
          <EmptyState icon={Images} title="Todavía no hay fotos en la galería" />
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {fotos.map((foto) => (
            <div key={foto.id} className="group relative aspect-square overflow-hidden rounded-xl bg-mist-100">
              <Image
                src={foto.imagen_url}
                alt={foto.titulo ?? "Foto de Velox Running Team"}
                fill
                sizes="(min-width: 1024px) 25vw, 33vw"
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => handleDelete(foto)}
                disabled={deletingId === foto.id}
                aria-label="Eliminar foto"
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100 disabled:opacity-60"
              >
                <Trash2 size={14} />
              </button>
              {foto.titulo && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="truncate text-xs text-white">{foto.titulo}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
