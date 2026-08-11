-- Velox Running Team — strip the athlete/student-management system.
-- The site is now a public content site (landing, noticias, carreras, horarios,
-- galería) plus a small admin CMS. Athlete tracking (plans, attendance, fees,
-- evaluations, medical certs) now lives in a separate external app.
--
-- IMPORTANT — this migration deletes data and is not reversible:
--   * every alumno-only table listed below is dropped, along with its rows.
--   * any `profiles` row whose role is not admin/profesor is deleted (their
--     auth.users login itself is left untouched — remove those accounts by
--     hand from the Supabase dashboard if they should stop existing).
-- Review before running against a database with real production data.

-- ============ DROP ATHLETE-ONLY TABLES (cascade drops their policies too) ============
drop table if exists registros_entrenamiento cascade;
drop table if exists entrenamientos cascade;
drop table if exists semanas_entrenamiento cascade;
drop table if exists planes_entrenamiento cascade;
drop table if exists participaciones_carrera cascade;
drop table if exists avisos_lecturas cascade;
drop table if exists avisos cascade;
drop table if exists asistencias cascade;
drop table if exists cuotas cascade;
drop table if exists evaluaciones cascade;
drop table if exists aptos_medicos cascade;
drop table if exists fichas_deportivas cascade;
drop table if exists inscripciones_grupo cascade;
drop table if exists observaciones_privadas cascade;
drop table if exists profesor_grupos cascade;
drop table if exists testimonios cascade;

-- ============ DROP NOW-UNUSED ENUMS ============
drop type if exists apto_estado;
drop type if exists cuota_estado;
drop type if exists entrenamiento_tipo;
drop type if exists registro_estado;
drop type if exists plan_tipo;
drop type if exists asistencia_estado;
drop type if exists participacion_estado;
drop type if exists aviso_destino;

-- ============ DROP NOW-UNUSED HELPER FUNCTIONS ============
-- cascade also drops "grupos_update", which depended on has_grupo_access().
drop function if exists public.has_grupo_access(uuid) cascade;
drop function if exists public.has_alumno_access(uuid) cascade;

create policy "grupos_update" on grupos for update
  using (is_admin_or_profesor());

-- ============ PROFILES: drop remaining alumno rows, then athlete-only columns ============
delete from profiles where role not in ('admin', 'profesor');

alter table profiles
  drop column if exists dni,
  drop column if exists fecha_nacimiento,
  drop column if exists genero,
  drop column if exists domicilio,
  drop column if exists localidad,
  drop column if exists provincia,
  drop column if exists contacto_emergencia_nombre,
  drop column if exists contacto_emergencia_relacion,
  drop column if exists contacto_emergencia_telefono,
  drop column if exists perfil_completado_pct;

alter table profiles alter column role drop default;

create type user_role_new as enum ('admin', 'profesor');
alter table profiles alter column role type user_role_new using role::text::user_role_new;
drop type user_role;
alter type user_role_new rename to user_role;

-- ============ GRUPOS: drop capacity tracking (no more enrollment), nivel optional ============
alter table grupos drop column if exists cupo_maximo;
alter table grupos alter column nivel drop not null;
alter table grupos alter column nivel drop default;

-- ============ CONFIGURACION: drop cuota/payment fields, fake email, unused legal texts ============
alter table configuracion
  drop column if exists monto_cuota_general,
  drop column if exists dia_vencimiento_cuota,
  drop column if exists metodos_pago,
  drop column if exists datos_bancarios,
  drop column if exists contacto_email,
  drop column if exists terminos_condiciones,
  drop column if exists politica_privacidad;

alter table configuracion alter column nombre_equipo set default 'Velox Running Team';
update configuracion
  set nombre_equipo = 'Velox Running Team'
  where id = 1 and (nombre_equipo is null or nombre_equipo = 'Velox Team');

-- ============ HELPER FUNCTIONS: staff is now just admin/profesor ============
create or replace function public.is_staff()
returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role in ('admin','profesor')
  );
$$;

-- ============ AUTO-CREATE PROFILE ON SIGNUP ============
-- No more public self-registration. Only create a profile row when the
-- account is explicitly created with role=admin/profesor metadata (e.g. via
-- the seed script or an admin invite) — never default to a privileged role.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  if (new.raw_user_meta_data->>'role') in ('admin', 'profesor') then
    insert into public.profiles (id, role, nombre, apellido, email, telefono)
    values (
      new.id,
      (new.raw_user_meta_data->>'role')::user_role,
      coalesce(new.raw_user_meta_data->>'nombre', ''),
      coalesce(new.raw_user_meta_data->>'apellido', ''),
      new.email,
      new.raw_user_meta_data->>'telefono'
    );
  end if;
  return new;
end;
$$;

-- ============ GALERÍA (fotos del equipo, visibles sin login) ============
create table galeria (
  id uuid primary key default gen_random_uuid(),
  imagen_url text not null,
  titulo text,
  created_at timestamptz not null default now()
);

alter table galeria enable row level security;

create policy "galeria_select" on galeria for select
  using (true);
create policy "galeria_write" on galeria for all
  using (is_admin_or_profesor()) with check (is_admin_or_profesor());

-- ============ CONTENIDO EDITABLE: servicios, consejos, preguntas frecuentes ============
-- Static landing copy the staff can now edit from /staff/contenido instead of
-- it being hardcoded in the React components.
create table servicios (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descripcion text not null,
  orden int not null default 0,
  created_at timestamptz not null default now()
);
alter table servicios enable row level security;
create policy "servicios_select" on servicios for select using (true);
create policy "servicios_write" on servicios for all
  using (is_admin_or_profesor()) with check (is_admin_or_profesor());

create table consejos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  texto text not null,
  orden int not null default 0,
  created_at timestamptz not null default now()
);
alter table consejos enable row level security;
create policy "consejos_select" on consejos for select using (true);
create policy "consejos_write" on consejos for all
  using (is_admin_or_profesor()) with check (is_admin_or_profesor());

create table faqs (
  id uuid primary key default gen_random_uuid(),
  pregunta text not null,
  respuesta text not null,
  orden int not null default 0,
  created_at timestamptz not null default now()
);
alter table faqs enable row level security;
create policy "faqs_select" on faqs for select using (true);
create policy "faqs_write" on faqs for all
  using (is_admin_or_profesor()) with check (is_admin_or_profesor());

-- Seed with the copy that used to be hardcoded, so the site doesn't go blank.
insert into servicios (titulo, descripcion, orden) values
  ('Grupos de entrenamiento', 'Adaptados a cualquier nivel, con horarios fijos durante toda la semana.', 1),
  ('Planes individuales', 'Planificación a medida para objetivos y carreras específicas.', 2),
  ('Seguimiento profesional', 'Evaluaciones periódicas y control de asistencia con tu profesor.', 3),
  ('Preparación de carreras', 'Acompañamiento antes, durante y después de cada competencia.', 4);

insert into consejos (titulo, texto, orden) values
  ('Cómo mejorar tu ritmo', 'Trabajar la cadencia y sumar series cortas una vez por semana marca la diferencia en pocas semanas.', 1),
  ('Qué comer antes de correr', 'Carbohidratos de fácil digestión entre 60 y 90 minutos antes de la salida, sin experimentar el día de la carrera.', 2),
  ('Cómo elegir tus zapatillas', 'La pisada, el terreno y los kilómetros semanales definen el modelo — no siempre el más caro es el correcto.', 3),
  ('Errores comunes al empezar a correr', 'Sumar volumen demasiado rápido es la causa número uno de lesiones en corredores nuevos.', 4);

insert into faqs (pregunta, respuesta, orden) values
  ('¿Necesito experiencia previa para sumarme?', 'No. Andrés arma tu plan según tu nivel actual, así que podés sumarte aunque nunca hayas corrido.', 1),
  ('¿Cómo elijo mi grupo de entrenamiento?', 'Escribinos por WhatsApp o Instagram y Andrés te ubica en el grupo que mejor se adapte a tu horario y tus objetivos. Todos los grupos son para cualquier capacidad.', 2),
  ('¿Puedo entrenar aunque no viva cerca de los puntos de encuentro?', 'Sí, muchos alumnos combinan el plan individual con sesiones grupales puntuales.', 3),
  ('¿Cómo se pagan las cuotas?', 'Por transferencia o efectivo, con vencimiento mensual — el detalle te llega al inscribirte.', 4);

-- ============ STORAGE: revoke access to athlete-only buckets, add a shared public media bucket ============
-- Supabase blocks direct SQL deletes on storage.objects/storage.buckets
-- (storage.protect_delete()), so the old buckets themselves are left in
-- place — just fully locked down by dropping their policies (no policy +
-- RLS enabled by default = no access at all). Delete the actual buckets
-- "aptos-medicos", "comprobantes" and "entrenamientos" by hand from the
-- Supabase dashboard (Storage section) once you've confirmed nothing in
-- them is still needed.
drop policy if exists "aptos_bucket_read" on storage.objects;
drop policy if exists "aptos_bucket_owner_write" on storage.objects;
drop policy if exists "aptos_bucket_owner_delete" on storage.objects;
drop policy if exists "comprobantes_bucket_read" on storage.objects;
drop policy if exists "comprobantes_bucket_owner_write" on storage.objects;
drop policy if exists "entrenamientos_bucket_read" on storage.objects;
drop policy if exists "entrenamientos_bucket_owner_write" on storage.objects;

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "media_public_read" on storage.objects for select
  using (bucket_id = 'media');
create policy "media_staff_write" on storage.objects for all
  using (bucket_id = 'media' and is_admin_or_profesor())
  with check (bucket_id = 'media' and is_admin_or_profesor());
