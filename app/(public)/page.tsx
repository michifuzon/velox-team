import { createClient } from "@/lib/supabase/server";
import { Hero } from "@/components/landing/Hero";
import { NextSession } from "@/components/landing/NextSession";
import { NewsGrid } from "@/components/landing/NewsGrid";
import { UpcomingRaces } from "@/components/landing/UpcomingRaces";
import { Tips } from "@/components/landing/Tips";
import { Gallery } from "@/components/landing/Gallery";
import { About, Services, Schedule, Team, Faq, Contact } from "@/components/landing/Institutional";
import type { NoticiaRow, GaleriaRow, ServicioRow, ConsejoRow, FaqRow } from "@/types/database";

export default async function LandingPage() {
  const supabase = await createClient();

  const [
    { data: grupos },
    { data: carreras },
    { data: noticias },
    { data: galeria },
    { data: servicios },
    { data: consejos },
    { data: faqs },
  ] = await Promise.all([
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
      .from("galeria")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.from("servicios").select("*").order("orden", { ascending: true }),
    supabase.from("consejos").select("*").order("orden", { ascending: true }),
    supabase.from("faqs").select("*").order("orden", { ascending: true }),
  ]);

  const gruposList = grupos ?? [];
  const carrerasList = carreras ?? [];
  const noticiasList = (noticias ?? []) as NoticiaRow[];
  const galeriaList = (galeria ?? []) as GaleriaRow[];
  const serviciosList = (servicios ?? []) as ServicioRow[];
  const consejosList = (consejos ?? []) as ConsejoRow[];
  const faqsList = (faqs ?? []) as FaqRow[];
  const featuredGrupo = gruposList[0] ?? null;

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
      <Tips consejos={consejosList} />
      <Gallery fotos={galeriaList} />

      {/* Compact institutional tail — the magazine sections above are the priority. */}
      <About />
      <Services servicios={serviciosList} />
      <Schedule grupos={gruposList} />
      <Team />
      <Faq faqs={faqsList} />
      <Contact />
    </>
  );
}
