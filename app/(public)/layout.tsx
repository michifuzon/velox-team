import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";

const FOOTER_LINKS = [
  { label: "Sobre Velox Running Team", href: "/#sobre" },
  { label: "Servicios", href: "/#servicios" },
  { label: "Horarios", href: "/#horarios" },
  { label: "Carreras", href: "/#carreras" },
  { label: "Preguntas frecuentes", href: "/#faq" },
  { label: "Contacto", href: "/#contacto" },
];

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-ink-950/8 bg-mist-100/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:h-20 sm:px-6">
          <Logo href="/" size="sm" />
          <div className="flex items-center gap-2 sm:gap-3">
            <ButtonLink
              href="/login"
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex"
            >
              Iniciar sesión
            </ButtonLink>
            <ButtonLink href="/login" variant="outline" size="sm" className="sm:hidden">
              Entrar
            </ButtonLink>
            <ButtonLink href="/registro" variant="primary" size="sm">
              Sumarme
            </ButtonLink>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-brand-900 text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 sm:grid-cols-2 sm:gap-8 sm:px-6 sm:py-16 lg:grid-cols-4">
          <div>
            <Logo href="/" size="sm" tone="dark" />
            <p className="mt-4 max-w-xs text-sm text-white/50">
              Planes personalizados, grupos de entrenamiento y seguimiento
              profesional para corredores de todos los niveles.
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
              Legal
            </p>
            <ul className="flex flex-col gap-3 text-sm text-white/70">
              <li>
                <Link href="/terminos" className="hover:text-white">
                  Términos y condiciones
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="hover:text-white">
                  Política de privacidad
                </Link>
              </li>
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
