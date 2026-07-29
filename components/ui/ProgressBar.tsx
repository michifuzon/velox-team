import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  className,
  trackClassName,
  fillClassName,
}: {
  value: number;
  className?: string;
  trackClassName?: string;
  fillClassName?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-mist-200",
        trackClassName,
        className
      )}
    >
      <div
        className={cn(
          "h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-500",
          fillClassName
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
