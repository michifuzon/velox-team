-- Veloz Team — helper functions, auto-profile trigger, and RLS policies

-- ============ HELPER FUNCTIONS (security definer to avoid RLS recursion) ============

create or replace function public.is_staff()
returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role in ('admin','profesor','profesor_secundario')
  );
$$;

create or replace function public.is_admin_or_profesor()
returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role in ('admin','profesor')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

-- admin/profesor: full access to any grupo. profesor_secundario: only assigned grupos.
create or replace function public.has_grupo_access(g_id uuid)
returns boolean
language sql security definer stable
set search_path = public
as $$
  select
    public.is_admin_or_profesor()
    or exists (
      select 1 from profesor_grupos
      where profesor_id = auth.uid() and grupo_id = g_id
    );
$$;

-- admin/profesor: full access to any alumno. profesor_secundario: only alumnos in their grupos.
create or replace function public.has_alumno_access(a_id uuid)
returns boolean
language sql security definer stable
set search_path = public
as $$
  select
    public.is_admin_or_profesor()
    or exists (
      select 1
      from inscripciones_grupo ig
      join profesor_grupos pg on pg.grupo_id = ig.grupo_id
      where ig.alumno_id = a_id and pg.profesor_id = auth.uid()
    );
$$;

-- ============ AUTO-CREATE PROFILE ON SIGNUP ============

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id, role, nombre, apellido, dni, email, telefono, fecha_nacimiento, genero, domicilio,
    contacto_emergencia_nombre, contacto_emergencia_relacion, contacto_emergencia_telefono
  ) values (
    new.id,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'alumno'),
    coalesce(new.raw_user_meta_data->>'nombre', ''),
    coalesce(new.raw_user_meta_data->>'apellido', ''),
    nullif(new.raw_user_meta_data->>'dni', ''),
    new.email,
    new.raw_user_meta_data->>'telefono',
    nullif(new.raw_user_meta_data->>'fecha_nacimiento', '')::date,
    new.raw_user_meta_data->>'genero',
    new.raw_user_meta_data->>'domicilio',
    new.raw_user_meta_data->>'contacto_emergencia_nombre',
    new.raw_user_meta_data->>'contacto_emergencia_relacion',
    new.raw_user_meta_data->>'contacto_emergencia_telefono'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ ENABLE RLS ============

alter table profiles enable row level security;
alter table grupos enable row level security;
alter table profesor_grupos enable row level security;
alter table inscripciones_grupo enable row level security;
alter table fichas_deportivas enable row level security;
alter table aptos_medicos enable row level security;
alter table planes_entrenamiento enable row level security;
alter table semanas_entrenamiento enable row level security;
alter table entrenamientos enable row level security;
alter table registros_entrenamiento enable row level security;
alter table asistencias enable row level security;
alter table cuotas enable row level security;
alter table evaluaciones enable row level security;
alter table carreras enable row level security;
alter table participaciones_carrera enable row level security;
alter table avisos enable row level security;
alter table avisos_lecturas enable row level security;
alter table observaciones_privadas enable row level security;
alter table configuracion enable row level security;

-- ============ PROFILES ============
create policy "profiles_select" on profiles for select
  using (auth.uid() = id or is_staff());
create policy "profiles_update" on profiles for update
  using (auth.uid() = id or is_admin_or_profesor());
create policy "profiles_delete" on profiles for delete
  using (is_admin_or_profesor());

-- ============ GRUPOS (visibles también en la landing pública, sin login) ============
create policy "grupos_select" on grupos for select
  using (true);
create policy "grupos_insert" on grupos for insert
  with check (is_admin_or_profesor());
create policy "grupos_update" on grupos for update
  using (has_grupo_access(id));
create policy "grupos_delete" on grupos for delete
  using (is_admin_or_profesor());

-- ============ PROFESOR_GRUPOS ============
create policy "profesor_grupos_select" on profesor_grupos for select
  using (is_staff());
create policy "profesor_grupos_write" on profesor_grupos for all
  using (is_admin_or_profesor()) with check (is_admin_or_profesor());

-- ============ INSCRIPCIONES_GRUPO ============
create policy "inscripciones_select" on inscripciones_grupo for select
  using (auth.uid() = alumno_id or has_alumno_access(alumno_id));
create policy "inscripciones_write" on inscripciones_grupo for all
  using (is_admin_or_profesor()) with check (is_admin_or_profesor());

-- ============ FICHAS_DEPORTIVAS ============
create policy "fichas_select" on fichas_deportivas for select
  using (auth.uid() = alumno_id or has_alumno_access(alumno_id));
create policy "fichas_insert" on fichas_deportivas for insert
  with check (auth.uid() = alumno_id or is_admin_or_profesor());
create policy "fichas_update" on fichas_deportivas for update
  using (auth.uid() = alumno_id or has_alumno_access(alumno_id));

-- ============ APTOS_MEDICOS ============
create policy "aptos_select" on aptos_medicos for select
  using (auth.uid() = alumno_id or has_alumno_access(alumno_id));
create policy "aptos_insert" on aptos_medicos for insert
  with check (auth.uid() = alumno_id or is_admin_or_profesor());
create policy "aptos_update" on aptos_medicos for update
  using (auth.uid() = alumno_id or has_alumno_access(alumno_id));

-- ============ PLANES_ENTRENAMIENTO ============
create policy "planes_select" on planes_entrenamiento for select
  using (
    auth.uid() = alumno_id
    or has_alumno_access(alumno_id)
    or has_grupo_access(grupo_id)
    or exists (select 1 from inscripciones_grupo ig where ig.grupo_id = planes_entrenamiento.grupo_id and ig.alumno_id = auth.uid())
  );
create policy "planes_write" on planes_entrenamiento for all
  using (has_grupo_access(grupo_id) or has_alumno_access(alumno_id))
  with check (has_grupo_access(grupo_id) or has_alumno_access(alumno_id));

-- ============ SEMANAS_ENTRENAMIENTO ============
create policy "semanas_select" on semanas_entrenamiento for select
  using (exists (
    select 1 from planes_entrenamiento p where p.id = semanas_entrenamiento.plan_id
  ));
create policy "semanas_write" on semanas_entrenamiento for all
  using (exists (
    select 1 from planes_entrenamiento p
    where p.id = semanas_entrenamiento.plan_id
      and (has_grupo_access(p.grupo_id) or has_alumno_access(p.alumno_id))
  ));

-- ============ ENTRENAMIENTOS ============
create policy "entrenamientos_select" on entrenamientos for select
  using (exists (
    select 1 from semanas_entrenamiento s
    join planes_entrenamiento p on p.id = s.plan_id
    where s.id = entrenamientos.semana_id
      and (
        has_grupo_access(p.grupo_id) or has_alumno_access(p.alumno_id)
        or p.alumno_id = auth.uid()
        or exists (select 1 from inscripciones_grupo ig where ig.grupo_id = p.grupo_id and ig.alumno_id = auth.uid())
      )
  ));
create policy "entrenamientos_write" on entrenamientos for all
  using (exists (
    select 1 from semanas_entrenamiento s
    join planes_entrenamiento p on p.id = s.plan_id
    where s.id = entrenamientos.semana_id
      and (has_grupo_access(p.grupo_id) or has_alumno_access(p.alumno_id))
  ));

-- ============ REGISTROS_ENTRENAMIENTO ============
create policy "registros_select" on registros_entrenamiento for select
  using (auth.uid() = alumno_id or has_alumno_access(alumno_id));
create policy "registros_insert" on registros_entrenamiento for insert
  with check (auth.uid() = alumno_id or has_alumno_access(alumno_id));
create policy "registros_update" on registros_entrenamiento for update
  using (auth.uid() = alumno_id or has_alumno_access(alumno_id));

-- ============ ASISTENCIAS ============
create policy "asistencias_select" on asistencias for select
  using (auth.uid() = alumno_id or has_grupo_access(grupo_id));
create policy "asistencias_write" on asistencias for all
  using (has_grupo_access(grupo_id)) with check (has_grupo_access(grupo_id));

-- ============ CUOTAS ============
create policy "cuotas_select" on cuotas for select
  using (auth.uid() = alumno_id or is_staff());
create policy "cuotas_insert" on cuotas for insert
  with check (is_admin_or_profesor());
create policy "cuotas_update" on cuotas for update
  using (auth.uid() = alumno_id or is_admin_or_profesor());

-- ============ EVALUACIONES ============
create policy "evaluaciones_select" on evaluaciones for select
  using (auth.uid() = alumno_id or has_alumno_access(alumno_id));
create policy "evaluaciones_write" on evaluaciones for all
  using (has_alumno_access(alumno_id)) with check (has_alumno_access(alumno_id));

-- ============ CARRERAS (visibles también en la landing pública, sin login) ============
create policy "carreras_select" on carreras for select
  using (true);
create policy "carreras_write" on carreras for all
  using (is_admin_or_profesor()) with check (is_admin_or_profesor());

-- ============ PARTICIPACIONES_CARRERA ============
create policy "participaciones_select" on participaciones_carrera for select
  using (auth.uid() = alumno_id or is_staff());
create policy "participaciones_insert" on participaciones_carrera for insert
  with check (auth.uid() = alumno_id or is_admin_or_profesor());
create policy "participaciones_update" on participaciones_carrera for update
  using (auth.uid() = alumno_id or is_admin_or_profesor());

-- ============ AVISOS ============
create policy "avisos_select" on avisos for select
  using (
    destino = 'todos'
    or (destino = 'alumno' and alumno_id = auth.uid())
    or (destino = 'grupo' and exists (
      select 1 from inscripciones_grupo ig where ig.grupo_id = avisos.grupo_id and ig.alumno_id = auth.uid()
    ))
    or is_staff()
  );
create policy "avisos_write" on avisos for all
  using (is_admin_or_profesor()) with check (is_admin_or_profesor());

-- ============ AVISOS_LECTURAS ============
create policy "avisos_lecturas_select" on avisos_lecturas for select
  using (auth.uid() = alumno_id or is_staff());
create policy "avisos_lecturas_write" on avisos_lecturas for all
  using (auth.uid() = alumno_id) with check (auth.uid() = alumno_id);

-- ============ OBSERVACIONES_PRIVADAS (solo staff, nunca el alumno) ============
create policy "observaciones_select" on observaciones_privadas for select
  using (has_alumno_access(alumno_id));
create policy "observaciones_write" on observaciones_privadas for all
  using (has_alumno_access(alumno_id)) with check (has_alumno_access(alumno_id));

-- ============ CONFIGURACION (visible en la landing pública, sin login) ============
create policy "configuracion_select" on configuracion for select
  using (true);
create policy "configuracion_update" on configuracion for update
  using (is_admin());
