import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Ingresá tu correo electrónico").email("Correo inválido"),
  password: z.string().min(1, "Ingresá tu contraseña"),
  rememberMe: z.boolean().optional(),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registroSchema = z
  .object({
    nombre: z.string().min(1, "El nombre es obligatorio"),
    apellido: z.string().min(1, "El apellido es obligatorio"),
    dni: z
      .string()
      .min(1, "El DNI es obligatorio")
      .regex(/^\d{7,9}$/, "Ingresá un DNI válido (solo números)"),
    fechaNacimiento: z.string().min(1, "La fecha de nacimiento es obligatoria"),
    email: z
      .string()
      .min(1, "El correo es obligatorio")
      .email("Correo inválido")
      .refine(
        (value) => /@gmail\.com$/i.test(value.trim()),
        "Por ahora solo aceptamos cuentas de Gmail (@gmail.com)"
      ),
    telefono: z
      .string()
      .min(1, "El teléfono es obligatorio")
      .regex(/^[\d\s+()-]{6,20}$/, "Ingresá un teléfono válido"),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirmá tu contraseña"),
    genero: z.string().optional(),
    domicilio: z.string().optional(),
    contactoEmergenciaNombre: z.string().optional(),
    contactoEmergenciaTelefono: z.string().optional(),
    aceptaTerminos: z.literal(true, {
      message: "Tenés que aceptar los términos y condiciones",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
export type RegistroInput = z.infer<typeof registroSchema>;

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
