import type { Metadata } from "next";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Images } from "lucide-react";
import type { GaleriaRow } from "@/types/database";

export const metadata: Metadata = {
  title: "Galería",
  description: "Fotos de entrenamientos, carreras y trail de Velox Running Team.",
};

export default async function GaleriaPage() {
  const supabase = await createClient();
  const { data: fotos } = await supabase
    .from("galeria")
    .select("*")
    .order("created_at", { ascending: false });

  const fotosList = (fotos ?? []) as GaleriaRow[];

  return (
    <div className="px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-7xl">
        <SectionHeader eyebrow="Momentos del equipo" title="Galería" />

        {fotosList.length === 0 ? (
          <div className="mt-10">
            <EmptyState icon={Images} title="Todavía no hay fotos publicadas" />
          </div>
        ) : (
          <div className="mt-10 columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4 [&>*]:mb-3 sm:[&>*]:mb-4">
            {fotosList.map((foto) => (
              <div key={foto.id} className="relative overflow-hidden rounded-xl bg-mist-100">
                <Image
                  src={foto.imagen_url}
                  alt={foto.titulo ?? "Foto de Velox Running Team"}
                  width={480}
                  height={480}
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="w-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
