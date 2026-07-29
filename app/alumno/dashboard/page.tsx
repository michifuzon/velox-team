import {
  User,
  ClipboardList,
  HeartPulse,
  Wallet,
  LineChart,
  CalendarDays,
  Clock,
  Flag,
} from "lucide-react";
import { SummaryCard } from "@/components/ui/SummaryCard";
import { RadialProgress } from "@/components/ui/RadialProgress";
import { AccessList, AccessRow } from "@/components/ui/QuickAccessCard";
import type { PillStatus } from "@/components/ui/StatusPill";
import { TestimonioForm } from "@/components/alumno/TestimonioForm";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { AptoMedicoRow, CuotaRow, FichaDeportivaRow, GrupoRow, TestimonioRow } from "@/types/database";

export default async function AlumnoDashboardPage() {
  const profile = await requireRole("alumno");
  const supabase = await createClient();

  const mesActual = new Date().toISOString().slice(0, 7);

  const [{ data: inscripcion }, { data: cuota }, { data: apto }, { data: ficha }, { data: testimonio }] =
    await Promise.all([
      supabase
        .from("inscripciones_grupo")
        .select("grupo:grupos(id, nombre, horario, dias, lugar, profesor_id)")
        .eq("alumno_id", profile.id)
        .eq("activo", true)
        .maybeSingle(),
      supabase
        .from("cuotas")
        .select("*")
        .eq("alumno_id", profile.id)
        .eq("mes", mesActual)
        .maybeSingle(),
      supabase
        .from("aptos_medicos")
        .select("*")
        .eq("alumno_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("fichas_deportivas")
        .select("objetivo_principal")
        .eq("alumno_id", profile.id)
        .maybeSingle(),
      supabase
        .from("testimonios")
        .select("*")
        .eq("alumno_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  const grupo =
    ((inscripcion as unknown as { grupo: GrupoRow | null } | null)?.grupo) ?? null;
  const cuotaActual = cuota as unknown as CuotaRow | null;
  const aptoActual = apto as unknown as AptoMedicoRow | null;
  const fichaActual = ficha as Pick<FichaDeportivaRow, "objetivo_principal"> | null;
  const testimonioActual = testimonio as TestimonioRow | null;

  const perfilPct = profile.perfil_completado_pct;
  const hoy = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const misDatosStatus: PillStatus = profile.foto_url ? "completado" : "pendiente";
  const fichaStatus: PillStatus = fichaActual?.objetivo_principal ? "completado" : "pendiente";
  const aptoStatus: PillStatus = aptoActual
    ? aptoActual.estado === "aprobado"
      ? "aprobado"
      : aptoActual.estado === "vencido"
        ? "vencido"
        : aptoActual.estado === "rechazado"
          ? "rechazado"
          : "en_revision"
    : "pendiente";
  const cuotaStatus: PillStatus = cuotaActual
    ? cuotaActual.estado === "pagada" || cuotaActual.estado === "bonificada"
      ? "al_dia"
      : cuotaActual.estado === "vencida"
        ? "vencido"
        : "pendiente"
    : "pendiente";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-700">
            Hola, {profile.nombre}
          </p>
          <h1 className="font-display text-2xl font-bold text-ink-950 sm:text-3xl">
            Tu portal de entrenamiento
          </h1>
        </div>
        <p className="text-sm capitalize text-ink-700/50">{hoy}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard label="Perfil completado">
          <div className="flex items-center gap-4">
            <RadialProgress value={perfilPct} />
            <p className="text-sm text-ink-700/60">
              Completá tus datos y ficha deportiva para llegar al 100%.
            </p>
          </div>
        </SummaryCard>

        <SummaryCard label="Grupo">
          {grupo ? (
            <>
              <p className="font-display text-lg font-bold text-ink-950">{grupo.nombre}</p>
              <p className="text-sm text-ink-700/60">
                {grupo.dias?.join(", ")} · {grupo.horario ?? "—"}
              </p>
              <p className="text-sm text-ink-700/60">{grupo.lugar ?? ""}</p>
            </>
          ) : (
            <p className="text-sm text-ink-700/60">Sin grupo asignado.</p>
          )}
        </SummaryCard>

        <SummaryCard label="Cuota actual">
          {cuotaActual ? (
            <>
              <p className="font-display text-lg font-bold text-ink-950">
                ${cuotaActual.monto.toLocaleString("es-AR")}
              </p>
              <p className="text-sm text-ink-700/60">
                Vencimiento: {cuotaActual.fecha_vencimiento ?? "—"}
              </p>
            </>
          ) : (
            <p className="text-sm text-ink-700/60">Sin cuotas cargadas.</p>
          )}
        </SummaryCard>
      </div>

      <div>
        <h2 className="mb-3 font-display text-base font-bold text-ink-950">
          Accesos rápidos
        </h2>
        <AccessList>
          <AccessRow
            icon={User}
            title="Mis datos"
            description="Completá tu teléfono, nacimiento y contacto de emergencia."
            status={misDatosStatus}
            href="/alumno/mis-datos"
          />
          <AccessRow
            icon={ClipboardList}
            title="Ficha deportiva"
            description="Completá la ficha inicial para mantener tu perfil al día."
            status={fichaStatus}
            href="/alumno/ficha"
          />
          <AccessRow
            icon={HeartPulse}
            title="Apto médico"
            description="Subí o actualizá tu apto médico vigente."
            status={aptoStatus}
            href="/alumno/apto-medico"
          />
          <AccessRow
            icon={Wallet}
            title="Cuota actual"
            description="Consultá el monto, vencimiento e historial de pagos."
            status={cuotaStatus}
            href="/alumno/cuota"
          />
          <AccessRow
            icon={CalendarDays}
            title="Plan de entrenamiento"
            description="Consultá tu entrenamiento diario o semanal."
            status="al_dia"
            href="/alumno/plan"
          />
          <AccessRow
            icon={Clock}
            title="Horarios"
            description="Días, horario, lugar y profesor de tu grupo."
            status="completado"
            href="/alumno/horarios"
          />
          <AccessRow
            icon={LineChart}
            title="Evaluaciones y tests"
            description="Mirá tus resultados y tu evolución deportiva."
            status="al_dia"
            href="/alumno/evaluaciones"
          />
          <AccessRow
            icon={Flag}
            title="Carreras"
            description="Próximas competencias del equipo."
            status="completado"
            href="/alumno/carreras"
          />
        </AccessList>
      </div>

      <div>
        <h2 className="mb-3 font-display text-base font-bold text-ink-950">
          Comunidad
        </h2>
        <TestimonioForm alumnoId={profile.id} ultimo={testimonioActual} />
      </div>
    </div>
  );
}
