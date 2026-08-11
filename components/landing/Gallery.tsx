import Image from "next/image";
import Link from "next/link";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ButtonLink } from "@/components/ui/Button";
import { RevealOnScroll } from "./RevealOnScroll";
import type { GaleriaRow } from "@/types/database";

export function Gallery({ fotos }: { fotos: GaleriaRow[] }) {
  if (fotos.length === 0) return null;

  return (
    <section id="galeria" className="scroll-mt-24 border-t border-ink-950/8 bg-mist-50 px-4 py-16 sm:scroll-mt-28 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <RevealOnScroll>
          <SectionHeader eyebrow="Momentos del equipo" title="Galería" />
        </RevealOnScroll>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {fotos.slice(0, 8).map((foto, i) => (
            <RevealOnScroll
              key={foto.id}
              delay={i * 60}
              className={i === 0 ? "col-span-2 row-span-2" : ""}
            >
              <Link
                href="/galeria"
                className="relative block aspect-square w-full overflow-hidden rounded-xl bg-mist-200"
              >
                <Image
                  src={foto.imagen_url}
                  alt={foto.titulo ?? "Foto de Velox Running Team"}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </Link>
            </RevealOnScroll>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <ButtonLink href="/galeria" variant="outline" size="md">
            Ver toda la galería
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
