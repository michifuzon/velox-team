import { Activity, Apple, Footprints, TriangleAlert } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { RevealOnScroll } from "./RevealOnScroll";

// Static article-style teasers — no blog CMS behind these by design.
const TIPS = [
  {
    icon: Activity,
    title: "Cómo mejorar tu ritmo",
    teaser:
      "Trabajar la cadencia y sumar series cortas una vez por semana marca la diferencia en pocas semanas.",
  },
  {
    icon: Apple,
    title: "Qué comer antes de correr",
    teaser:
      "Carbohidratos de fácil digestión entre 60 y 90 minutos antes de la salida, sin experimentar el día de la carrera.",
  },
  {
    icon: Footprints,
    title: "Cómo elegir tus zapatillas",
    teaser:
      "La pisada, el terreno y los kilómetros semanales definen el modelo — no siempre el más caro es el correcto.",
  },
  {
    icon: TriangleAlert,
    title: "Errores comunes al empezar a correr",
    teaser:
      "Sumar volumen demasiado rápido es la causa número uno de lesiones en corredores nuevos.",
  },
];

export function Tips() {
  return (
    <section className="border-t border-ink-950/8 px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <RevealOnScroll>
          <SectionHeader eyebrow="Consejos" title="Para correr mejor" />
        </RevealOnScroll>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TIPS.map((tip, i) => (
            <RevealOnScroll key={tip.title} delay={i * 90}>
              <article className="h-full rounded-xl border border-mist-200 bg-white p-6 transition-shadow hover:shadow-lg">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                  <tip.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-ink-950">
                  {tip.title}
                </h3>
                <p className="mt-2 text-sm text-ink-700/70">{tip.teaser}</p>
              </article>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
