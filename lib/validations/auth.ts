import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Ingresá tu correo electrónico").email("Correo inválido"),
  password: z.string().min(1, "Ingresá tu contraseña"),
  rememberMe: z.boolean().optional(),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const recuperarSchema = z.object({
  email: z.string().min(1, "Ingresá tu correo electrónico").email("Correo inválido"),
});
export type RecuperarInput = z.infer<typeof recuperarSchema>;

export const actualizarPasswordSchema = z
  .object({
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirmá tu contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
export type ActualizarPasswordInput = z.infer<typeof actualizarPasswordSchema>;
