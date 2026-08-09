import type { Metadata } from "next";
import { Space_Grotesk, Manrope, Bitter } from "next/font/google";
import "./globals.css";

const deploymentHost =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.VERCEL_PROJECT_PRODUCTION_URL ??
  process.env.VERCEL_URL ??
  "veloz-team.vercel.app";
const siteUrl = deploymentHost.startsWith("http") ? deploymentHost : `https://${deploymentHost}`;

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

// Used only for the "VELOZ TEAM" wordmark — not the general heading font
// (that stays Space Grotesk).
const bitter = Bitter({
  variable: "--font-brand",
  subsets: ["latin"],
  weight: ["700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Veloz Running",
    template: "%s | Veloz Running",
  },
  description:
    "Aplicación de organización interna de Veloz Running Team para gestionar entrenamientos, horarios y comunicaciones del equipo.",
  applicationName: "Veloz Running",
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "Veloz Running",
    title: "Veloz Running Team",
    description:
      "Entrenamientos personalizados, grupos y una comunidad que suma kilómetros con vos.",
    url: "/",
    images: [{ url: "/veloz-share.png", width: 1200, height: 1200, alt: "Veloz Running Team" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Veloz Running Team",
    description:
      "Entrenamientos personalizados, grupos y una comunidad que suma kilómetros con vos.",
    images: ["/veloz-share.png"],
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
