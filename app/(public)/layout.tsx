import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { getCurrentProfile } from "@/lib/auth";
import { AccessMenu } from "@/components/layout/AccessMenu";
import { MobileNav } from "@/components/layout/MobileNav";

const NAV_LINKS = [
  { label: "Inicio", href: "/" },
  { label: "Velox", href: "/#sobre" },
  { label: "Horarios", href: "/#horarios" },
  { label: "Noticias", href: "/noticias" },
  { label: "Galería", href: "/galeria" },
  { label: "Contacto", href: "/#contacto" },
];

const FOOTER_LINKS = [
  { label: "Sobre Velox Running Team", href: "/#sobre" },
  { label: "Horarios", href: "/#horarios" },
  { label: "Noticias", href: "/noticias" },
  { label: "Carreras", href: "/#carreras" },
  { label: "Galería", href: "/galeria" },
  { label: "Preguntas frecuentes", href: "/#faq" },
  { label: "Contacto", href: "/#contacto" },
];

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-ink-950/8 bg-mist-100/95 backdrop-blur">
        <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6">
          <Logo href="/" size="sm" />
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-ink-700/70 transition-colors hover:bg-mist-100 hover:text-ink-950"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-1">
            <AccessMenu role={profile?.role ?? null} />
            <MobileNav links={NAV_LINKS} />
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-brand-900 text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 sm:grid-cols-2 sm:gap-8 sm:px-6 sm:py-16 lg:grid-cols-4">
          <div>
            <Logo href="/" size="sm" tone="dark" />
            <p className="mt-4 max-w-xs text-sm text-white/50">
              Grupos de entrenamiento, running y trail running para corredores
              de todos los niveles en Córdoba.
            </p>
          </div>
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              Enlaces
            </p>
            <ul className="flex flex-col gap-3 text-sm text-white/70">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              Seguinos
            </p>
            <ul className="flex flex-col gap-3 text-sm text-white/70">
              <li>
                <a
                  href="https://instagram.com/velox.run"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/543513280435"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-white/40 sm:px-6">
          © {new Date().getFullYear()} Velox Running Team. Todos los derechos
          reservados.
        </div>
      </footer>
    </>
  );
}
