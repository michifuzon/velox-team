import Image from "next/image";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { STOCK_PHOTOS, unsplashUrl } from "./stock-photos";
import { RevealOnScroll } from "./RevealOnScroll";

// Static presentational cards — no DB behind these, purely editorial flavor.
const STORIES = [
  {
    title: "Primera carrera de Juan",
    caption: "Cruzó su primera meta en la 10K Nocturna, entre aplausos del grupo.",
    photo: STOCK_PHOTOS.relayTrackBW,
  },
  {
    title: "Nuevo récord personal de Sofía",
    caption: "Bajó tres minutos su marca en 10K después de un invierno de series.",
    photo: STOCK_PHOTOS.sprintStartBlocks,
  },
  {
    title: "Fondo del domingo",
    caption: "Veinte kilómetros por la Costanera, arrancando antes de que salga el sol.",
    photo: STOCK_PHOTOS.sunburstMountains,
  },
  {
    title: "Entrenamiento en la montaña",
    caption: "El grupo Performance suma altimetría un fin de semana al mes.",
    photo: STOCK_PHOTOS.mountainValley,
  },
];

export function TeamStories() {
  return (
    <section className="border-t border-ink-950/8 bg-mist-50 px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <RevealOnScroll>
          <SectionHeader
            eyebrow="Historias del equipo"
            title="Momentos que corremos juntos"
            description="Instantáneas de lo que pasa cada semana en las calles, pistas y montañas."
          />
        </RevealOnScroll>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STORIES.map((story, i) => (
            <RevealOnScroll key={story.title} delay={i * 90}>
              <article className="group overflow-hidden rounded-xl border border-mist-200 bg-white">
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                  <Image
                    src={unsplashUrl(story.photo, 500)}
                    alt={story.title}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg font-bold text-ink-950">
                    {story.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-ink-700/70">{story.caption}</p>
                </div>
              </article>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
