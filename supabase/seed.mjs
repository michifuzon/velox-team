// Demo data seed for Velox Running Team's public content site.
// Usage: NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node supabase/seed.mjs
// (both are already in .env.local — run via `npm run seed`)

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en el entorno.");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_PASSWORD = "Velox2026!";

async function getOrCreateUser({ email, metadata }) {
  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: metadata,
  });

  if (!error) return created.user;

  if (error.message?.toLowerCase().includes("already been registered") || error.status === 422) {
    const { data: list, error: listErr } = await admin.auth.admin.listUsers({ perPage: 200 });
    if (listErr) throw listErr;
    const existing = list.users.find((u) => u.email === email);
    if (existing) {
      console.log(`  (ya existía) ${email}`);
      return existing;
    }
  }
  throw error;
}

async function getOrInsert(table, matchCol, row) {
  const { data: existing } = await admin.from(table).select("*").eq(matchCol, row[matchCol]).maybeSingle();
  if (existing) return existing;
  const { data: inserted, error } = await admin.from(table).insert(row).select().single();
  if (error) throw error;
  return inserted;
}

console.log("Creando usuarios...");

await getOrCreateUser({
  email: "admin@veloxteam.app",
  metadata: { role: "admin", nombre: "Admin", apellido: "Velox" },
});

const profeAndres = await getOrCreateUser({
  email: "andres@veloxteam.app",
  metadata: {
    role: "profesor",
    nombre: "Andrés",
    apellido: "Navarro",
    telefono: "3513280435",
  },
});

console.log("Cargando horarios...");

await getOrInsert("grupos", "nombre", {
  nombre: "Velox Inicial",
  nivel: "principiante",
  profesor_id: profeAndres.id,
  dias: ["Lunes", "Miércoles", "Viernes"],
  horario: "19:30",
  lugar: "Parque del Kempes",
  descripcion: "Grupo para quienes están arrancando a correr.",
});

await getOrInsert("grupos", "nombre", {
  nombre: "Velox Intermedio",
  nivel: "intermedio",
  profesor_id: profeAndres.id,
  dias: ["Martes", "Jueves"],
  horario: "19:00 y 19:30",
  lugar: "Parque del Kempes",
  descripcion: "Para corredores con base aeróbica que buscan bajar tiempos.",
});

await getOrInsert("grupos", "nombre", {
  nombre: "Velox Trail Iniciantes",
  nivel: "principiante",
  profesor_id: profeAndres.id,
  dias: ["Viernes"],
  horario: "18:30",
  lugar: "Reserva Natural San Martín",
  descripcion: "Trail running para quienes se están iniciando en montaña.",
});

await getOrInsert("grupos", "nombre", {
  nombre: "Velox Sábados",
  nivel: "avanzado",
  profesor_id: profeAndres.id,
  dias: ["Sábado"],
  horario: "07:30",
  lugar: "Parque del Kempes",
  descripcion: "Dos sábados por mes en el Kempes, un sábado de salida de trail/montaña.",
});

console.log("Cargando carreras...");

await getOrInsert("carreras", "nombre", {
  nombre: "10K Nocturna Velox",
  fecha: "2026-08-15",
  lugar: "Costanera de Córdoba",
  distancia: "10K",
  horario: "21:00",
  descripcion: "Carrera organizada por el equipo, abierta a todo el público.",
  fecha_limite_inscripcion: "2026-08-10",
  punto_encuentro_equipo: "Puente Centenario, 20:15",
  estado: "proxima",
});

await getOrInsert("carreras", "nombre", {
  nombre: "Media Maratón de Córdoba",
  fecha: "2026-09-06",
  lugar: "Córdoba Capital",
  distancia: "21K",
  horario: "08:00",
  descripcion: "Clásica media maratón de la ciudad.",
  fecha_limite_inscripcion: "2026-08-20",
  estado: "proxima",
});

console.log("Cargando noticias...");

await getOrInsert("noticias", "titulo", {
  titulo: "Arrancamos la temporada 2026",
  bajada: "Nueva temporada de entrenamientos grupales y trail running.",
  contenido:
    "Arrancamos una nueva temporada de entrenamientos con Velox Running Team.\n\nSumate a cualquiera de nuestros grupos, para cualquier nivel y capacidad.",
  categoria: "Novedades del equipo",
  autor_id: profeAndres.id,
  publicado: true,
});

console.log("\nListo. Usuarios (contraseña: Velox2026!):");
console.log("  admin@veloxteam.app   (admin)");
console.log("  andres@veloxteam.app  (profesor)");
