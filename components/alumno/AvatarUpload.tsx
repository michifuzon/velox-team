"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/Avatar";
import { FieldHint } from "@/components/ui/Field";

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function AvatarUpload({
  userId,
  nombre,
  apellido,
  fotoUrl,
  onUploaded,
}: {
  userId: string;
  nombre: string;
  apellido: string;
  fotoUrl: string | null;
  onUploaded: (url: string) => void;
}) {
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(fotoUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
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
    const ext = file.name.split(".").pop();
    const path = `${userId}/avatar-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setError("No pudimos subir la foto. Probá de nuevo.");
      setUploading(false);
      return;
    }

    const { data: publicUrl } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase.from("profiles").update({ foto_url: publicUrl.publicUrl }).eq("id", userId);

    setPreview(publicUrl.publicUrl);
    onUploaded(publicUrl.publicUrl);
    setUploading(false);
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar nombre={nombre} apellido={apellido} fotoUrl={preview} size={72} />
      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded-lg bg-ink-950 px-4 py-2 text-sm font-semibold text-white hover:bg-ink-800 disabled:opacity-60"
        >
          {uploading ? "Subiendo..." : "Cambiar foto"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleChange}
        />
        <FieldHint>JPG, PNG o WebP. Máximo {MAX_SIZE_MB} MB.</FieldHint>
        {error && <p className="mt-1 text-xs font-medium text-status-overdue-fg">{error}</p>}
      </div>
    </div>
  );
}
