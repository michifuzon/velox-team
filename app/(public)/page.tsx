import { createClient } from "@/lib/supabase/server";
import { Hero } from "@/components/landing/Hero";
import { NextSession } from "@/components/landing/NextSession";
import { NewsGrid } from "@/components/landing/NewsGrid";
import { UpcomingRaces } from "@/components/landing/UpcomingRaces";
import { TeamStories } from "@/components/landing/TeamStories";
import { Tips } from "@/components/landing/Tips";
import { Community, type TestimonioConNombre } from "@/components/landing/Community";
import { About, Services, Schedule, Team, Faq, Contact } from "@/components/landing/Institutional";
import type { NoticiaRow } from "@/types/database";

export default async function LandingPage() {
  const supabase = await createClient();

  const [{ data: grupos }, { data: carreras }, { data: noticias }, { data: testimonios }] =
    await Promise.all([
      supabase
        .from("grupos")
        .select("*")
        .eq("estado", "activo")
        .order("nombre", { ascending: true }),
      supabase
        .from("carreras")
        .select("*")
        .eq("estado", "proxima")
        .order("fecha", { ascending: true }),
      supabase
        .from("noticias")
        .select("*")
        .eq("publicado", true)
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("testimonios")
        .select("id, texto, alumno:profiles(nombre)")
        .eq("aprobado", true)
        .order("created_at", { ascending: false })
        .limit(6),
    ]);

  const gruposList = grupos ?? [];
  const carrerasList = carreras ?? [];
  const noticiasList = (noticias ?? []) as NoticiaRow[];
  // Embedded/nested selects don't type-infer against our hand-written Database
  // type — cast via unknown rather than directly, then flatten to a simple shape.
  const testimoniosList: TestimonioConNombre[] = (
    (testimonios ?? []) as unknown as Array<{
      id: string;
      texto: string;
      alumno: { nombre: string } | null;
    }>
  ).map((t) => ({ id: t.id, texto: t.texto, nombre: t.alumno?.nombre ?? "Alumno de Velox Running Team" }));
  const featuredGrupo = gruposList[0] ?? null;

  // Best-effort: profiles aren't publicly readable via RLS, so this quietly
  // resolves to null for anonymous visitors — NextSession handles that fine.
  // Public profile reads are intentionally blocked by RLS. Use the team's
  // public-facing coach name unless an authenticated lookup returns another one.
  let profesorNombre: string | null = "Andrés Navarro";
  if (featuredGrupo?.profesor_id) {
    const { data: profesor } = await supabase
      .from("profiles")
      .select("nombre, apellido")
      .eq("id", featuredGrupo.profesor_id)
      .single();
    if (profesor) profesorNombre = `${profesor.nombre} ${profesor.apellido}`;
  }

  return (
    <>
      <Hero />
      <NextSession grupo={featuredGrupo} profesorNombre={profesorNombre} />
      <NewsGrid noticias={noticiasList} />
      <UpcomingRaces carreras={carrerasList} />
      <TeamStories />
      <Tips />
      <Community testimonios={testimoniosList} />

      {/* Compact institutional tail — the magazine sections above are the priority. */}
      <About />
      <Services />
      <Schedule grupos={gruposList} />
      <Team />
      <Faq />
      <Contact />
    </>
  );
}
