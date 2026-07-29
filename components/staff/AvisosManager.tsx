"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Megaphone } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Input, Select, Textarea, FieldError } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/EmptyState";
import type { AvisoRow, AvisoDestino } from "@/types/database";

type Persona = { id: string; nombre: string; apellido: string };

const TIPOS = ["General", "Recordatorio", "Urgente", "Evento"];

export function AvisosManager({
  staffId,
  avisos,
  grupos,
  alumnos,
}: {
  staffId: string;
  avisos: AvisoRow[];
  grupos: { id: string; nombre: string }[];
  alumnos: Persona[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [titulo, setTitulo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [tipo, setTipo] = useState(TIPOS[0]);
  const [destino, setDestino] = useState<AvisoDestino>("todos");
  const [grupoId, setGrupoId] = useState("");
  const [alumnoId, setAlumnoId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const grupoNombre = (id: string | null) => grupos.find((g) => g.id === id)?.nombre ?? "—";
  const alumnoNombre = (id: string | null) => {
    const a = alumnos.find((x) => x.id === id);
    return a ? `${a.nombre} ${a.apellido}` : "—";
  };
  const destinoLabel = (a: AvisoRow) => {
    if (a.destino === "todos") return "Todos";
    if (a.destino === "grupo") return `Grupo: ${grupoNombre(a.grupo_id)}`;
    return `Alumno: ${alumnoNombre(a.alumno_id)}`;
  };

  async function handleCrear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!titulo.trim() || !mensaje.trim()) {
      setError("El título y el mensaje son obligatorios.");
      return;
    }
    if (destino === "grupo" && !grupoId) {
      setError("Seleccioná un grupo destinatario.");
      return;
    }
    if (destino === "alumno" && !alumnoId) {
      setError("Seleccioná un alumno destinatario.");
      return;
    }

    setCreating(true);
    const { error: insertError } = await supabase.from("avisos").insert({
      titulo: titulo.trim(),
      mensaje: mensaje.trim(),
      tipo,
      destino,
      grupo_id: destino === "grupo" ? grupoId : null,
      alumno_id: destino === "alumno" ? alumnoId : null,
      autor_id: staffId,
    });
    setCreating(false);
    if (insertError) {
      setError("No pudimos publicar el aviso. Probá de nuevo.");
      return;
    }
    setTitulo("");
    setMensaje("");
    setGrupoId("");
    setAlumnoId("");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h2 className="mb-4 font-display text-base font-bold text-ink-950">Nuevo aviso</h2>
        {error && <div className="mb-3"><FieldError>{error}</FieldError></div>}
        <form onSubmit={handleCrear} className="flex flex-col gap-4">
          <div>
            <Label required>Título</Label>
            <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          </div>
          <div>
            <Label required>Mensaje</Label>
            <Textarea rows={3} value={mensaje} onChange={(e) => setMensaje(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label>Tipo</Label>
              <Select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                {TIPOS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Destino</Label>
              <Select value={destino} onChange={(e) => setDestino(e.target.value as AvisoDestino)}>
                <option value="todos">Todos</option>
                <option value="grupo">Un grupo</option>
                <option value="alumno">Un alumno</option>
              </Select>
            </div>
            {destino === "grupo" && (
              <div>
                <Label required>Grupo</Label>
                <Select value={grupoId} onChange={(e) => setGrupoId(e.target.value)}>
                  <option value="">Seleccionar grupo</option>
                  {grupos.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nombre}
                    </option>
                  ))}
                </Select>
              </div>
            )}
            {destino === "alumno" && (
              <div>
                <Label required>Alumno</Label>
                <Select value={alumnoId} onChange={(e) => setAlumnoId(e.target.value)}>
                  <option value="">Seleccionar alumno</option>
                  {alumnos.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre} {a.apellido}
                    </option>
                  ))}
                </Select>
              </div>
            )}
          </div>
          <div>
            <Button type="submit" disabled={creating}>
              <Plus size={16} />
              {creating ? "Publicando..." : "Publicar aviso"}
            </Button>
          </div>
        </form>
      </Card>

      {avisos.length === 0 ? (
        <Card>
          <EmptyState icon={Megaphone} title="Todavía no se enviaron avisos" />
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {avisos.map((a) => (
            <Card key={a.id}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-display text-sm font-bold text-ink-950">{a.titulo}</p>
                  <p className="mt-1 text-sm text-ink-700/70">{a.mensaje}</p>
                </div>
                <span className="shrink-0 rounded-full bg-mist-100 px-3 py-1 text-xs font-semibold text-ink-700/70">
                  {a.tipo}
                </span>
              </div>
              <p className="mt-3 text-xs text-ink-700/50">
                {destinoLabel(a)} · {new Date(a.created_at).toLocaleDateString("es-AR")}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
