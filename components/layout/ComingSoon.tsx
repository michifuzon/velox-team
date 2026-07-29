import { Construction } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export function ComingSoon({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title={title} description={description} />
      <EmptyState
        icon={Construction}
        title="Esta sección se termina de construir en la próxima etapa"
        description="El diseño y la navegación ya están listos — la funcionalidad completa llega en una fase siguiente del desarrollo."
      />
    </div>
  );
}
