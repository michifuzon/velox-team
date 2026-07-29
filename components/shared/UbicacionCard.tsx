import { MapPin, Navigation } from "lucide-react";
import { findUbicacion, mapsEmbedUrl, mapsDirectionsUrl } from "@/lib/ubicaciones";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function UbicacionCard({
  lugar,
  puntoEncuentro,
}: {
  lugar: string | null | undefined;
  puntoEncuentro?: string | null;
}) {
  const ubicacion = findUbicacion(lugar);

  if (!ubicacion) {
    return lugar ? (
      <Card className="flex items-center gap-3">
        <MapPin size={18} className="text-brand-600" />
        <p className="text-sm text-ink-700/70">{lugar}</p>
      </Card>
    ) : null;
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-mist-200 bg-white shadow-[0_1px_3px_rgba(11,15,13,0.06)]"
      )}
    >
      <div className="aspect-[16/9] w-full">
        <iframe
          title={`Mapa de ${ubicacion.nombre}`}
          src={mapsEmbedUrl(ubicacion.direccion)}
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <div className="p-5">
        <p className="font-display text-base font-bold text-ink-950">{ubicacion.nombre}</p>
        <p className="mt-0.5 text-sm text-ink-700/60">{ubicacion.direccion}</p>
        {puntoEncuentro && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-700/70">
            <MapPin size={14} className="text-brand-600" />
            Punto de encuentro: {puntoEncuentro}
          </p>
        )}
        <ButtonLink
          href={mapsDirectionsUrl(ubicacion.direccion)}
          target="_blank"
          rel="noopener noreferrer"
          variant="outline"
          size="sm"
          className="mt-4"
        >
          <Navigation size={15} />
          Cómo llegar
        </ButtonLink>
      </div>
    </div>
  );
}
