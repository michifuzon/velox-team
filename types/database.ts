// Hand-written types mirroring supabase/migrations/0001_schema.sql + 0006_strip_alumno_system.sql.
// (No DB password available to run `supabase gen types` against the linked
// project — keep this in sync manually when the schema changes.)

export type UserRole = "admin" | "profesor";
export type NivelRunning = "principiante" | "intermedio" | "avanzado";
export type GrupoEstado = "activo" | "inactivo";
export type CarreraEstado = "proxima" | "realizada" | "cancelada";

export type ProfileRow = {
  id: string;
  role: UserRole;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  foto_url: string | null;
  activo: boolean;
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
  estado: GrupoEstado;
  descripcion: string | null;
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

export type ConfiguracionRow = {
  id: number;
  logo_url: string | null;
  color_primario: string | null;
  nombre_equipo: string | null;
  contacto_whatsapp: string | null;
  contacto_instagram: string | null;
  contacto_email: string | null;
  terminos_condiciones: string | null;
  politica_privacidad: string | null;
};

export type NoticiaRow = {
  id: string;
  titulo: string;
  bajada: string | null;
  contenido: string;
  imagen_url: string | null;
  imagenes_adicionales: string[];
  categoria: string;
  autor_id: string | null;
  publicado: boolean;
  created_at: string;
  updated_at: string;
};

export type GaleriaRow = {
  id: string;
  imagen_url: string;
  titulo: string | null;
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
      carreras: TableDef<CarreraRow>;
      configuracion: TableDef<ConfiguracionRow>;
      noticias: TableDef<NoticiaRow>;
      galeria: TableDef<GaleriaRow>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
