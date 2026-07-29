import { requireRole, STAFF_ROLES } from "@/lib/auth";
import { StaffNav } from "@/components/layout/StaffNav";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole(...STAFF_ROLES);

  return (
    <>
      <StaffNav
        user={{
          nombre: profile.nombre,
          apellido: profile.apellido,
          fotoUrl: profile.foto_url,
        }}
      />
      <main className="flex-1 pb-20 lg:pb-0 lg:pl-64">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
          {children}
        </div>
      </main>
    </>
  );
}
