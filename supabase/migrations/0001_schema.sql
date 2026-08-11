-- Velox Team — schema inicial
-- Roles: admin, profesor, profesor_secundario, alumno

create extension if not exists "pgcrypto";

create type user_role as enum ('admin', 'profesor', 'profesor_secundario', 'alumno');
create type nivel_running as enum ('principiante', 'intermedio', 'avanzado');
create type grupo_estado as enum ('activo', 'inactivo');
create type apto_estado as enum ('pendiente', 'en_revision', 'aprobado', 'rechazado', 'vencido');
create type cuota_estado as enum ('pendiente', 'pagada', 'vencida', 'bonificada', 'cancelada');
create type entrenamiento_tipo as enum (
  'rodaje_suave','fondo','pasadas','series','cambios_ritmo','tempo',
  'cuestas','tecnica','fuerza','movilidad','descanso','competencia'
);
create type registro_estado as enum ('pendiente','realizado','no_realizado','modificado');
create type plan_tipo as enum ('individual','grupal');
create type asistencia_estado as enum ('presente','ausente','tarde');
create type participacion_estado as enum ('voy','tal_vez','no_participo');
create type carrera_estado as enum ('proxima','realizada','cancelada');
create type aviso_destino as enum ('todos','grupo','alumno');

-- ============ PROFILES ============
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'alumno',
  nombre text not null,
  apellido text not null,
  dni text unique,
  email text not null,
  telefono text,
  fecha_nacimiento date,
  genero text,
  domicilio text,
  localidad text,
  provincia text,
  foto_url text,
  contacto_emergencia_nombre text,
  contacto_emergencia_relacion text,
  contacto_emergencia_telefono text,
  activo boolean not null default true,
  perfil_completado_pct int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ GRUPOS ============
create table grupos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  nivel nivel_running not null default 'principiante',
  profesor_id uuid references profiles(id),
  dias text[] not null default '{}',
  horario text,
  lugar text,
  punto_encuentro text,
  cupo_maximo int,
  estado grupo_estado not null default 'activo',
  descripcion text,
  created_at timestamptz not null default now()
);

create table profesor_grupos (
  profesor_id uuid references profiles(id) on delete cascade,
  grupo_id uuid references grupos(id) on delete cascade,
  primary key (profesor_id, grupo_id)
);

create table inscripciones_grupo (
  id uuid primary key default gen_random_uuid(),
  alumno_id uuid references profiles(id) on delete cascade,
  grupo_id uuid references grupos(id) on delete cascade,
  fecha_inscripcion date not null default current_date,
  activo boolean not null default true,
  unique (alumno_id, grupo_id)
);

-- ============ FICHA DEPORTIVA / INICIAL ============
create table fichas_deportivas (
  alumno_id uuid primary key references profiles(id) on delete cascade,
  nivel nivel_running,
  objetivo_principal text,
  distancia_preferida text,
  ritmo_promedio text,
  dias_disponibles int,
  horarios_disponibles text,
  experiencia_previa text,
  ultima_carrera text,
  marca_5k text,
  marca_10k text,
  marca_21k text,
  marca_maraton text,
  lesiones_previas text,
  observaciones text,
  -- ficha inicial
  fecha_carrera_objetivo date,
  ritmo_actual text,
  ritmo_deseado text,
  antecedentes_deportivos text,
  cirugias text,
  medicacion text,
  alergias text,
  observaciones_medicas text,
  info_para_profesor text,
  updated_at timestamptz not null default now()
);

-- ============ APTOS MÉDICOS ============
create table aptos_medicos (
  id uuid primary key default gen_random_uuid(),
  alumno_id uuid references profiles(id) on delete cascade,
  archivo_url text not null,
  fecha_emision date,
  fecha_vencimiento date,
  estado apto_estado not null default 'pendiente',
  observacion_profesor text,
  created_at timestamptz not null default now()
);

-- ============ PLANES DE ENTRENAMIENTO ============
create table planes_entrenamiento (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  tipo plan_tipo not null,
  grupo_id uuid references grupos(id),
  alumno_id uuid references profiles(id),
  objetivo text,
  carrera_id uuid,
  fecha_inicio date not null,
  fecha_fin date,
  creado_por uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table semanas_entrenamiento (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references planes_entrenamiento(id) on delete cascade,
  numero_semana int not null,
  fecha_inicio date not null
);

create table entrenamientos (
  id uuid primary key default gen_random_uuid(),
  semana_id uuid references semanas_entrenamiento(id) on delete cascade,
  fecha date not null,
  titulo text not null,
  tipo entrenamiento_tipo not null,
  calentamiento text,
  bloque_principal text,
  recuperaciones text,
  enfriamiento text,
  distancia numeric,
  duracion_estimada int,
  ritmo_objetivo text,
  zona_cardiaca text,
  superficie text,
  nivel_esfuerzo int,
  observaciones text,
  archivo_url text
);

create table registros_entrenamiento (
  id uuid primary key default gen_random_uuid(),
  entrenamiento_id uuid references entrenamientos(id) on delete cascade,
  alumno_id uuid references profiles(id) on delete cascade,
  estado registro_estado not null default 'pendiente',
  distancia_realizada numeric,
  tiempo text,
  ritmo_promedio text,
  frecuencia_cardiaca int,
  sensacion int,
  comentario text,
  foto_url text,
  devolucion_profesor text,
  created_at timestamptz not null default now(),
  unique (entrenamiento_id, alumno_id)
);

-- ============ ASISTENCIAS ============
create table asistencias (
  id uuid primary key default gen_random_uuid(),
  grupo_id uuid references grupos(id) on delete cascade,
  alumno_id uuid references profiles(id) on delete cascade,
  fecha date not null,
  estado asistencia_estado not null,
  justificada boolean not null default false,
  observacion text,
  registrado_por uuid references profiles(id),
  unique (grupo_id, alumno_id, fecha)
);

-- ============ CUOTAS ============
create table cuotas (
  id uuid primary key default gen_random_uuid(),
  alumno_id uuid references profiles(id) on delete cascade,
  mes text not null, -- '2026-07'
  monto numeric not null,
  fecha_emision date not null default current_date,
  fecha_vencimiento date,
  estado cuota_estado not null default 'pendiente',
  metodo_pago text,
  fecha_pago date,
  comprobante_url text,
  observaciones text,
  unique (alumno_id, mes)
);

-- ============ EVALUACIONES ============
create table evaluaciones (
  id uuid primary key default gen_random_uuid(),
  alumno_id uuid references profiles(id) on delete cascade,
  tipo text not null,
  fecha date not null default current_date,
  resultado numeric,
  unidad text,
  comentario_profesor text,
  created_at timestamptz not null default now()
);

-- ============ CARRERAS ============
create table carreras (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  fecha date not null,
  lugar text,
  distancia text,
  horario text,
  imagen_url text,
  descripcion text,
  enlace_oficial text,
  fecha_limite_inscripcion date,
  costo numeric,
  punto_encuentro_equipo text,
  estado carrera_estado not null default 'proxima'
);

alter table planes_entrenamiento
  add constraint planes_entrenamiento_carrera_fk foreign key (carrera_id) references carreras(id);

create table participaciones_carrera (
  id uuid primary key default gen_random_uuid(),
  carrera_id uuid references carreras(id) on delete cascade,
  alumno_id uuid references profiles(id) on delete cascade,
  estado participacion_estado not null default 'voy',
  tiempo_oficial text,
  tiempo_neto text,
  posicion_general int,
  posicion_categoria int,
  ritmo_promedio text,
  foto_url text,
  observaciones text,
  unique (carrera_id, alumno_id)
);

-- ============ AVISOS ============
create table avisos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  mensaje text not null,
  tipo text not null default 'general',
  destino aviso_destino not null default 'todos',
  grupo_id uuid references grupos(id),
  alumno_id uuid references profiles(id),
  autor_id uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table avisos_lecturas (
  aviso_id uuid references avisos(id) on delete cascade,
  alumno_id uuid references profiles(id) on delete cascade,
  leido_at timestamptz,
  primary key (aviso_id, alumno_id)
);

-- ============ OBSERVACIONES PRIVADAS ============
create table observaciones_privadas (
  id uuid primary key default gen_random_uuid(),
  alumno_id uuid references profiles(id) on delete cascade,
  profesor_id uuid references profiles(id),
  texto text not null,
  created_at timestamptz not null default now()
);

-- ============ CONFIGURACIÓN (fila única) ============
create table configuracion (
  id int primary key default 1,
  logo_url text,
  color_primario text default '#178A4C',
  nombre_equipo text default 'Velox Team',
  contacto_whatsapp text,
  contacto_instagram text,
  contacto_email text,
  monto_cuota_general numeric,
  dia_vencimiento_cuota int,
  metodos_pago text,
  datos_bancarios text,
  terminos_condiciones text,
  politica_privacidad text,
  constraint configuracion_singleton check (id = 1)
);
insert into configuracion (id) values (1);
