import type { Metadata } from "next";
import { Space_Grotesk, Manrope, Bitter } from "next/font/google";
import "./globals.css";

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://veloxteam.app"),
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
    images: [{ url: "/social-share.png", width: 1200, height: 630, alt: "Velox Running Team" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Velox Running Team",
    description:
      "Entrenamientos personalizados, grupos y una comunidad que suma kilómetros con vos.",
    images: ["/social-share.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/favicon-180.png",
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
