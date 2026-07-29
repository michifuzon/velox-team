import { requireRole, STAFF_ROLES } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TestimoniosManager } from "@/components/staff/TestimoniosManager";
import type { TestimonioRow } from "@/types/database";

export default async function TestimoniosPage() {
  await requireRole(...STAFF_ROLES);
  const supabase = await createClient();

  const [{ data: testimonios }, { data: alumnos }] = await Promise.all([
    supabase.from("testimonios").select("*").order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, nombre, apellido").eq("role", "alumno").order("apellido"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Testimonios"
        description="Moderá las historias que los alumnos comparten para mostrar en la web."
      />
      <TestimoniosManager
        testimonios={(testimonios ?? []) as TestimonioRow[]}
        alumnos={alumnos ?? []}
      />
    </div>
  );
}
