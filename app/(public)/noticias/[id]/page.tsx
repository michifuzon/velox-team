import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarDays, UserRound } from "lucide-react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { NoticiaRow, ProfileRow } from "@/types/database";

type PageProps = { params: Promise<{ id: string }> };

async function getNoticia(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("noticias")
    .select("*")
    .eq("id", id)
    .eq("publicado", true)
    .maybeSingle();
  return data as NoticiaRow | null;
}

function excerpt(text: string) {
  return text.replace(/\s+/g, " ").slice(0, 155);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const noticia = await getNoticia(id);
  if (!noticia) return { title: "Noticia no encontrada" };

  const description = noticia.bajada ?? excerpt(noticia.contenido);
  const image = noticia.imagen_url ?? "/velox-share.png";
  return {
    title: noticia.titulo,
    description,
    openGraph: {
      type: "article",
      title: noticia.titulo,
      description,
      images: [{ url: image }],
      publishedTime: noticia.created_at,
    },
    twitter: {
      card: "summary_large_image",
      title: noticia.titulo,
      description,
      images: [image],
    },
  };
}

export default async function NoticiaPage({ params }: PageProps) {
  const { id } = await params;
  const noticia = await getNoticia(id);
  if (!noticia) notFound();

  const supabase = await createClient();
  let autor: Pick<ProfileRow, "nombre" | "apellido"> | null = null;
  if (noticia.autor_id) {
    const { data } = await supabase
      .from("profiles")
      .select("nombre, apellido")
      .eq("id", noticia.autor_id)
      .maybeSingle();
    autor = data as Pick<ProfileRow, "nombre" | "apellido"> | null;
  }

  const paragraphs = noticia.contenido.split(/\n\s*\n/).filter(Boolean);
  const fecha = new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(noticia.created_at));

  return (
    <article className="px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/noticias"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a noticias
        </Link>

        <header className="mt-8 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
            {noticia.categoria}
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-ink-950 sm:text-6xl">
            {noticia.titulo}
          </h1>
          {noticia.bajada && (
            <p className="mt-5 text-lg leading-8 text-ink-700/75 sm:text-xl">{noticia.bajada}</p>
          )}
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-700/55">
            <span className="inline-flex items-center gap-2">
              <UserRound className="h-4 w-4" />
              {autor ? `${autor.nombre} ${autor.apellido}` : "Velox Running Team"}
            </span>
            <time className="inline-flex items-center gap-2" dateTime={noticia.created_at}>
              <CalendarDays className="h-4 w-4" />
              {fecha}
            </time>
          </div>
        </header>

        {noticia.imagen_url && (
          <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-2xl bg-mist-100">
            <Image
              src={noticia.imagen_url}
              alt={`Imagen principal de ${noticia.titulo}`}
              fill
              priority
              sizes="(min-width: 1024px) 896px, 100vw"
              className="object-cover"
            />
          </div>
        )}

        <div className="mx-auto mt-10 max-w-3xl space-y-6 text-base leading-8 text-ink-700 sm:text-lg">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="whitespace-pre-line">
              {paragraph}
            </p>
          ))}
        </div>

        {noticia.imagenes_adicionales?.length > 0 && (
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {noticia.imagenes_adicionales.map((url, index) => (
              <div
                key={`${url}-${index}`}
                className="relative aspect-[4/3] overflow-hidden rounded-xl bg-mist-100"
              >
                <Image
                  src={url}
                  alt={`Imagen adicional ${index + 1} de ${noticia.titulo}`}
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
