import { requireRole, STAFF_ROLES } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { NoticiasManager } from "@/components/staff/NoticiasManager";
import type { NoticiaRow } from "@/types/database";

export default async function NoticiasPage() {
  const profile = await requireRole(...STAFF_ROLES);
  const supabase = await createClient();

  const { data: noticias } = await supabase
    .from("noticias")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Noticias"
        description="Publicá historias, resultados y novedades del equipo en la web."
      />
      <NoticiasManager staffId={profile.id} noticias={(noticias ?? []) as NoticiaRow[]} />
    </div>
  );
}
