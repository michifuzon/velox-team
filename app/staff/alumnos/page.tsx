import { requireRole, STAFF_ROLES } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { AlumnosTable, type AlumnoRow } from "@/components/staff/AlumnosTable";
import type { AptoEstado, CuotaEstado } from "@/types/database";

export default async function AlumnosPage() {
  await requireRole(...STAFF_ROLES);
  const supabase = await createClient();

  const mesActual = new Date().toISOString().slice(0, 7);

  const [
    { data: alumnos },
    { data: grupos },
    { data: inscripciones },
    { data: cuotas },
    { data: aptos },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, nombre, apellido, email, dni, foto_url, activo, perfil_completado_pct")
      .eq("role", "alumno")
      .order("apellido", { ascending: true }),
    supabase.from("grupos").select("id, nombre").order("nombre"),
    supabase
      .from("inscripciones_grupo")
      .select("alumno_id, grupo_id")
      .eq("activo", true),
    supabase.from("cuotas").select("alumno_id, estado").eq("mes", mesActual),
    supabase
      .from("aptos_medicos")
      .select("alumno_id, estado, created_at")
      .order("created_at", { ascending: false }),
  ]);

  const grupoNombreById = new Map((grupos ?? []).map((g) => [g.id, g.nombre]));
  const grupoIdByAlumno = new Map(
    (inscripciones ?? []).map((i) => [i.alumno_id, i.grupo_id])
  );
  const cuotaEstadoByAlumno = new Map(
    (cuotas ?? []).map((c) => [c.alumno_id, c.estado as CuotaEstado])
  );
  const aptoEstadoByAlumno = new Map<string, AptoEstado>();
  for (const a of aptos ?? []) {
    if (!aptoEstadoByAlumno.has(a.alumno_id)) {
      aptoEstadoByAlumno.set(a.alumno_id, a.estado as AptoEstado);
    }
  }

  const rows: AlumnoRow[] = (alumnos ?? []).map((a) => {
    const grupoId = grupoIdByAlumno.get(a.id) ?? null;
    return {
      id: a.id,
      nombre: a.nombre,
      apellido: a.apellido,
      email: a.email,
      dni: a.dni,
      fotoUrl: a.foto_url,
      activo: a.activo,
      perfilPct: a.perfil_completado_pct,
      grupoId,
      grupoNombre: grupoId ? grupoNombreById.get(grupoId) ?? null : null,
      cuotaEstado: cuotaEstadoByAlumno.get(a.id) ?? null,
      aptoEstado: aptoEstadoByAlumno.get(a.id) ?? null,
    };
  });

  const grupoOptions = (grupos ?? []).map((g) => ({ id: g.id, nombre: g.nombre }));

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Alumnos"
        description="Buscá y filtrá a los alumnos del equipo. Tocá una fila para ver su ficha completa."
      />
      <AlumnosTable rows={rows} grupos={grupoOptions} />
    </div>
  );
}
