-- Velox Team — contenido editable: noticias (blog del panel admin) y testimonios de alumnos

create table noticias (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  bajada text,
  contenido text not null,
  imagen_url text,
  categoria text not null default 'Novedades del equipo',
  autor_id uuid references profiles(id),
  publicado boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table noticias enable row level security;

create policy "noticias_select_public" on noticias for select
  using (publicado = true or is_admin_or_profesor());
create policy "noticias_write" on noticias for all
  using (is_admin_or_profesor()) with check (is_admin_or_profesor());

create table testimonios (
  id uuid primary key default gen_random_uuid(),
  alumno_id uuid references profiles(id) on delete cascade,
  texto text not null,
  aprobado boolean not null default false,
  created_at timestamptz not null default now()
);

alter table testimonios enable row level security;

create policy "testimonios_select" on testimonios for select
  using (aprobado = true or auth.uid() = alumno_id or is_staff());
create policy "testimonios_insert" on testimonios for insert
  with check (auth.uid() = alumno_id);
create policy "testimonios_moderate" on testimonios for update
  using (is_admin_or_profesor());
create policy "testimonios_delete" on testimonios for delete
  using (auth.uid() = alumno_id or is_admin_or_profesor());
