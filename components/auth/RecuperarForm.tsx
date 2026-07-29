"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { recuperarSchema, type RecuperarInput } from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/client";
import { authErrorMessage } from "@/lib/authErrors";
import { Label, Input, FieldError } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export function RecuperarForm() {
  const supabase = createClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecuperarInput>({ resolver: zodResolver(recuperarSchema) });

  async function onSubmit(values: RecuperarInput) {
    setServerError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/actualizar-password`,
    });
    if (error) {
      setServerError(authErrorMessage(error.message));
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <Alert variant="success">
        Si existe una cuenta con ese correo, te enviamos un link para
        restablecer tu contraseña.
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {serverError && <Alert variant="error">{serverError}</Alert>}
      <div>
        <Label htmlFor="email" required>
          Correo electrónico
        </Label>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
        <FieldError>{errors.email?.message}</FieldError>
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Enviando..." : "Enviar link de recuperación"}
      </Button>
    </form>
  );
}
