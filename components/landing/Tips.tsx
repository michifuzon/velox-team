import { Activity, Apple, Footprints, TriangleAlert } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { RevealOnScroll } from "./RevealOnScroll";
import type { ConsejoRow } from "@/types/database";

const TIP_ICONS = [Activity, Apple, Footprints, TriangleAlert];

export function Tips({ consejos }: { consejos: ConsejoRow[] }) {
  if (consejos.length === 0) return null;

  return (
    <section className="border-t border-ink-950/8 px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <RevealOnScroll>
          <SectionHeader eyebrow="Consejos" title="Para correr mejor" />
        </RevealOnScroll>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {consejos.map((tip, i) => {
            const Icon = TIP_ICONS[i % TIP_ICONS.length];
            return (
              <RevealOnScroll key={tip.id} delay={i * 90}>
                <article className="h-full rounded-xl border border-mist-200 bg-white p-6 transition-shadow hover:shadow-lg">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold text-ink-950">
                    {tip.titulo}
                  </h3>
                  <p className="mt-2 text-sm text-ink-700/70">{tip.texto}</p>
                </article>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}
