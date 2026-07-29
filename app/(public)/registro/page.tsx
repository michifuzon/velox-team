import { Card } from "@/components/ui/Card";
import { RegistroForm } from "@/components/auth/RegistroForm";
import { ButtonLink } from "@/components/ui/Button";

export default function RegistroPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-ink-950">
          Crear una cuenta
        </h1>
        <p className="mt-1 text-sm text-ink-700/60">
          Sumate a Velox Running Team y accedé a tu portal de alumno.
        </p>
      </div>
      <Card>
        <RegistroForm />
      </Card>
      <p className="text-center text-sm text-ink-700/60">
        ¿Ya tenés cuenta?{" "}
        <ButtonLink href="/login" variant="ghost" size="sm" className="px-1">
          Iniciar sesión
        </ButtonLink>
      </p>
    </div>
  );
}
