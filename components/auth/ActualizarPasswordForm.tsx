"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  actualizarPasswordSchema,
  type ActualizarPasswordInput,
} from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/client";
import { authErrorMessage } from "@/lib/authErrors";
import { Label, Input, FieldError } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export function ActualizarPasswordForm() {
  const router = useRouter();
  const supabase = createClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ActualizarPasswordInput>({
    resolver: zodResolver(actualizarPasswordSchema),
  });

  async function onSubmit(values: ActualizarPasswordInput) {
    setServerError(null);
    const { error } = await supabase.auth.updateUser({ password: values.password });
    if (error) {
      setServerError(authErrorMessage(error.message));
      return;
    }
    router.push("/login");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {serverError && <Alert variant="error">{serverError}</Alert>}
      <div>
        <Label htmlFor="password" required>
          Nueva contraseña
        </Label>
        <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
        <FieldError>{errors.password?.message}</FieldError>
      </div>
      <div>
        <Label htmlFor="confirmPassword" required>
          Confirmar contraseña
        </Label>
        <Input id="confirmPassword" type="password" autoComplete="new-password" {...register("confirmPassword")} />
        <FieldError>{errors.confirmPassword?.message}</FieldError>
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Guardando..." : "Guardar nueva contraseña"}
      </Button>
    </form>
  );
}
