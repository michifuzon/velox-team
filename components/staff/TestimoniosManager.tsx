"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Trash2, Quote } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import { EmptyState } from "@/components/ui/EmptyState";
import type { TestimonioRow } from "@/types/database";

type Alumno = { id: string; nombre: string; apellido: string };

type Filtro = "todos" | "pendientes" | "aprobados";

export function TestimoniosManager({
  testimonios,
  alumnos,
}: {
  testimonios: TestimonioRow[];
  alumnos: Alumno[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [filtro, setFiltro] = useState<Filtro>("pendientes");
  const [workingId, setWorkingId] = useState<string | null>(null);

  const alumnoNombre = (id: string) => {
    const a = alumnos.find((x) => x.id === id);
    return a ? `${a.nombre} ${a.apellido}` : "Alumno";
  };

  const visibles = testimonios.filter((t) => {
    if (filtro === "pendientes") return !t.aprobado;
    if (filtro === "aprobados") return t.aprobado;
    return true;
  });

  async function handleAprobar(id: string) {
    setWorkingId(id);
    await supabase.from("testimonios").update({ aprobado: true }).eq("id", id);
    setWorkingId(null);
    router.refresh();
  }

  async function handleRechazar(id: string) {
    if (!window.confirm("¿Eliminar este testimonio? Esta acción no se puede deshacer.")) return;
    setWorkingId(id);
    await supabase.from("testimonios").delete().eq("id", id);
    setWorkingId(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={filtro === "pendientes" ? "primary" : "outline"}
            onClick={() => setFiltro("pendientes")}
          >
            Pendientes
          </Button>
          <Button
            type="button"
            size="sm"
            variant={filtro === "aprobados" ? "primary" : "outline"}
            onClick={() => setFiltro("aprobados")}
          >
            Aprobados
          </Button>
          <Button
            type="button"
            size="sm"
            variant={filtro === "todos" ? "primary" : "outline"}
            onClick={() => setFiltro("todos")}
          >
            Todos
          </Button>
        </div>
      </Card>

      {visibles.length === 0 ? (
        <Card>
          <EmptyState icon={Quote} title="No hay testimonios en esta vista" />
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {visibles.map((t) => (
            <Card key={t.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display text-sm font-bold text-ink-950">{alumnoNombre(t.alumno_id)}</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-700/80">&ldquo;{t.texto}&rdquo;</p>
                </div>
                <StatusPill
                  status={t.aprobado ? "aprobado" : "pendiente"}
                  label={t.aprobado ? "Aprobado" : "Pendiente"}
                />
              </div>
              <p className="mt-3 text-xs text-ink-700/50">
                {new Date(t.created_at).toLocaleDateString("es-AR")}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {!t.aprobado && (
                  <Button
                    size="sm"
                    type="button"
                    disabled={workingId === t.id}
                    onClick={() => handleAprobar(t.id)}
                  >
                    <Check size={14} />
                    Aprobar
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  disabled={workingId === t.id}
                  onClick={() => handleRechazar(t.id)}
                  className="text-status-overdue-fg hover:bg-status-overdue-bg"
                >
                  <Trash2 size={14} />
                  {t.aprobado ? "Eliminar" : "Rechazar"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
