"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { registroSchema, type RegistroInput } from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/client";
import { authErrorMessage } from "@/lib/authErrors";
import { Label, Input, Select, FieldError, FieldHint } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export function RegistroForm() {
  const router = useRouter();
  const supabase = createClient();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmEmailSent, setConfirmEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistroInput>({
    resolver: zodResolver(registroSchema),
  });

  async function onSubmit(values: RegistroInput) {
    setServerError(null);

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          nombre: values.nombre,
          apellido: values.apellido,
          dni: values.dni,
          telefono: values.telefono,
          fecha_nacimiento: values.fechaNacimiento,
          genero: values.genero || null,
          domicilio: values.domicilio || null,
          contacto_emergencia_nombre: values.contactoEmergenciaNombre || null,
          contacto_emergencia_telefono: values.contactoEmergenciaTelefono || null,
        },
      },
    });

    if (error) {
      setServerError(authErrorMessage(error.message));
      return;
    }

    if (data.session) {
      router.push("/alumno/dashboard");
      router.refresh();
    } else {
      setConfirmEmailSent(true);
    }
  }

  if (confirmEmailSent) {
    return (
      <Alert variant="success">
        ¡Listo! Te enviamos un correo para confirmar tu cuenta. Una vez
        confirmada, ya podés iniciar sesión.
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {serverError && <Alert variant="error">{serverError}</Alert>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="nombre" required>
            Nombre
          </Label>
          <Input id="nombre" autoComplete="given-name" {...register("nombre")} />
          <FieldError>{errors.nombre?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="apellido" required>
            Apellido
          </Label>
          <Input id="apellido" autoComplete="family-name" {...register("apellido")} />
          <FieldError>{errors.apellido?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="dni" required>
            DNI
          </Label>
          <Input id="dni" inputMode="numeric" {...register("dni")} />
          <FieldError>{errors.dni?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="fechaNacimiento" required>
            Fecha de nacimiento
          </Label>
          <Input id="fechaNacimiento" type="date" {...register("fechaNacimiento")} />
          <FieldError>{errors.fechaNacimiento?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="email" required>
            Correo electrónico
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="tu.usuario@gmail.com"
            {...register("email")}
          />
          <FieldHint>Por ahora solo aceptamos cuentas de Gmail. Te vamos a enviar un correo para verificarla.</FieldHint>
          <FieldError>{errors.email?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="telefono" required>
            Teléfono
          </Label>
          <Input id="telefono" type="tel" autoComplete="tel" {...register("telefono")} />
          <FieldError>{errors.telefono?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="password" required>
            Contraseña
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              className="pr-11"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-ink-700/60 hover:text-ink-950"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <FieldError>{errors.password?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="confirmPassword" required>
            Confirmar contraseña
          </Label>
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            {...register("confirmPassword")}
          />
          <FieldError>{errors.confirmPassword?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="genero">Género (opcional)</Label>
          <Select id="genero" defaultValue="" {...register("genero")}>
            <option value="">Preferís no decirlo</option>
            <option value="femenino">Femenino</option>
            <option value="masculino">Masculino</option>
            <option value="otro">Otro</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="domicilio">Domicilio (opcional)</Label>
          <Input id="domicilio" autoComplete="street-address" {...register("domicilio")} />
        </div>
      </div>

      <div className="border-t border-ink-950/8 pt-4">
        <p className="mb-3 text-sm font-semibold text-ink-950">
          Contacto de emergencia
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="contactoEmergenciaNombre">Nombre y apellido</Label>
            <Input id="contactoEmergenciaNombre" {...register("contactoEmergenciaNombre")} />
          </div>
          <div>
            <Label htmlFor="contactoEmergenciaTelefono">Teléfono</Label>
            <Input id="contactoEmergenciaTelefono" type="tel" {...register("contactoEmergenciaTelefono")} />
          </div>
        </div>
      </div>

      <div>
        <label className="flex items-start gap-2.5 text-sm text-ink-700/70">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-ink-950/20 text-brand-700 focus:ring-brand-600"
            {...register("aceptaTerminos")}
          />
          Acepto los{" "}
          <a href="/terminos" target="_blank" className="font-semibold text-brand-700 hover:text-brand-800">
            términos y condiciones
          </a>{" "}
          y la política de privacidad de Veloz Running Team.
        </label>
        <FieldError>{errors.aceptaTerminos?.message}</FieldError>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
      </Button>
    </form>
  );
}
