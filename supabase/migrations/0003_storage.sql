-- Velox Team — storage buckets for uploaded files
-- Convention: object path always starts with the owning alumno's user id,
-- e.g. avatars/<uid>/foto.jpg, aptos-medicos/<uid>/apto.pdf

insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('carreras', 'carreras', true),
  ('aptos-medicos', 'aptos-medicos', false),
  ('comprobantes', 'comprobantes', false),
  ('entrenamientos', 'entrenamientos', false)
on conflict (id) do nothing;

-- ============ AVATARS (público para lectura, el dueño sube/reemplaza) ============
create policy "avatars_public_read" on storage.objects for select
  using (bucket_id = 'avatars');
create policy "avatars_owner_write" on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars_owner_update" on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars_owner_delete" on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- ============ CARRERAS (imágenes de eventos, sólo staff sube, lectura pública) ============
create policy "carreras_bucket_public_read" on storage.objects for select
  using (bucket_id = 'carreras');
create policy "carreras_bucket_staff_write" on storage.objects for all
  using (bucket_id = 'carreras' and is_admin_or_profesor())
  with check (bucket_id = 'carreras' and is_admin_or_profesor());

-- ============ APTOS MÉDICOS (privado: dueño + staff con acceso al alumno) ============
create policy "aptos_bucket_read" on storage.objects for select
  using (
    bucket_id = 'aptos-medicos'
    and ((storage.foldername(name))[1] = auth.uid()::text or has_alumno_access((storage.foldername(name))[1]::uuid))
  );
create policy "aptos_bucket_owner_write" on storage.objects for insert
  with check (bucket_id = 'aptos-medicos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "aptos_bucket_owner_delete" on storage.objects for delete
  using (bucket_id = 'aptos-medicos' and (storage.foldername(name))[1] = auth.uid()::text);

-- ============ COMPROBANTES DE PAGO (privado: dueño + staff) ============
create policy "comprobantes_bucket_read" on storage.objects for select
  using (
    bucket_id = 'comprobantes'
    and ((storage.foldername(name))[1] = auth.uid()::text or is_staff())
  );
create policy "comprobantes_bucket_owner_write" on storage.objects for insert
  with check (bucket_id = 'comprobantes' and (storage.foldername(name))[1] = auth.uid()::text);

-- ============ FOTOS DE REGISTROS DE ENTRENAMIENTO (privado: dueño + staff con acceso) ============
create policy "entrenamientos_bucket_read" on storage.objects for select
  using (
    bucket_id = 'entrenamientos'
    and ((storage.foldername(name))[1] = auth.uid()::text or has_alumno_access((storage.foldername(name))[1]::uuid))
  );
create policy "entrenamientos_bucket_owner_write" on storage.objects for insert
  with check (bucket_id = 'entrenamientos' and (storage.foldername(name))[1] = auth.uid()::text);
