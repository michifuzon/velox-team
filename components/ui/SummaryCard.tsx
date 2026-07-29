import { Card } from "./Card";
import { cn } from "@/lib/utils";

export function SummaryCard({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("flex flex-col gap-3", className)}>
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-ink-700/60">
        {label}
      </p>
      {children}
    </Card>
  );
}
