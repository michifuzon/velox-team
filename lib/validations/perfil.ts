import { z } from "zod";

export const misDatosSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  apellido: z.string().min(1, "El apellido es obligatorio"),
  telefono: z.string().min(1, "El teléfono es obligatorio"),
  fechaNacimiento: z.string().optional().or(z.literal("")),
  genero: z.string().optional(),
  domicilio: z.string().optional(),
  localidad: z.string().optional(),
  provincia: z.string().optional(),
  contactoEmergenciaNombre: z.string().optional(),
  contactoEmergenciaRelacion: z.string().optional(),
  contactoEmergenciaTelefono: z.string().optional(),
  nivel: z.enum(["principiante", "intermedio", "avanzado", ""]).optional(),
  distanciaPreferida: z.string().optional(),
  ritmoPromedio: z.string().optional(),
  diasDisponibles: z.coerce.number().min(0).max(7).optional().or(z.literal("")),
  experienciaPrevia: z.string().optional(),
  ultimaCarrera: z.string().optional(),
  marca5k: z.string().optional(),
  marca10k: z.string().optional(),
  marca21k: z.string().optional(),
  marcaMaraton: z.string().optional(),
  lesionesPrevias: z.string().optional(),
  observaciones: z.string().optional(),
});
export type MisDatosInput = z.infer<typeof misDatosSchema>;

export const fichaSchema = z.object({
  objetivoPrincipal: z.string().min(1, "Elegí un objetivo principal"),
  distanciaObjetivo: z.string().optional(),
  fechaCarreraObjetivo: z.string().optional().or(z.literal("")),
  ritmoActual: z.string().optional(),
  ritmoDeseado: z.string().optional(),
  diasDisponibles: z.string().optional(),
  horariosDisponibles: z.string().optional(),
  antecedentesDeportivos: z.string().optional(),
  lesiones: z.string().optional(),
  cirugias: z.string().optional(),
  medicacion: z.string().optional(),
  alergias: z.string().optional(),
  observacionesMedicas: z.string().optional(),
  infoParaProfesor: z.string().optional(),
});
export type FichaInput = z.infer<typeof fichaSchema>;
