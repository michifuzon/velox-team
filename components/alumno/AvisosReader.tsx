"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/** Fire-and-forget: marks the given avisos as read for this alumno on mount. */
export function AvisosReader({ alumnoId, avisoIds }: { alumnoId: string; avisoIds: string[] }) {
  useEffect(() => {
    if (avisoIds.length === 0) return;
    const supabase = createClient();
    supabase
      .from("avisos_lecturas")
      .upsert(
        avisoIds.map((aviso_id) => ({ aviso_id, alumno_id: alumnoId, leido_at: new Date().toISOString() })),
        { onConflict: "aviso_id,alumno_id" }
      )
      .then(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
