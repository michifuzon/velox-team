import { Quote } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { RevealOnScroll } from "./RevealOnScroll";

export type TestimonioConNombre = {
  id: string;
  texto: string;
  nombre: string;
};

export function Community({ testimonios }: { testimonios: TestimonioConNombre[] }) {
  if (testimonios.length === 0) return null;

  return (
    <section className="border-t border-ink-950/8 bg-brand-800 px-4 py-16 text-white sm:px-6 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <RevealOnScroll>
          <SectionHeader
            eyebrow="Comunidad"
            title="Historias de nuestros alumnos"
            className="[&_h2]:text-white [&_p]:text-white/60"
          />
        </RevealOnScroll>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {testimonios.map((t, i) => (
            <RevealOnScroll key={t.id} delay={i * 90}>
              <figure className="flex h-full flex-col rounded-xl border border-white/10 bg-white/5 p-6">
                <Quote className="h-5 w-5 text-brand-300" />
                <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-white/85">
                  “{t.texto}”
                </blockquote>
                <figcaption className="mt-4 text-xs font-semibold uppercase tracking-[0.15em] text-white/50">
                  {t.nombre}
                </figcaption>
              </figure>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
