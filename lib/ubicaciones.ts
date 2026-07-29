export type Ubicacion = {
  nombre: string;
  direccion: string;
};

// Las dos sedes reales de Velox Running Team. El mapa se arma por búsqueda (nombre +
// dirección), sin depender de coordenadas exactas ni de una API key de Google.
export const UBICACIONES: Record<string, Ubicacion> = {
  "Parque del Kempes": {
    nombre: "Parque del Kempes",
    direccion: "Parque del Kempes, Córdoba, Argentina",
  },
  "Reserva Natural San Martín": {
    nombre: "Reserva Natural San Martín",
    direccion: "Reserva Natural San Martín, Córdoba, Argentina",
  },
};

export function findUbicacion(lugar: string | null | undefined): Ubicacion | null {
  if (!lugar) return null;
  const match = Object.keys(UBICACIONES).find((key) => lugar.includes(key));
  return match ? UBICACIONES[match] : null;
}

export function mapsEmbedUrl(direccion: string) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(direccion)}&z=15&output=embed`;
}

export function mapsDirectionsUrl(direccion: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(direccion)}`;
}
