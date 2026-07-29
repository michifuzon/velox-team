// Hand-written types mirroring supabase/migrations/0001_schema.sql.
// (No DB password available to run `supabase gen types` against the linked
// project — keep this in sync manually when the schema changes.)

export type UserRole = "admin" | "profesor" | "profesor_secundario" | "alumno";
export type NivelRunning = "principiante" | "intermedio" | "avanzado";
export type GrupoEstado = "activo" | "inactivo";
export type AptoEstado = "pendiente" | "en_revision" | "aprobado" | "rechazado" | "vencido";
export type CuotaEstado = "pendiente" | "pagada" | "vencida" | "bonificada" | "cancelada";
export type EntrenamientoTipo =
  | "rodaje_suave" | "fondo" | "pasadas" | "series" | "cambios_ritmo" | "tempo"
  | "cuestas" | "tecnica" | "fuerza" | "movilidad" | "descanso" | "competencia";
export type RegistroEstado = "pendiente" | "realizado" | "no_realizado" | "modificado";
export type PlanTipo = "individual" | "grupal";
export type AsistenciaEstado = "presente" | "ausente" | "tarde";
export type ParticipacionEstado = "voy" | "tal_vez" | "no_participo";
export type CarreraEstado = "proxima" | "realizada" | "cancelada";
export type AvisoDestino = "todos" | "grupo" | "alumno";

export type ProfileRow = {
  id: string;
  role: UserRole;
  nombre: string;
  apellido: string;
  dni: string | null;
  email: string;
  telefono: string | null;
  fecha_nacimiento: string | null;
  genero: string | null;
  domicilio: string | null;
  localidad: string | null;
  provincia: string | null;
  foto_url: string | null;
  contacto_emergencia_nombre: string | null;
  contacto_emergencia_relacion: string | null;
  contacto_emergencia_telefono: string | null;
  activo: boolean;
  perfil_completado_pct: number;
  created_at: string;
  updated_at: string;
};

export type GrupoRow = {
  id: string;
  nombre: string;
  nivel: NivelRunning;
  profesor_id: string | null;
  dias: string[];
  horario: string | null;
  lugar: string | null;
  punto_encuentro: string | null;
  cupo_maximo: number | null;
  estado: GrupoEstado;
  descripcion: string | null;
  created_at: string;
};

export type ProfesorGrupoRow = { profesor_id: string; grupo_id: string };

export type InscripcionGrupoRow = {
  id: string;
  alumno_id: string;
  grupo_id: string;
  fecha_inscripcion: string;
  activo: boolean;
};

export type FichaDeportivaRow = {
  alumno_id: string;
  nivel: NivelRunning | null;
  objetivo_principal: string | null;
  distancia_preferida: string | null;
  ritmo_promedio: string | null;
  dias_disponibles: number | null;
  horarios_disponibles: string | null;
  experiencia_previa: string | null;
  ultima_carrera: string | null;
  marca_5k: string | null;
  marca_10k: string | null;
  marca_21k: string | null;
  marca_maraton: string | null;
  lesiones_previas: string | null;
  observaciones: string | null;
  fecha_carrera_objetivo: string | null;
  ritmo_actual: string | null;
  ritmo_deseado: string | null;
  antecedentes_deportivos: string | null;
  cirugias: string | null;
  medicacion: string | null;
  alergias: string | null;
  observaciones_medicas: string | null;
  info_para_profesor: string | null;
  updated_at: string;
};

export type AptoMedicoRow = {
  id: string;
  alumno_id: string;
  archivo_url: string;
  fecha_emision: string | null;
  fecha_vencimiento: string | null;
  estado: AptoEstado;
  observacion_profesor: string | null;
  created_at: string;
};

export type PlanEntrenamientoRow = {
  id: string;
  nombre: string;
  tipo: PlanTipo;
  grupo_id: string | null;
  alumno_id: string | null;
  objetivo: string | null;
  carrera_id: string | null;
  fecha_inicio: string;
  fecha_fin: string | null;
  creado_por: string | null;
  created_at: string;
};

export type SemanaEntrenamientoRow = {
  id: string;
  plan_id: string;
  numero_semana: number;
  fecha_inicio: string;
};

export type EntrenamientoRow = {
  id: string;
  semana_id: string;
  fecha: string;
  titulo: string;
  tipo: EntrenamientoTipo;
  calentamiento: string | null;
  bloque_principal: string | null;
  recuperaciones: string | null;
  enfriamiento: string | null;
  distancia: number | null;
  duracion_estimada: number | null;
  ritmo_objetivo: string | null;
  zona_cardiaca: string | null;
  superficie: string | null;
  nivel_esfuerzo: number | null;
  observaciones: string | null;
  archivo_url: string | null;
};

export type RegistroEntrenamientoRow = {
  id: string;
  entrenamiento_id: string;
  alumno_id: string;
  estado: RegistroEstado;
  distancia_realizada: number | null;
  tiempo: string | null;
  ritmo_promedio: string | null;
  frecuencia_cardiaca: number | null;
  sensacion: number | null;
  comentario: string | null;
  foto_url: string | null;
  devolucion_profesor: string | null;
  created_at: string;
};

export type AsistenciaRow = {
  id: string;
  grupo_id: string;
  alumno_id: string;
  fecha: string;
  estado: AsistenciaEstado;
  justificada: boolean;
  observacion: string | null;
  registrado_por: string | null;
};

export type CuotaRow = {
  id: string;
  alumno_id: string;
  mes: string;
  monto: number;
  fecha_emision: string;
  fecha_vencimiento: string | null;
  estado: CuotaEstado;
  metodo_pago: string | null;
  fecha_pago: string | null;
  comprobante_url: string | null;
  observaciones: string | null;
};

export type EvaluacionRow = {
  id: string;
  alumno_id: string;
  tipo: string;
  fecha: string;
  resultado: number | null;
  unidad: string | null;
  comentario_profesor: string | null;
  created_at: string;
};

export type CarreraRow = {
  id: string;
  nombre: string;
  fecha: string;
  lugar: string | null;
  distancia: string | null;
  horario: string | null;
  imagen_url: string | null;
  descripcion: string | null;
  enlace_oficial: string | null;
  fecha_limite_inscripcion: string | null;
  costo: number | null;
  punto_encuentro_equipo: string | null;
  estado: CarreraEstado;
};

export type ParticipacionCarreraRow = {
  id: string;
  carrera_id: string;
  alumno_id: string;
  estado: ParticipacionEstado;
  tiempo_oficial: string | null;
  tiempo_neto: string | null;
  posicion_general: number | null;
  posicion_categoria: number | null;
  ritmo_promedio: string | null;
  foto_url: string | null;
  observaciones: string | null;
};

export type AvisoRow = {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: string;
  destino: AvisoDestino;
  grupo_id: string | null;
  alumno_id: string | null;
  autor_id: string | null;
  created_at: string;
};

export type AvisoLecturaRow = { aviso_id: string; alumno_id: string; leido_at: string | null };

export type ObservacionPrivadaRow = {
  id: string;
  alumno_id: string;
  profesor_id: string | null;
  texto: string;
  created_at: string;
};

export type ConfiguracionRow = {
  id: number;
  logo_url: string | null;
  color_primario: string | null;
  nombre_equipo: string | null;
  contacto_whatsapp: string | null;
  contacto_instagram: string | null;
  contacto_email: string | null;
  monto_cuota_general: number | null;
  dia_vencimiento_cuota: number | null;
  metodos_pago: string | null;
  datos_bancarios: string | null;
  terminos_condiciones: string | null;
  politica_privacidad: string | null;
};

export type NoticiaRow = {
  id: string;
  titulo: string;
  bajada: string | null;
  contenido: string;
  imagen_url: string | null;
  categoria: string;
  autor_id: string | null;
  publicado: boolean;
  created_at: string;
  updated_at: string;
};

export type TestimonioRow = {
  id: string;
  alumno_id: string;
  texto: string;
  aprobado: boolean;
  created_at: string;
};

type TableDef<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: TableDef<ProfileRow>;
      grupos: TableDef<GrupoRow>;
      profesor_grupos: TableDef<ProfesorGrupoRow>;
      inscripciones_grupo: TableDef<InscripcionGrupoRow>;
      fichas_deportivas: TableDef<FichaDeportivaRow>;
      aptos_medicos: TableDef<AptoMedicoRow>;
      planes_entrenamiento: TableDef<PlanEntrenamientoRow>;
      semanas_entrenamiento: TableDef<SemanaEntrenamientoRow>;
      entrenamientos: TableDef<EntrenamientoRow>;
      registros_entrenamiento: TableDef<RegistroEntrenamientoRow>;
      asistencias: TableDef<AsistenciaRow>;
      cuotas: TableDef<CuotaRow>;
      evaluaciones: TableDef<EvaluacionRow>;
      carreras: TableDef<CarreraRow>;
      participaciones_carrera: TableDef<ParticipacionCarreraRow>;
      avisos: TableDef<AvisoRow>;
      avisos_lecturas: TableDef<AvisoLecturaRow>;
      observaciones_privadas: TableDef<ObservacionPrivadaRow>;
      configuracion: TableDef<ConfiguracionRow>;
      noticias: TableDef<NoticiaRow>;
      testimonios: TableDef<TestimonioRow>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
