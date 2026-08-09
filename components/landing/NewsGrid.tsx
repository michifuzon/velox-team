import Image from "next/image";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { RevealOnScroll } from "./RevealOnScroll";
import type { NoticiaRow } from "@/types/database";

function excerptOf(n: NoticiaRow) {
  if (n.bajada) return n.bajada;
  return n.contenido.length > 160 ? `${n.contenido.slice(0, 160)}…` : n.contenido;
}

function formatFecha(fecha: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(fecha));
}

export function NewsGrid({ noticias }: { noticias: NoticiaRow[] }) {
  return (
    <section id="novedades" className="border-t border-ink-950/8 px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <RevealOnScroll>
          <SectionHeader
            eyebrow="El blog del equipo"
            title="Últimas novedades"
            description="Historias, resultados y consejos del mundo Veloz Running Team."
          />
        </RevealOnScroll>

        {noticias.length === 0 ? (
          <RevealOnScroll className="mt-10">
            <EmptyState
              icon={Newspaper}
              title="Todavía no hay novedades publicadas"
              description="Muy pronto vas a encontrar acá las historias, resultados y consejos de Veloz Running Team."
            />
          </RevealOnScroll>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {noticias.map((noticia, index) => {
              const large = index === 0;
              return (
                <RevealOnScroll
                  key={noticia.id}
                  delay={(index % 3) * 80}
                  className={large ? "sm:col-span-2 lg:row-span-2" : ""}
                >
                  <Link
                    href={`/noticias/${noticia.id}`}
                    aria-label={`Leer noticia: ${noticia.titulo}`}
                    className={`group flex h-full flex-col overflow-hidden rounded-xl border border-mist-200 bg-white transition-shadow hover:shadow-lg ${
                      large && noticia.imagen_url ? "sm:flex-row lg:flex-col" : ""
                    }`}
                  >
                    {noticia.imagen_url && (
                      <div
                        className={`relative overflow-hidden ${
                          large
                            ? "aspect-[4/3] sm:w-1/2 lg:aspect-[16/9] lg:w-full"
                            : "aspect-[16/10] w-full"
                        }`}
                      >
                        <Image
                          src={noticia.imagen_url}
                          alt={`Imagen de ${noticia.titulo}`}
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className={`flex flex-1 flex-col ${noticia.imagen_url ? "p-6" : "p-7 sm:p-8"}`}>
                      <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-700">
                        {noticia.categoria}
                      </span>
                      <h3
                        className={`mt-2 font-display font-bold leading-snug text-ink-950 ${
                          large ? "text-2xl sm:text-3xl" : "text-lg"
                        }`}
                      >
                        {noticia.titulo}
                      </h3>
                      <p className="mt-3 flex-1 text-sm leading-6 text-ink-700/70">
                        {excerptOf(noticia)}
                      </p>
                      <p className="mt-5 text-xs text-ink-700/50">
                        {formatFecha(noticia.created_at)}
                      </p>
                      <span className="mt-4 text-sm font-semibold text-brand-700">Leer noticia →</span>
                    </div>
                  </Link>
                </RevealOnScroll>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
