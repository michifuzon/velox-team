import { Card } from "@/components/ui/Card";
import { RecuperarForm } from "@/components/auth/RecuperarForm";

export default function RecuperarContrasenaPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-ink-950">
          Recuperar contraseña
        </h1>
        <p className="mt-1 text-sm text-ink-700/60">
          Te enviamos un link a tu correo para elegir una nueva contraseña.
        </p>
      </div>
      <Card>
        <RecuperarForm />
      </Card>
    </div>
  );
}
