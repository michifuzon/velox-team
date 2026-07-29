import { requireRole } from "@/lib/auth";
import { AlumnoNav } from "@/components/layout/AlumnoNav";

export default async function AlumnoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole("alumno");

  return (
    <>
      <AlumnoNav
        user={{
          nombre: profile.nombre,
          apellido: profile.apellido,
          fotoUrl: profile.foto_url,
        }}
      />
      <main className="flex-1 pb-20 lg:pb-0 lg:pl-64">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
          {children}
        </div>
      </main>
    </>
  );
}
