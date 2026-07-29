import { cn } from "@/lib/utils";

export function Card({
  className,
  accent = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { accent?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-white p-6 shadow-[0_1px_3px_rgba(11,15,13,0.06)]",
        accent ? "border-brand-100 border-l-4 border-l-brand-500" : "border-mist-200",
        className
      )}
      {...props}
    />
  );
}

export function DarkCard({
  className,
  children,
  tone = "green",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { tone?: "green" | "black" }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl p-8 text-white",
        tone === "black" ? "bg-ink-950" : "bg-brand-800",
        className
      )}
      {...props}
    >
      {/* subtle diagonal line — a quiet nod to pace/movement, not a decoration */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-10 w-px -skew-x-[18deg] bg-white/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-16 w-px -skew-x-[18deg] bg-white/5"
      />
      <div className="relative">{children}</div>
    </div>
  );
}
