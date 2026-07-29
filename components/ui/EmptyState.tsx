import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-2xl border border-dashed border-ink-950/12 px-6 py-12 text-center",
        className
      )}
    >
      {Icon && (
        <span className="mb-1 flex h-11 w-11 items-center justify-center rounded-xl bg-ink-950/5 text-ink-700/60">
          <Icon size={20} />
        </span>
      )}
      <p className="font-display text-sm font-bold text-ink-950">
        {title}
      </p>
      {description && (
        <p className="max-w-sm text-sm text-ink-700/60">{description}</p>
      )}
      {action}
    </div>
  );
}
