"use client";

import { useState } from "react";
import { Calendar, MapPin, Ruler } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { CarreraRow, ParticipacionEstado } from "@/types/database";

const OPCIONES: { value: ParticipacionEstado; label: string }[] = [
  { value: "voy", label: "Voy a participar" },
  { value: "tal_vez", label: "Tal vez" },
  { value: "no_participo", label: "No participo" },
];

export function CarreraCard({
  carrera,
  alumnoId,
  estadoInicial,
}: {
  carrera: CarreraRow;
  alumnoId: string;
  estadoInicial: ParticipacionEstado | null;
}) {
  const supabase = createClient();
  const [estado, setEstado] = useState<ParticipacionEstado | null>(estadoInicial);
  const [saving, setSaving] = useState(false);

  async function confirmar(value: ParticipacionEstado) {
    setSaving(true);
    await supabase
      .from("participaciones_carrera")
      .upsert(
        { carrera_id: carrera.id, alumno_id: alumnoId, estado: value },
        { onConflict: "carrera_id,alumno_id" }
      );
    setEstado(value);
    setSaving(false);
  }

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-700">
          {carrera.distancia ?? "Carrera"}
        </p>
        <h3 className="mt-1 font-display text-xl font-bold text-ink-950">{carrera.nombre}</h3>
        {carrera.descripcion && (
          <p className="mt-1 text-sm text-ink-700/60">{carrera.descripcion}</p>
        )}
      </div>
      <div className="flex flex-col gap-2 text-sm text-ink-700/70">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-brand-600" />
          {carrera.fecha} {carrera.horario ? `· ${carrera.horario}` : ""}
        </div>
        {carrera.lugar && (
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-brand-600" />
            {carrera.lugar}
          </div>
        )}
        {carrera.punto_encuentro_equipo && (
          <div className="flex items-center gap-2">
            <Ruler size={16} className="text-brand-600" />
            Encuentro del equipo: {carrera.punto_encuentro_equipo}
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2 border-t border-mist-200 pt-4">
        {OPCIONES.map((o) => (
          <Button
            key={o.value}
            type="button"
            size="sm"
            variant={estado === o.value ? "primary" : "outline"}
            disabled={saving}
            onClick={() => confirmar(o.value)}
          >
            {o.label}
          </Button>
        ))}
      </div>
    </Card>
  );
}
