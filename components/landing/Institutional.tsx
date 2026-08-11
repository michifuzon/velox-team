import Image from "next/image";
import {
  CalendarClock,
  ChevronDown,
  ClipboardList,
  Flag,
  LineChart,
  Mail,
  MapPin,
  MessageCircle,
  Users,
} from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { ButtonLink } from "@/components/ui/Button";
import { STOCK_PHOTOS, unsplashUrl } from "./stock-photos";
import { RevealOnScroll } from "./RevealOnScroll";
import { UbicacionCard } from "@/components/shared/UbicacionCard";
import { UBICACIONES } from "@/lib/ubicaciones";
import type { GrupoRow } from "@/types/database";

/** Sobre Velox Running Team */
export function About() {
  return (
    <section id="sobre" className="border-t border-ink-950/8 px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center">
        <RevealOnScroll>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
            Sobre Velox Running Team
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold text-ink-950 sm:text-4xl">
            Un equipo, no solo un plan de entrenamiento
          </h2>
          <p className="mt-4 max-w-xl text-base text-ink-700/70">
            Velox Running Team nació para acompañar a corredores de todos los niveles:
            desde quienes dan sus primeros pasos hasta quienes compiten por
            marcas. Entrenamos en grupo, con seguimiento profesional y una
            comunidad que suma kilómetros junto a vos.
          </p>
          <p className="mt-4 max-w-xl text-base text-ink-700/70">
            Planes individuales o grupales, control de asistencia, evaluaciones
            periódicas y un profesor presente en cada sesión.
          </p>
        </RevealOnScroll>
        <RevealOnScroll delay={120}>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
            <Image
              src={unsplashUrl(STOCK_PHOTOS.gravelRoadFields, 900)}
              alt="Corredor de Velox Running Team entrenando al aire libre"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

const SERVICES = [
  {
    icon: Users,
    title: "Grupos de entrenamiento",
    desc: "Adaptados a cualquier nivel, con horarios fijos durante toda la semana.",
  },
  {
    icon: ClipboardList,
    title: "Planes individuales",
    desc: "Planificación a medida para objetivos y carreras específicas.",
  },
  {
    icon: LineChart,
    title: "Seguimiento profesional",
    desc: "Evaluaciones periódicas y control de asistencia con tu profesor.",
  },
  {
    icon: Flag,
    title: "Preparación de carreras",
    desc: "Acompañamiento antes, durante y después de cada competencia.",
  },
];

/** Servicios */
export function Services() {
  return (
    <section id="servicios" className="border-t border-ink-950/8 bg-mist-50 px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <RevealOnScroll>
          <SectionHeader eyebrow="Qué ofrecemos" title="Servicios" />
        </RevealOnScroll>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s, i) => (
            <RevealOnScroll key={s.title} delay={i * 90}>
              <Card className="h-full">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                  <s.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-ink-950">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-ink-700/70">{s.desc}</p>
              </Card>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Horarios — reuses the real grupos query already fetched in the page. */
export function Schedule({ grupos }: { grupos: GrupoRow[] }) {
  return (
    <section id="horarios" className="border-t border-ink-950/8 px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <RevealOnScroll>
          <SectionHeader
            eyebrow="Cuándo entrenamos"
            title="Horarios de los grupos"
            description="Todos los grupos son para cualquier capacidad — elegí el que mejor se adapte a tu disponibilidad."
          />
        </RevealOnScroll>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {grupos.map((grupo, i) => (
            <RevealOnScroll key={grupo.id} delay={i * 90}>
              <Card className="h-full">
                <h3 className="font-display text-xl font-bold text-ink-950">
                  {grupo.nombre}
                </h3>
                <div className="mt-4 flex items-center gap-2 text-sm text-ink-700/80">
                  <CalendarClock className="h-4 w-4 shrink-0 text-brand-600" />
                  {grupo.dias.join(" · ") || "A confirmar"}
                  {grupo.horario ? ` · ${grupo.horario} hs` : ""}
                </div>
                {grupo.lugar && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-ink-700/80">
                    <MapPin className="h-4 w-4 shrink-0 text-brand-600" />
                    {grupo.lugar}
                  </div>
                )}
              </Card>
            </RevealOnScroll>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Object.keys(UBICACIONES).map((lugar) => (
            <UbicacionCard key={lugar} lugar={lugar} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Static flavor content — reflects the real Velox Running Team roster (single coach).
const TEAM = [
  {
    nombre: "Andrés",
    apellido: "Navarro",
    rol: "Profesor y fundador",
    bio: "A cargo de la planificación, los grupos y el seguimiento de cada alumno.",
  },
];

/** Profesor / equipo */
export function Team() {
  return (
    <section className="border-t border-ink-950/8 bg-mist-50 px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <RevealOnScroll>
          <SectionHeader eyebrow="Quién te acompaña" title="Tu profesor" />
        </RevealOnScroll>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:max-w-md">
          {TEAM.map((p, i) => (
            <RevealOnScroll key={p.nombre} delay={i * 100}>
              <Card className="flex h-full items-start gap-4">
                <Avatar nombre={p.nombre} apellido={p.apellido} size={56} />
                <div>
                  <h3 className="font-display text-lg font-bold text-ink-950">
                    {p.nombre} {p.apellido}
                  </h3>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-700">
                    {p.rol}
                  </p>
                  <p className="mt-2 text-sm text-ink-700/70">{p.bio}</p>
                </div>
              </Card>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

const FAQS = [
  {
    q: "¿Necesito experiencia previa para sumarme?",
    a: "No. Andrés arma tu plan según tu nivel actual, así que podés sumarte aunque nunca hayas corrido.",
  },
  {
    q: "¿Cómo elijo mi grupo de entrenamiento?",
    a: "Escribinos por WhatsApp o Instagram y Andrés te ubica en el grupo que mejor se adapte a tu horario y tus objetivos. Todos los grupos son para cualquier capacidad.",
  },
  {
    q: "¿Puedo entrenar aunque no viva cerca de los puntos de encuentro?",
    a: "Sí, muchos alumnos combinan el plan individual con sesiones grupales puntuales.",
  },
  {
    q: "¿Cómo se pagan las cuotas?",
    a: "Por transferencia o efectivo, con vencimiento mensual — el detalle te llega al inscribirte.",
  },
];

/** FAQ */
export function Faq() {
  return (
    <section id="faq" className="border-t border-ink-950/8 px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <RevealOnScroll>
          <SectionHeader eyebrow="Dudas frecuentes" title="Preguntas frecuentes" />
        </RevealOnScroll>
        <div className="mt-10 flex flex-col gap-3">
          {FAQS.map((item, i) => (
            <RevealOnScroll key={item.q} delay={i * 70}>
              <details className="group rounded-xl border border-mist-200 bg-white p-5 open:shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink-950">
                  {item.q}
                  <ChevronDown className="h-4 w-4 shrink-0 text-brand-600 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm text-ink-700/70">{item.a}</p>
              </details>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Contacto */
export function Contact() {
  return (
    <section id="contacto" className="bg-brand-800 px-4 py-16 text-white sm:px-6 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <RevealOnScroll>
          <SectionHeader
            eyebrow="Hablemos"
            title="Contacto"
            className="[&_h2]:text-white [&_p]:text-white/60"
          />
        </RevealOnScroll>
        <RevealOnScroll delay={100} className="mt-10 flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-5 text-sm text-white/80">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-brand-300" />
              contacto@veloxteam.app
            </div>
            <a
              href="https://wa.me/543513280435"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 hover:text-white"
            >
              <MessageCircle className="h-4 w-4 text-brand-300" />
              +54 351 328 0435
            </a>
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-brand-300" />
              Córdoba Capital, Argentina
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink
              href="https://wa.me/543513280435"
              target="_blank"
              rel="noopener noreferrer"
              size="lg"
            >
              Quiero sumarme
            </ButtonLink>
            <ButtonLink
              href="https://instagram.com/velox.run"
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
              size="lg"
              className="border-white/30 bg-white/5 text-white hover:border-white hover:bg-white/10 hover:text-white"
            >
              Escribinos por Instagram
            </ButtonLink>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
