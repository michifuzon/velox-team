import Image from "next/image";
import { Calendar, MapPin, Ruler } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ButtonLink } from "@/components/ui/Button";
import { STOCK_PHOTOS, unsplashUrl } from "./stock-photos";
import { RevealOnScroll } from "./RevealOnScroll";
import type { CarreraRow } from "@/types/database";

// Fallback photography for races without an imagen_url yet — cycled by index.
const FALLBACK_PHOTOS = [STOCK_PHOTOS.aerialTrackSprint, STOCK_PHOTOS.sprintStartBlocks];

function formatFecha(fecha: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${fecha}T00:00:00`));
}

export function UpcomingRaces({ carreras }: { carreras: CarreraRow[] }) {
  if (carreras.length === 0) return null;

  return (
    <section id="carreras" className="border-t border-ink-950/8 px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <RevealOnScroll>
          <SectionHeader
            eyebrow="Calendario"
            title="Próximas carreras"
            description="Eventos donde el equipo corre junto — anotate y sumate a la delegación Veloz."
          />
        </RevealOnScroll>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {carreras.map((carrera, i) => (
            <RevealOnScroll key={carrera.id} delay={i * 100}>
              <article className="group overflow-hidden rounded-xl border border-mist-200 bg-white transition-shadow hover:shadow-lg">
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <Image
                    src={
                      carrera.imagen_url ??
                      unsplashUrl(FALLBACK_PHOTOS[i % FALLBACK_PHOTOS.length], 900)
                    }
                    alt={carrera.nombre}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />
                  {carrera.distancia && (
                    <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-ink-950">
                      {carrera.distancia}
                    </span>
                  )}
                  <h3 className="absolute inset-x-0 bottom-0 p-6 font-display text-2xl font-bold text-white">
                    {carrera.nombre}
                  </h3>
                </div>
                <div className="flex flex-col gap-3 p-6">
                  <div className="flex items-center gap-2 text-sm text-ink-700/80">
                    <Calendar className="h-4 w-4 shrink-0 text-brand-600" />
                    <span className="capitalize">{formatFecha(carrera.fecha)}</span>
                    {carrera.horario && <span>· {carrera.horario} hs</span>}
                  </div>
                  {carrera.lugar && (
                    <div className="flex items-center gap-2 text-sm text-ink-700/80">
                      <MapPin className="h-4 w-4 shrink-0 text-brand-600" />
                      {carrera.lugar}
                    </div>
                  )}
                  {carrera.distancia && (
                    <div className="flex items-center gap-2 text-sm text-ink-700/80">
                      <Ruler className="h-4 w-4 shrink-0 text-brand-600" />
                      {carrera.distancia}
                    </div>
                  )}
                  {carrera.descripcion && (
                    <p className="mt-1 text-sm text-ink-700/70">{carrera.descripcion}</p>
                  )}
                  <ButtonLink href="/registro" variant="outline" size="sm" className="mt-2 self-start">
                    Quiero correrla con el equipo
                  </ButtonLink>
                </div>
              </article>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
