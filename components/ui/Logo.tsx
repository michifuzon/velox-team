import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  href = "/",
  size = "md",
  tone = "light",
  className,
}: {
  href?: string | null;
  size?: "sm" | "md" | "lg";
  tone?: "light" | "dark";
  className?: string;
}) {
  const dims = { sm: 32, md: 40, lg: 56 }[size];
  const content = (
    <span className={cn("flex items-center gap-3", className)}>
      <span
        className="block shrink-0 overflow-hidden rounded-full"
        style={{ width: dims, height: dims }}
      >
        <Image
          src="/veloximg.jpg"
          alt="Velox Running Team"
          width={dims}
          height={dims}
          className="h-full w-full object-cover"
          priority
        />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-brand text-xl font-extrabold tracking-tight",
            tone === "dark" ? "text-white" : "text-ink-950"
          )}
        >
          VELOX
        </span>
        <span
          className={cn(
            "text-[11px] font-semibold tracking-[0.2em]",
            tone === "dark" ? "text-white/50" : "text-ink-700/70"
          )}
        >
          RUNNING TEAM
        </span>
      </span>
    </span>
  );

  if (!href) return content;
  return (
    <Link href={href} aria-label="Velox Running Team, ir al inicio">
      {content}
    </Link>
  );
}
