import { Clock, MapPin, Users, Zap } from "lucide-react";
import { DarkCard } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ButtonLink } from "@/components/ui/Button";
import { RevealOnScroll } from "./RevealOnScroll";
import type { GrupoRow } from "@/types/database";

export function NextSession({
  grupo,
  profesorNombre,
}: {
  grupo: GrupoRow | null;
  profesorNombre: string | null;
}) {
  if (!grupo) return null;

  const dias = grupo.dias.length > 0 ? grupo.dias.join(" · ") : "A confirmar";

  return (
    <section className="border-t border-ink-950/8 px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <RevealOnScroll>
          <SectionHeader
            eyebrow="En cancha esta semana"
            title="Próximo entrenamiento"
            description="Así se ve una sesión típica del equipo — sumate a entrenar con nosotros."
          />
        </RevealOnScroll>

        <RevealOnScroll delay={100} className="mt-8">
          <DarkCard className="grid gap-8 sm:grid-cols-[1.4fr_1fr] sm:p-10">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-brand-300">
                <Zap className="h-3.5 w-3.5" />
                Para cualquier capacidad
              </span>
              <h3 className="mt-4 font-display text-3xl font-bold sm:text-4xl">
                {grupo.nombre}
              </h3>
              {grupo.descripcion && (
                <p className="mt-3 max-w-md text-sm text-white/70">
                  {grupo.descripcion}
                </p>
              )}
              <ButtonLink href="/registro" variant="primary" size="md" className="mt-7">
                Sumarme a este grupo
              </ButtonLink>
            </div>

            <dl className="mt-10 flex flex-col justify-center gap-5 border-t border-white/10 pt-8 text-sm sm:mt-0 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
                <div>
                  <dt className="text-white/50">Días y horarios</dt>
                  <dd className="font-semibold">
                    {dias}
                    {grupo.horario ? ` · ${grupo.horario} hs` : ""}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
                <div>
                  <dt className="text-white/50">Lugar de encuentro</dt>
                  <dd className="font-semibold">
                    {grupo.lugar ?? "A confirmar"}
                    {grupo.punto_encuentro ? ` — ${grupo.punto_encuentro}` : ""}
                  </dd>
                </div>
              </div>
              {profesorNombre && (
                <div className="flex items-start gap-3">
                  <Users className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
                  <div>
                    <dt className="text-white/50">Entrenador</dt>
                    <dd className="font-semibold">{profesorNombre}</dd>
                  </div>
                </div>
              )}
            </dl>
          </DarkCard>
        </RevealOnScroll>
      </div>
    </section>
  );
}
