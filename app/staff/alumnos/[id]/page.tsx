import { notFound } from "next/navigation";
import { requireRole, STAFF_ROLES } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { AlumnoDetail } from "@/components/staff/AlumnoDetail";
import type {
  ProfileRow,
  FichaDeportivaRow,
  CuotaRow,
  AptoMedicoRow,
  EvaluacionRow,
  ObservacionPrivadaRow,
  GrupoRow,
} from "@/types/database";

type Props = { params: Promise<{ id: string }> };

export default async function AlumnoDetailPage({ params }: Props) {
  const staff = await requireRole(...STAFF_ROLES);
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: alumno },
    { data: ficha },
    { data: inscripcion },
    { data: cuotas },
    { data: aptos },
    { data: evaluaciones },
    { data: observaciones },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).eq("role", "alumno").maybeSingle(),
    supabase.from("fichas_deportivas").select("*").eq("alumno_id", id).maybeSingle(),
    supabase
      .from("inscripciones_grupo")
      .select("grupo:grupos(id, nombre, nivel, dias, horario, lugar, punto_encuentro)")
      .eq("alumno_id", id)
      .eq("activo", true)
      .maybeSingle(),
    supabase.from("cuotas").select("*").eq("alumno_id", id).order("mes", { ascending: false }),
    supabase
      .from("aptos_medicos")
      .select("*")
      .eq("alumno_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("evaluaciones")
      .select("*")
      .eq("alumno_id", id)
      .order("fecha", { ascending: false }),
    supabase
      .from("observaciones_privadas")
      .select("*")
      .eq("alumno_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!alumno) notFound();

  const profesorIds = Array.from(
    new Set((observaciones ?? []).map((o) => o.profesor_id).filter((v): v is string => !!v))
  );
  const { data: autores } =
    profesorIds.length > 0
      ? await supabase.from("profiles").select("id, nombre, apellido").in("id", profesorIds)
      : { data: [] as { id: string; nombre: string; apellido: string }[] };
  const autorNombreById = new Map((autores ?? []).map((p) => [p.id, `${p.nombre} ${p.apellido}`]));

  const grupoActual =
    (inscripcion as unknown as { grupo: GrupoRow | null } | null)?.grupo ?? null;

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title={`${alumno.nombre} ${alumno.apellido}`}
        description={alumno.email}
      />
      <AlumnoDetail
        staffId={staff.id}
        alumno={alumno as ProfileRow}
        ficha={ficha as FichaDeportivaRow | null}
        grupoActual={grupoActual}
        cuotas={(cuotas ?? []) as CuotaRow[]}
        aptos={(aptos ?? []) as AptoMedicoRow[]}
        evaluaciones={(evaluaciones ?? []) as EvaluacionRow[]}
        observaciones={((observaciones ?? []) as ObservacionPrivadaRow[]).map((o) => ({
          ...o,
          profesorNombre: o.profesor_id ? autorNombreById.get(o.profesor_id) ?? null : null,
        }))}
      />
    </div>
  );
}
