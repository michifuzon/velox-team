import { requireRole, STAFF_ROLES } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ContenidoManager } from "@/components/staff/ContenidoManager";
import type { ServicioRow, ConsejoRow, FaqRow } from "@/types/database";

export default async function StaffContenidoPage() {
  await requireRole(...STAFF_ROLES);
  const supabase = await createClient();

  const [{ data: servicios }, { data: consejos }, { data: faqs }] = await Promise.all([
    supabase.from("servicios").select("*").order("orden", { ascending: true }),
    supabase.from("consejos").select("*").order("orden", { ascending: true }),
    supabase.from("faqs").select("*").order("orden", { ascending: true }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Contenido"
        description="Servicios, consejos y preguntas frecuentes que se muestran en la web."
      />
      <ContenidoManager
        servicios={(servicios ?? []) as ServicioRow[]}
        consejos={(consejos ?? []) as ConsejoRow[]}
        faqs={(faqs ?? []) as FaqRow[]}
      />
    </div>
  );
}
