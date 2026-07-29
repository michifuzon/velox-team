-- Imágenes secundarias opcionales para el cuerpo editorial de cada noticia.
alter table noticias
  add column if not exists imagenes_adicionales text[] not null default '{}';
