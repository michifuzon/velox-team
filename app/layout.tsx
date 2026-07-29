import type { Metadata } from "next";
import { Space_Grotesk, Manrope, Bitter } from "next/font/google";
import "./globals.css";

const deploymentHost =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.VERCEL_PROJECT_PRODUCTION_URL ??
  process.env.VERCEL_URL ??
  "veloxteam.app";
const siteUrl = deploymentHost.startsWith("http") ? deploymentHost : `https://${deploymentHost}`;

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

// Used only for the "VELOX TEAM" wordmark, matching the serif on the real
// team banner/flag — not the general heading font (that stays Space Grotesk).
const bitter = Bitter({
  variable: "--font-brand",
  subsets: ["latin"],
  weight: ["700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Velox Running",
    template: "%s | Velox Running",
  },
  description:
    "Velox Running Team: entrenamiento, comunidad y seguimiento profesional para corredores de todos los niveles.",
  applicationName: "Velox Running",
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "Velox Running",
    title: "Velox Running Team",
    description:
      "Entrenamientos personalizados, grupos y una comunidad que suma kilómetros con vos.",
    url: "/",
    images: [{ url: "/velox-share.png", width: 1200, height: 1200, alt: "Velox Running Team" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Velox Running Team",
    description:
      "Entrenamientos personalizados, grupos y una comunidad que suma kilómetros con vos.",
    images: ["/velox-share.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [{ url: "/app-icon-180.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${spaceGrotesk.variable} ${manrope.variable} ${bitter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white">{children}</body>
    </html>
  );
}
