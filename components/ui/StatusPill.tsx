import { cn } from "@/lib/utils";

export type PillStatus =
  | "pendiente"
  | "al_dia"
  | "completado"
  | "en_revision"
  | "vencido"
  | "aprobado"
  | "rechazado";

const STYLES: Record<PillStatus, string> = {
  pendiente: "bg-status-pending-bg text-status-pending-fg",
  al_dia: "bg-status-ok-bg text-status-ok-fg",
  completado: "bg-status-ok-bg text-status-ok-fg",
  aprobado: "bg-status-ok-bg text-status-ok-fg",
  en_revision: "bg-status-review-bg text-status-review-fg",
  vencido: "bg-status-overdue-bg text-status-overdue-fg",
  rechazado: "bg-status-overdue-bg text-status-overdue-fg",
};

const LABELS: Record<PillStatus, string> = {
  pendiente: "Pendiente",
  al_dia: "Al día",
  completado: "Completado",
  aprobado: "Aprobado",
  en_revision: "En revisión",
  vencido: "Vencido",
  rechazado: "Rechazado",
};

export function StatusPill({
  status,
  label,
  className,
}: {
  status: PillStatus;
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        STYLES[status],
        className
      )}
    >
      {label ?? LABELS[status]}
    </span>
  );
}

const DOT_COLORS: Record<PillStatus, string> = {
  pendiente: "bg-status-pending-fg",
  al_dia: "bg-status-ok-fg",
  completado: "bg-status-ok-fg",
  aprobado: "bg-status-ok-fg",
  en_revision: "bg-status-review-fg",
  vencido: "bg-status-overdue-fg",
  rechazado: "bg-status-overdue-fg",
};

/** Compact inline status indicator (dot + label) for list rows and tables. */
export function StatusDot({
  status,
  label,
  className,
}: {
  status: PillStatus;
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-semibold",
        STYLES[status].split(" ")[1],
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", DOT_COLORS[status])} />
      {label ?? LABELS[status]}
    </span>
  );
}
