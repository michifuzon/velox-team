"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { fichaSchema, type FichaInput } from "@/lib/validations/perfil";
import { createClient } from "@/lib/supabase/client";
import { recomputePerfilPct } from "@/lib/perfil";
import { Label, Input, Select, Textarea, FieldError } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";
import type { FichaDeportivaRow } from "@/types/database";

const OBJETIVOS = [
  "Bajar tiempo",
  "Empezar a correr",
  "Mejorar resistencia",
  "Preparar una carrera",
  "Mantener actividad física",
];

export function FichaForm({
  alumnoId,
  ficha,
}: {
  alumnoId: string;
  ficha: Pick<
    FichaDeportivaRow,
    | "objetivo_principal"
    | "distancia_preferida"
    | "fecha_carrera_objetivo"
    | "ritmo_actual"
    | "ritmo_deseado"
    | "horarios_disponibles"
    | "antecedentes_deportivos"
    | "lesiones_previas"
    | "cirugias"
    | "medicacion"
    | "alergias"
    | "observaciones_medicas"
    | "info_para_profesor"
  > | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FichaInput>({
    resolver: zodResolver(fichaSchema),
    defaultValues: {
      objetivoPrincipal: ficha?.objetivo_principal ?? "",
      distanciaObjetivo: ficha?.distancia_preferida ?? "",
      fechaCarreraObjetivo: ficha?.fecha_carrera_objetivo ?? "",
      ritmoActual: ficha?.ritmo_actual ?? "",
      ritmoDeseado: ficha?.ritmo_deseado ?? "",
      horariosDisponibles: ficha?.horarios_disponibles ?? "",
      antecedentesDeportivos: ficha?.antecedentes_deportivos ?? "",
      lesiones: ficha?.lesiones_previas ?? "",
      cirugias: ficha?.cirugias ?? "",
      medicacion: ficha?.medicacion ?? "",
      alergias: ficha?.alergias ?? "",
      observacionesMedicas: ficha?.observaciones_medicas ?? "",
      infoParaProfesor: ficha?.info_para_profesor ?? "",
    },
  });

  async function onSubmit(values: FichaInput) {
    setStatus("idle");

    const { error } = await supabase.from("fichas_deportivas").upsert(
      {
        alumno_id: alumnoId,
        objetivo_principal: values.objetivoPrincipal,
        distancia_preferida: values.distanciaObjetivo || null,
        fecha_carrera_objetivo: values.fechaCarreraObjetivo || null,
        ritmo_actual: values.ritmoActual || null,
        ritmo_deseado: values.ritmoDeseado || null,
        horarios_disponibles: values.horariosDisponibles || null,
        antecedentes_deportivos: values.antecedentesDeportivos || null,
        lesiones_previas: values.lesiones || null,
        cirugias: values.cirugias || null,
        medicacion: values.medicacion || null,
        alergias: values.alergias || null,
        observaciones_medicas: values.observacionesMedicas || null,
        info_para_profesor: values.infoParaProfesor || null,
      },
      { onConflict: "alumno_id" }
    );

    if (error) {
      setStatus("error");
      return;
    }

    await recomputePerfilPct(supabase, alumnoId);
    setStatus("success");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {status === "success" && (
        <Alert variant="success">Los cambios se guardaron correctamente.</Alert>
      )}
      {status === "error" && (
        <Alert variant="error">No pudimos guardar los cambios. Probá de nuevo.</Alert>
      )}

      <Alert variant="info">
        Esta ficha nos ayuda a planificar mejor tu entrenamiento. No reemplaza
        una consulta médica.
      </Alert>

      <Card>
        <h2 className="mb-4 font-display text-base font-bold text-ink-950">
          Objetivo
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="objetivoPrincipal" required>
              Objetivo principal
            </Label>
            <Select id="objetivoPrincipal" {...register("objetivoPrincipal")}>
              <option value="">Elegí una opción</option>
              {OBJETIVOS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </Select>
            <FieldError>{errors.objetivoPrincipal?.message}</FieldError>
          </div>
          <div>
            <Label htmlFor="distanciaObjetivo">Distancia objetivo</Label>
            <Input id="distanciaObjetivo" placeholder="Ej: 21 km" {...register("distanciaObjetivo")} />
          </div>
          <div>
            <Label htmlFor="fechaCarreraObjetivo">Fecha de la carrera objetivo</Label>
            <Input id="fechaCarreraObjetivo" type="date" {...register("fechaCarreraObjetivo")} />
          </div>
          <div>
            <Label htmlFor="horariosDisponibles">Horarios disponibles</Label>
            <Input id="horariosDisponibles" placeholder="Ej: mañanas y fines de semana" {...register("horariosDisponibles")} />
          </div>
          <div>
            <Label htmlFor="ritmoActual">Ritmo actual</Label>
            <Input id="ritmoActual" {...register("ritmoActual")} />
          </div>
          <div>
            <Label htmlFor="ritmoDeseado">Ritmo deseado</Label>
            <Input id="ritmoDeseado" {...register("ritmoDeseado")} />
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 font-display text-base font-bold text-ink-950">
          Antecedentes y salud
        </h2>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="antecedentesDeportivos">Antecedentes deportivos</Label>
            <Textarea id="antecedentesDeportivos" rows={2} {...register("antecedentesDeportivos")} />
          </div>
          <div>
            <Label htmlFor="lesiones">Lesiones</Label>
            <Textarea id="lesiones" rows={2} {...register("lesiones")} />
          </div>
          <div>
            <Label htmlFor="cirugias">Cirugías</Label>
            <Textarea id="cirugias" rows={2} {...register("cirugias")} />
          </div>
          <div>
            <Label htmlFor="medicacion">Medicación</Label>
            <Textarea id="medicacion" rows={2} {...register("medicacion")} />
          </div>
          <div>
            <Label htmlFor="alergias">Alergias</Label>
            <Textarea id="alergias" rows={2} {...register("alergias")} />
          </div>
          <div>
            <Label htmlFor="observacionesMedicas">Observaciones médicas</Label>
            <Textarea id="observacionesMedicas" rows={2} {...register("observacionesMedicas")} />
          </div>
          <div>
            <Label htmlFor="infoParaProfesor">Información importante para el profesor</Label>
            <Textarea id="infoParaProfesor" rows={2} {...register("infoParaProfesor")} />
          </div>
        </div>
      </Card>

      <div className="sticky bottom-20 z-10 flex justify-end lg:bottom-4">
        <Button type="submit" disabled={isSubmitting} size="lg">
          {isSubmitting ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
