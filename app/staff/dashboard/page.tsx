import { Newspaper, FileEdit, Flag, Images, PlusCircle, Clock } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SummaryCard } from "@/components/ui/SummaryCard";
import { ButtonLink } from "@/components/ui/Button";
import { requireRole, STAFF_ROLES } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const QUICK_ACTIONS = [
  { label: "Nueva noticia", href: "/staff/noticias", icon: Newspaper },
  { label: "Nueva carrera", href: "/staff/carreras", icon: Flag },
  { label: "Subir fotos", href: "/staff/galeria", icon: Images },
  { label: "Editar horarios", href: "/staff/horarios", icon: Clock },
];

export default async function StaffDashboardPage() {
  const profile = await requireRole(...STAFF_ROLES);
  const supabase = await createClient();

  const [
    { count: noticiasPublicadas },
    { count: noticiasBorrador },
    { count: proximasCarreras },
    { count: fotosGaleria },
  ] = await Promise.all([
    supabase.from("noticias").select("id", { count: "exact", head: true }).eq("publicado", true),
    supabase.from("noticias").select("id", { count: "exact", head: true }).eq("publicado", false),
    supabase.from("carreras").select("id", { count: "exact", head: true }).eq("estado", "proxima"),
    supabase.from("galeria").select("id", { count: "exact", head: true }),
  ]);

  const INDICATORS = [
    { label: "Noticias publicadas", value: noticiasPublicadas ?? 0, icon: Newspaper },
    { label: "Noticias en borrador", value: noticiasBorrador ?? 0, icon: FileEdit },
    { label: "Próximas carreras", value: proximasCarreras ?? 0, icon: Flag },
    { label: "Fotos en galería", value: fotosGaleria ?? 0, icon: Images },
  ];

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        eyebrow="Panel de administración"
        title={`Hola, ${profile.nombre}`}
        description="Mantené actualizada la información pública de Velox Running Team."
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {INDICATORS.map(({ label, value, icon: Icon }) => (
          <SummaryCard key={label} label={label}>
            <div className="flex items-center justify-between">
              <p className="font-display text-2xl font-bold text-ink-950">{value}</p>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-950/5 text-ink-950">
                <Icon size={16} />
              </span>
            </div>
          </SummaryCard>
        ))}
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-bold text-ink-950">Accesos rápidos</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {QUICK_ACTIONS.map(({ label, href, icon: Icon }) => (
            <ButtonLink
              key={href}
              href={href}
              variant="outline"
              className="h-auto flex-col gap-2 rounded-2xl py-5"
            >
              <Icon size={20} />
              <span className="text-xs">{label}</span>
            </ButtonLink>
          ))}
          <ButtonLink
            href="/staff/configuracion"
            variant="outline"
            className="h-auto flex-col gap-2 rounded-2xl py-5"
          >
            <PlusCircle size={20} />
            <span className="text-xs">Configuración</span>
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
