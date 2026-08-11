import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { STOCK_PHOTOS, unsplashUrl } from "./stock-photos";

export function Hero() {
  return (
    <section className="relative flex h-[88vh] min-h-[560px] w-full items-end overflow-hidden">
      <Image
        src={unsplashUrl(STOCK_PHOTOS.heroRunners, 1920)}
        alt="Grupo de corredores del equipo entrenando al atardecer"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {/* Editorial gradient — legibility for the headline, not a decoration */}
      <div className="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-900/50 to-brand-900/10" />

      <div className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-32 sm:px-6 sm:pb-24">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-brand-300">
          Velox Running Team
        </p>
        <h1 className="max-w-3xl font-display text-5xl font-bold leading-[1.05] text-white sm:text-6xl lg:text-7xl">
          Entrená con un equipo. Superá tus propios límites.
        </h1>
        <p className="mt-6 max-w-xl text-base text-white/80 sm:text-lg">
          Grupos de entrenamiento, planes personalizados y un profesor que te
          acompaña en cada kilómetro — desde tu primera salida hasta tu
          próxima meta.
        </p>
        <div className="mt-9 flex flex-wrap gap-4">
          <ButtonLink href="#contacto" size="lg">
            Quiero unirme
          </ButtonLink>
          <ButtonLink
            href="#novedades"
            variant="outline"
            size="lg"
            className="border-white/30 bg-white/5 text-white backdrop-blur hover:border-white hover:bg-white/10 hover:text-white"
          >
            Ver novedades
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
