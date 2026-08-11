import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Newspaper } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import type { NoticiaRow } from "@/types/database";

export const metadata: Metadata = {
  title: "Noticias",
  description: "Novedades, resultados y comunicados de Velox Running Team.",
};

export default async function NoticiasIndexPage() {
  const supabase = await createClient();
  const { data: noticias } = await supabase
    .from("noticias")
    .select("*")
    .eq("publicado", true)
    .order("created_at", { ascending: false });

  const noticiasList = (noticias ?? []) as NoticiaRow[];

  return (
    <div className="px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-7xl">
        <SectionHeader eyebrow="Novedades" title="Noticias" />

        {noticiasList.length === 0 ? (
          <div className="mt-10">
            <EmptyState icon={Newspaper} title="Todavía no hay noticias publicadas" />
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {noticiasList.map((n) => (
              <Link
                key={n.id}
                href={`/noticias/${n.id}`}
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-mist-200 bg-white transition-shadow hover:shadow-lg"
              >
                {n.imagen_url ? (
                  <div className="relative aspect-[16/10] w-full overflow-hidden">
                    <Image
                      src={n.imagen_url}
                      alt={n.titulo}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="h-1.5 w-full bg-brand-600" />
                )}
                <div className={`flex flex-1 flex-col ${n.imagen_url ? "p-5" : "p-6"}`}>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-700">
                    {n.categoria}
                  </p>
                  <h2 className="mt-2 font-display text-lg font-bold text-ink-950">{n.titulo}</h2>
                  {n.bajada && <p className="mt-1.5 line-clamp-2 text-sm text-ink-700/70">{n.bajada}</p>}
                  <p className="mt-3 flex flex-1 items-end gap-1.5 text-xs text-ink-700/50">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {new Date(n.created_at).toLocaleDateString("es-AR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
