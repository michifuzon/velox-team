import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fyqduwisqdjeujrlmmbe.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        // Noticias imagen_url is a plain admin-entered URL (no upload UI in v1),
        // so it can point anywhere — allow any https host for that field.
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
