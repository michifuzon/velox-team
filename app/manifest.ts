import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Velox Running",
    short_name: "Velox Team",
    description: "Entrenamiento, comunidad y seguimiento para corredores de todos los niveles.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#078150",
    orientation: "portrait-primary",
    icons: [
      { src: "/favicon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/favicon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
