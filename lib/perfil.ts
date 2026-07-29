import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Recomputes profiles.perfil_completado_pct from a fixed checklist spanning
 * "Mis datos", "Ficha deportiva" and "Apto médico". Called client-side after
 * saving any of those sections (RLS lets alumnos read/update their own row).
 */
export async function recomputePerfilPct(
  supabase: SupabaseClient<Database>,
  alumnoId: string
): Promise<number> {
  const [{ data: profile }, { data: ficha }, { data: aptos }] = await Promise.all([
    supabase
      .from("profiles")
      .select("telefono, fecha_nacimiento, domicilio, contacto_emergencia_nombre, foto_url")
      .eq("id", alumnoId)
      .single(),
    supabase
      .from("fichas_deportivas")
      .select("objetivo_principal, nivel")
      .eq("alumno_id", alumnoId)
      .maybeSingle(),
    supabase.from("aptos_medicos").select("id").eq("alumno_id", alumnoId).limit(1),
  ]);

  const checks = [
    !!profile?.telefono,
    !!profile?.fecha_nacimiento,
    !!profile?.domicilio,
    !!profile?.contacto_emergencia_nombre,
    !!profile?.foto_url,
    !!ficha?.objetivo_principal,
    !!ficha?.nivel,
    !!(aptos && aptos.length > 0),
  ];
  const pct = Math.round((checks.filter(Boolean).length / checks.length) * 100);

  await supabase.from("profiles").update({ perfil_completado_pct: pct }).eq("id", alumnoId);
  return pct;
}
