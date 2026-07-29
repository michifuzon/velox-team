import { requireRole, STAFF_ROLES } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { CalendarRange } from "lucide-react";
import type { GrupoRow } from "@/types/database";

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

function normalize(s: string) {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export default async function StaffHorariosPage() {
  await requireRole(...STAFF_ROLES);
  const supabase = await createClient();

  const [{ data: grupos }, { data: profesores }] = await Promise.all([
    supabase.from("grupos").select("*").eq("estado", "activo").order("nombre"),
    supabase.from("profiles").select("id, nombre, apellido"),
  ]);

  const profesorNombre = (id: string | null) => {
    if (!id) return "Sin asignar";
    const p = (profesores ?? []).find((x) => x.id === id);
    return p ? `${p.nombre} ${p.apellido}` : "Sin asignar";
  };

  const allGrupos = (grupos ?? []) as GrupoRow[];

  const grupoPorDia = new Map<string, GrupoRow[]>();
  for (const dia of DIAS) grupoPorDia.set(dia, []);
  const sinDia: GrupoRow[] = [];

  for (const g of allGrupos) {
    const dias = g.dias ?? [];
    if (dias.length === 0) {
      sinDia.push(g);
      continue;
    }
    for (const d of dias) {
      const match = DIAS.find((canon) => normalize(canon) === normalize(d));
      const key = match ?? d;
      if (!grupoPorDia.has(key)) grupoPorDia.set(key, []);
      grupoPorDia.get(key)!.push(g);
    }
  }

  const diasConGrupos = Array.from(grupoPorDia.entries()).filter(([, gs]) => gs.length > 0);
  const ordenados = [
    ...DIAS.map((d) => [d, grupoPorDia.get(d) ?? []] as [string, GrupoRow[]]).filter(
      ([, gs]) => gs.length > 0
    ),
    ...diasConGrupos.filter(([d]) => !DIAS.includes(d)),
  ];

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Horarios"
        description="Vista semanal de los grupos activos: qué grupos entrenan cada día, a qué hora y dónde."
      />

      {ordenados.length === 0 && sinDia.length === 0 ? (
        <Card>
          <EmptyState icon={CalendarRange} title="Todavía no hay grupos activos con horarios cargados" />
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {ordenados.map(([dia, gs]) => (
            <Card key={dia}>
              <h2 className="mb-3 font-display text-base font-bold text-ink-950">{dia}</h2>
              <div className="divide-y divide-mist-200">
                {gs.map((g) => (
                  <div key={g.id} className="py-3 text-sm">
                    <p className="font-semibold text-ink-950">{g.nombre}</p>
                    <p className="text-ink-700/60">
                      {g.horario ?? "Sin horario"} · {g.lugar ?? "Sin lugar"} · Prof.{" "}
                      {profesorNombre(g.profesor_id)}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          ))}

          {sinDia.length > 0 && (
            <Card>
              <h2 className="mb-3 font-display text-base font-bold text-ink-950">Sin días definidos</h2>
              <div className="divide-y divide-mist-200">
                {sinDia.map((g) => (
                  <div key={g.id} className="py-3 text-sm">
                    <p className="font-semibold text-ink-950">{g.nombre}</p>
                    <p className="text-ink-700/60">
                      {g.horario ?? "Sin horario"} · {g.lugar ?? "Sin lugar"}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
