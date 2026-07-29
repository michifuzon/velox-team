import Image from "next/image";
import { cn } from "@/lib/utils";

export function Avatar({
  nombre,
  apellido,
  fotoUrl,
  size = 48,
  dark = false,
  className,
}: {
  nombre: string;
  apellido: string;
  fotoUrl?: string | null;
  size?: number;
  dark?: boolean;
  className?: string;
}) {
  const initials = `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();

  if (fotoUrl) {
    return (
      <Image
        src={fotoUrl}
        alt={`${nombre} ${apellido}`}
        width={size}
        height={size}
        className={cn("rounded-2xl object-cover", className)}
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={cn(
        "flex items-center justify-center rounded-2xl font-display font-bold",
        dark ? "bg-white text-ink-950" : "bg-ink-950 text-white",
        className
      )}
    >
      {initials}
    </div>
  );
}
