import { requireRole, STAFF_ROLES } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ConfiguracionForm } from "@/components/staff/ConfiguracionForm";
import { Alert } from "@/components/ui/Alert";
import type { ConfiguracionRow } from "@/types/database";

export default async function ConfiguracionPage() {
  const profile = await requireRole(...STAFF_ROLES);
  const supabase = await createClient();

  const { data: configuracion } = await supabase
    .from("configuracion")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  const isAdmin = profile.role === "admin";

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Configuración"
        description="Datos del equipo, registro interno de cuotas y textos legales."
      />
      {!isAdmin && (
        <Alert variant="info">
          Solo el rol administrador puede editar la configuración. Podés consultar los valores actuales.
        </Alert>
      )}
      {configuracion ? (
        <ConfiguracionForm
          configuracion={configuracion as ConfiguracionRow}
          readOnly={!isAdmin}
        />
      ) : (
        <Alert variant="error">
          No pudimos cargar la configuración del equipo. Verificá que exista la fila con id=1 en la tabla configuracion.
        </Alert>
      )}
    </div>
  );
}
