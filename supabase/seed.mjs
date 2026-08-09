// Demo data seed for Veloz Team.
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

const DEMO_PASSWORD = "Veloz2026!";

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

console.log("Creando usuarios demo...");

const admin1 = await getOrCreateUser({
  email: "admin@velozteam.app",
  metadata: { role: "admin", nombre: "Profesor", apellido: "Veloz" },
});

const profeJuan = await getOrCreateUser({
  email: "profesor@velozteam.app",
  metadata: {
    role: "profesor",
    nombre: "Juan",
    apellido: "Pérez",
    telefono: "3517628450",
  },
});

const alumnosSeed = [
  { email: "faustina@velozteam.app", nombre: "Faustina", apellido: "Conte", dni: "46709505" },
  { email: "martina@velozteam.app", nombre: "Martina", apellido: "López", dni: "45123456" },
  { email: "juan@velozteam.app", nombre: "Juan", apellido: "Pérez", dni: "40987654" },
  { email: "lucia@velozteam.app", nombre: "Lucía", apellido: "Gómez", dni: "43555666" },
  { email: "mateo@velozteam.app", nombre: "Mateo", apellido: "Rodríguez", dni: "44222333" },
];

const alumnos = {};
for (const a of alumnosSeed) {
  const user = await getOrCreateUser({
    email: a.email,
    metadata: {
      role: "alumno",
      nombre: a.nombre,
      apellido: a.apellido,
      dni: a.dni,
      telefono: "351" + Math.floor(1000000 + Math.random() * 8999999),
      fecha_nacimiento: "1995-0" + (1 + (a.dni.length % 9)) + "-15",
    },
  });
  alumnos[a.nombre] = user;
}

console.log("Usuarios listos. Cargando datos relacionales...");

// ============ GRUPOS ============
async function getOrInsert(table, matchCol, row) {
  const { data: existing } = await admin.from(table).select("*").eq(matchCol, row[matchCol]).maybeSingle();
  if (existing) return existing;
  const { data: inserted, error } = await admin.from(table).insert(row).select().single();
  if (error) throw error;
  return inserted;
}

const grupoInicial = await getOrInsert("grupos", "nombre", {
  nombre: "Veloz Inicial",
  nivel: "principiante",
  profesor_id: profeJuan.id,
  dias: ["Lunes", "Miércoles", "Viernes"],
  horario: "07:00",
  lugar: "Parque Sarmiento",
  punto_encuentro: "Portón principal",
  cupo_maximo: 20,
  descripcion: "Grupo para quienes están arrancando a correr.",
});

const grupoIntermedio = await getOrInsert("grupos", "nombre", {
  nombre: "Veloz Intermedio",
  nivel: "intermedio",
  profesor_id: profeJuan.id,
  dias: ["Martes", "Jueves"],
  horario: "19:00",
  lugar: "Estadio Mario Kempes",
  punto_encuentro: "Acceso Norte",
  cupo_maximo: 15,
  descripcion: "Para corredores con base aeróbica que buscan bajar tiempos.",
});

const grupoPerformance = await getOrInsert("grupos", "nombre", {
  nombre: "Veloz Performance",
  nivel: "avanzado",
  profesor_id: profeJuan.id,
  dias: ["Lunes", "Miércoles", "Viernes", "Sábado"],
  horario: "06:30",
  lugar: "Costanera",
  punto_encuentro: "Puente Centenario",
  cupo_maximo: 12,
  descripcion: "Entrenamiento de alta intensidad orientado a competencia.",
});

// ============ INSCRIPCIONES (Mateo queda sin grupo a propósito) ============
await admin.from("inscripciones_grupo").upsert(
  [
    { alumno_id: alumnos["Faustina"].id, grupo_id: grupoInicial.id },
    { alumno_id: alumnos["Martina"].id, grupo_id: grupoInicial.id },
    { alumno_id: alumnos["Juan"].id, grupo_id: grupoIntermedio.id },
    { alumno_id: alumnos["Lucía"].id, grupo_id: grupoPerformance.id },
  ],
  { onConflict: "alumno_id,grupo_id" }
);

// ============ FICHA DEPORTIVA (parcial, para probar % de perfil) ============
await admin.from("fichas_deportivas").upsert(
  [
    {
      alumno_id: alumnos["Faustina"].id,
      nivel: "principiante",
      objetivo_principal: "Empezar a correr con regularidad",
      distancia_preferida: "5 km",
      dias_disponibles: 3,
      experiencia_previa: "Ninguna",
    },
    {
      alumno_id: alumnos["Juan"].id,
      nivel: "intermedio",
      objetivo_principal: "Bajar tiempo en 10K",
      distancia_preferida: "10 km",
      marca_10k: "48:30",
      dias_disponibles: 4,
    },
  ],
  { onConflict: "alumno_id" }
);

// ============ APTOS MÉDICOS ============
await admin.from("aptos_medicos").insert([
  {
    alumno_id: alumnos["Faustina"].id,
    archivo_url: "demo/apto-faustina.pdf",
    fecha_emision: "2026-03-01",
    fecha_vencimiento: "2027-03-01",
    estado: "aprobado",
  },
  {
    alumno_id: alumnos["Martina"].id,
    archivo_url: "demo/apto-martina.pdf",
    fecha_emision: "2025-01-10",
    fecha_vencimiento: "2026-01-10",
    estado: "vencido",
  },
  {
    alumno_id: alumnos["Juan"].id,
    archivo_url: "demo/apto-juan.pdf",
    fecha_emision: "2026-07-20",
    estado: "en_revision",
  },
  {
    alumno_id: alumnos["Lucía"].id,
    archivo_url: "demo/apto-lucia.pdf",
    fecha_emision: "2026-02-15",
    fecha_vencimiento: "2027-02-15",
    estado: "aprobado",
  },
]);

// ============ CUOTAS (mes actual) ============
const mesActual = "2026-07";
await admin.from("cuotas").upsert(
  [
    { alumno_id: alumnos["Faustina"].id, mes: mesActual, monto: 15000, fecha_vencimiento: "2026-07-10", estado: "pagada", fecha_pago: "2026-07-05", metodo_pago: "Transferencia" },
    { alumno_id: alumnos["Martina"].id, mes: mesActual, monto: 15000, fecha_vencimiento: "2026-07-10", estado: "pendiente" },
    { alumno_id: alumnos["Juan"].id, mes: mesActual, monto: 15000, fecha_vencimiento: "2026-07-10", estado: "vencida" },
    { alumno_id: alumnos["Lucía"].id, mes: mesActual, monto: 15000, fecha_vencimiento: "2026-07-10", estado: "pagada", fecha_pago: "2026-07-02", metodo_pago: "Efectivo" },
    { alumno_id: alumnos["Mateo"].id, mes: mesActual, monto: 15000, fecha_vencimiento: "2026-07-10", estado: "pendiente" },
  ],
  { onConflict: "alumno_id,mes" }
);

// ============ EVALUACIONES ============
await admin.from("evaluaciones").insert([
  { alumno_id: alumnos["Faustina"].id, tipo: "Test de Cooper", fecha: "2026-05-01", resultado: 2100, unidad: "metros" },
  { alumno_id: alumnos["Faustina"].id, tipo: "Test de Cooper", fecha: "2026-07-01", resultado: 2350, unidad: "metros", comentario_profesor: "Buena mejora, seguir con series." },
  { alumno_id: alumnos["Juan"].id, tipo: "Test de 5 km", fecha: "2026-06-01", resultado: 24.5, unidad: "minutos" },
]);

// ============ CARRERAS ============
await getOrInsert("carreras", "nombre", {
  nombre: "10K Nocturna Veloz",
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

// ============ AVISOS ============
await admin.from("avisos").insert([
  {
    titulo: "Bienvenida a la temporada 2026",
    mensaje: "Arrancamos una nueva temporada de entrenamientos. ¡Vamos equipo!",
    tipo: "general",
    destino: "todos",
    autor_id: admin1.id,
  },
  {
    titulo: "Cambio de horario - Veloz Inicial",
    mensaje: "Este viernes entrenamos 30 minutos más tarde por el clima.",
    tipo: "cambio_horario",
    destino: "grupo",
    grupo_id: grupoInicial.id,
    autor_id: profeJuan.id,
  },
]);

console.log("\nListo. Usuarios demo (contraseña para todos: Veloz2026!):");
console.log("  admin@velozteam.app        (admin)");
console.log("  profesor@velozteam.app     (profesor)");
for (const a of alumnosSeed) console.log(`  ${a.email}  (alumno: ${a.nombre} ${a.apellido})`);
console.log(
  "\nOjo: los grupos, la cuota y el usuario admin reales se ajustaron a mano después del seed inicial (ver git log). No reejecutes este script sin revisar antes."
);
