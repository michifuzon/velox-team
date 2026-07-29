import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "./Card";
import { StatusDot, type PillStatus } from "./StatusPill";
import { cn } from "@/lib/utils";

/** Container for a set of AccessRow items, rendered as a single divided list. */
export function AccessList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("divide-y divide-mist-200 p-2 sm:p-3", className)}>
      {children}
    </Card>
  );
}

export function AccessRow({
  icon: Icon,
  title,
  description,
  status,
  statusLabel,
  href,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  status: PillStatus;
  statusLabel?: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 px-3 py-3.5 transition-colors hover:bg-brand-50"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-mist-100 text-ink-800 group-hover:bg-white">
        <Icon size={18} strokeWidth={2} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <h3 className="font-display text-sm font-bold text-ink-950">
            {title}
          </h3>
          <StatusDot status={status} label={statusLabel} />
        </div>
        <p className="truncate text-sm text-ink-700/60">{description}</p>
      </div>
      <ChevronRight
        size={18}
        className="shrink-0 text-ink-700/25 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600"
      />
    </Link>
  );
}
