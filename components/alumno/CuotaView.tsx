import { Card } from "@/components/ui/Card";
import { StatusPill, type PillStatus } from "@/components/ui/StatusPill";
import { EmptyState } from "@/components/ui/EmptyState";
import { Wallet } from "lucide-react";
import type { CuotaRow } from "@/types/database";

function pillStatus(estado: CuotaRow["estado"]): PillStatus {
  if (estado === "pagada" || estado === "bonificada") return "aprobado";
  if (estado === "vencida") return "vencido";
  return "pendiente";
}

const ESTADO_LABEL: Record<CuotaRow["estado"], string> = {
  pendiente: "Pendiente",
  pagada: "Al día",
  vencida: "Vencida",
  bonificada: "Al día",
  cancelada: "Sin vigencia",
};

export function CuotaView({
  actual,
  historial,
}: {
  actual: CuotaRow | null;
  historial: CuotaRow[];
}) {
  if (!actual && historial.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={Wallet}
          title="Sin cuotas cargadas"
          description="Todavía no tenés cuotas registradas. Cuando el profesor actualice tu situación, la vas a ver acá."
        />
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {actual && (
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-ink-700/50">
                Situación administrativa · {actual.mes}
              </p>
              <p className="mt-2 font-display text-2xl font-bold text-ink-950">
                Estado de la cuota
              </p>
              <p className="mt-1 text-sm text-ink-700/60">
                Vencimiento informado: {actual.fecha_vencimiento ?? "—"}
              </p>
            </div>
            <StatusPill status={pillStatus(actual.estado)} label={ESTADO_LABEL[actual.estado]} />
          </div>
          <p className="mt-5 border-t border-mist-200 pt-4 text-sm leading-6 text-ink-700/60">
            Esta sección es únicamente informativa. Los pagos se coordinan por fuera de la aplicación
            y el profesor actualiza el estado manualmente.
          </p>
        </Card>
      )}

      <Card>
        <h2 className="mb-4 font-display text-base font-bold text-ink-950">
          Historial de estados
        </h2>
        {historial.length === 0 ? (
          <p className="text-sm text-ink-700/60">Sin registros anteriores.</p>
        ) : (
          <div className="divide-y divide-mist-200">
            {historial.map((cuota) => (
              <div key={cuota.id} className="flex items-center justify-between gap-4 py-3">
                <p className="text-sm font-semibold text-ink-950">{cuota.mes}</p>
                <StatusPill
                  status={pillStatus(cuota.estado)}
                  label={ESTADO_LABEL[cuota.estado]}
                />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
