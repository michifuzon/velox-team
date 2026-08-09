"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { misDatosSchema, type MisDatosInput } from "@/lib/validations/perfil";
import { createClient } from "@/lib/supabase/client";
import { recomputePerfilPct } from "@/lib/perfil";
import { Label, Input, Select, Textarea, FieldError } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";
import { AvatarUpload } from "./AvatarUpload";
import type { ProfileRow, FichaDeportivaRow } from "@/types/database";

export function MisDatosForm({
  profile,
  ficha,
}: {
  profile: ProfileRow;
  ficha: Pick<
    FichaDeportivaRow,
    | "nivel"
    | "distancia_preferida"
    | "ritmo_promedio"
    | "dias_disponibles"
    | "experiencia_previa"
    | "ultima_carrera"
    | "marca_5k"
    | "marca_10k"
    | "marca_21k"
    | "marca_maraton"
    | "lesiones_previas"
    | "observaciones"
  > | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [fotoUrl, setFotoUrl] = useState(profile.foto_url);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MisDatosInput>({
    resolver: zodResolver(misDatosSchema),
    defaultValues: {
      nombre: profile.nombre,
      apellido: profile.apellido,
      telefono: profile.telefono ?? "",
      fechaNacimiento: profile.fecha_nacimiento ?? "",
      genero: profile.genero ?? "",
      domicilio: profile.domicilio ?? "",
      localidad: profile.localidad ?? "",
      provincia: profile.provincia ?? "",
      contactoEmergenciaNombre: profile.contacto_emergencia_nombre ?? "",
      contactoEmergenciaRelacion: profile.contacto_emergencia_relacion ?? "",
      contactoEmergenciaTelefono: profile.contacto_emergencia_telefono ?? "",
      nivel: (ficha?.nivel as MisDatosInput["nivel"]) ?? "",
      distanciaPreferida: ficha?.distancia_preferida ?? "",
      ritmoPromedio: ficha?.ritmo_promedio ?? "",
      diasDisponibles: ficha?.dias_disponibles ?? "",
      experienciaPrevia: ficha?.experiencia_previa ?? "",
      ultimaCarrera: ficha?.ultima_carrera ?? "",
      marca5k: ficha?.marca_5k ?? "",
      marca10k: ficha?.marca_10k ?? "",
      marca21k: ficha?.marca_21k ?? "",
      marcaMaraton: ficha?.marca_maraton ?? "",
      lesionesPrevias: ficha?.lesiones_previas ?? "",
      observaciones: ficha?.observaciones ?? "",
    },
  });

  async function onSubmit(values: MisDatosInput) {
    setStatus("idle");

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        nombre: values.nombre,
        apellido: values.apellido,
        telefono: values.telefono,
        fecha_nacimiento: values.fechaNacimiento || null,
        genero: values.genero || null,
        domicilio: values.domicilio || null,
        localidad: values.localidad || null,
        provincia: values.provincia || null,
        contacto_emergencia_nombre: values.contactoEmergenciaNombre || null,
        contacto_emergencia_relacion: values.contactoEmergenciaRelacion || null,
        contacto_emergencia_telefono: values.contactoEmergenciaTelefono || null,
      })
      .eq("id", profile.id);

    const { error: fichaError } = await supabase.from("fichas_deportivas").upsert(
      {
        alumno_id: profile.id,
        nivel: values.nivel || null,
        distancia_preferida: values.distanciaPreferida || null,
        ritmo_promedio: values.ritmoPromedio || null,
        dias_disponibles: values.diasDisponibles === "" ? null : Number(values.diasDisponibles),
        experiencia_previa: values.experienciaPrevia || null,
        ultima_carrera: values.ultimaCarrera || null,
        marca_5k: values.marca5k || null,
        marca_10k: values.marca10k || null,
        marca_21k: values.marca21k || null,
        marca_maraton: values.marcaMaraton || null,
        lesiones_previas: values.lesionesPrevias || null,
        observaciones: values.observaciones || null,
      },
      { onConflict: "alumno_id" }
    );

    if (profileError || fichaError) {
      setStatus("error");
      return;
    }

    await recomputePerfilPct(supabase, profile.id);
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

      <Card>
        <h2 className="mb-4 font-display text-base font-bold text-ink-950">
          Datos personales
        </h2>
        <div className="mb-5">
          <AvatarUpload
            userId={profile.id}
            nombre={profile.nombre}
            apellido={profile.apellido}
            fotoUrl={fotoUrl}
            onUploaded={setFotoUrl}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="nombre" required>Nombre</Label>
            <Input id="nombre" {...register("nombre")} />
            <FieldError>{errors.nombre?.message}</FieldError>
          </div>
          <div>
            <Label htmlFor="apellido" required>Apellido</Label>
            <Input id="apellido" {...register("apellido")} />
            <FieldError>{errors.apellido?.message}</FieldError>
          </div>
          <div>
            <Label htmlFor="dni">DNI</Label>
            <Input id="dni" value={profile.dni ?? ""} disabled />
            <p className="mt-1.5 text-xs text-ink-700/50">
              Solo el equipo de Veloz puede modificar este dato.
            </p>
          </div>
          <div>
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" value={profile.email} disabled />
            <p className="mt-1.5 text-xs text-ink-700/50">
              Solo el equipo de Veloz puede modificar este dato.
            </p>
          </div>
          <div>
            <Label htmlFor="telefono" required>Teléfono</Label>
            <Input id="telefono" type="tel" {...register("telefono")} />
            <FieldError>{errors.telefono?.message}</FieldError>
          </div>
          <div>
            <Label htmlFor="fechaNacimiento">Fecha de nacimiento</Label>
            <Input id="fechaNacimiento" type="date" {...register("fechaNacimiento")} />
          </div>
          <div>
            <Label htmlFor="genero">Género (opcional)</Label>
            <Select id="genero" {...register("genero")}>
              <option value="">Preferís no decirlo</option>
              <option value="femenino">Femenino</option>
              <option value="masculino">Masculino</option>
              <option value="otro">Otro</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="domicilio">Domicilio</Label>
            <Input id="domicilio" {...register("domicilio")} />
          </div>
          <div>
            <Label htmlFor="localidad">Localidad</Label>
            <Input id="localidad" {...register("localidad")} />
          </div>
          <div>
            <Label htmlFor="provincia">Provincia</Label>
            <Input id="provincia" {...register("provincia")} />
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 font-display text-base font-bold text-ink-950">
          Contacto de emergencia
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="contactoEmergenciaNombre">Nombre y apellido</Label>
            <Input id="contactoEmergenciaNombre" {...register("contactoEmergenciaNombre")} />
          </div>
          <div>
            <Label htmlFor="contactoEmergenciaRelacion">Relación con el alumno</Label>
            <Input id="contactoEmergenciaRelacion" {...register("contactoEmergenciaRelacion")} />
          </div>
          <div>
            <Label htmlFor="contactoEmergenciaTelefono">Teléfono</Label>
            <Input id="contactoEmergenciaTelefono" type="tel" {...register("contactoEmergenciaTelefono")} />
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 font-display text-base font-bold text-ink-950">
          Perfil deportivo
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="nivel">Nivel</Label>
            <Select id="nivel" {...register("nivel")}>
              <option value="">Sin definir</option>
              <option value="principiante">Principiante</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="distanciaPreferida">Distancia preferida</Label>
            <Input id="distanciaPreferida" placeholder="Ej: 10 km" {...register("distanciaPreferida")} />
          </div>
          <div>
            <Label htmlFor="ritmoPromedio">Ritmo promedio</Label>
            <Input id="ritmoPromedio" placeholder="Ej: 5:30 /km" {...register("ritmoPromedio")} />
          </div>
          <div>
            <Label htmlFor="diasDisponibles">Días disponibles por semana</Label>
            <Input id="diasDisponibles" type="number" min={0} max={7} {...register("diasDisponibles")} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="experienciaPrevia">Experiencia previa</Label>
            <Textarea id="experienciaPrevia" rows={2} {...register("experienciaPrevia")} />
          </div>
          <div>
            <Label htmlFor="ultimaCarrera">Última carrera realizada</Label>
            <Input id="ultimaCarrera" {...register("ultimaCarrera")} />
          </div>
          <div />
          <div>
            <Label htmlFor="marca5k">Mejor marca 5 km</Label>
            <Input id="marca5k" {...register("marca5k")} />
          </div>
          <div>
            <Label htmlFor="marca10k">Mejor marca 10 km</Label>
            <Input id="marca10k" {...register("marca10k")} />
          </div>
          <div>
            <Label htmlFor="marca21k">Mejor marca 21 km</Label>
            <Input id="marca21k" {...register("marca21k")} />
          </div>
          <div>
            <Label htmlFor="marcaMaraton">Mejor marca maratón</Label>
            <Input id="marcaMaraton" {...register("marcaMaraton")} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="lesionesPrevias">Lesiones previas</Label>
            <Textarea id="lesionesPrevias" rows={2} {...register("lesionesPrevias")} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea id="observaciones" rows={2} {...register("observaciones")} />
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
