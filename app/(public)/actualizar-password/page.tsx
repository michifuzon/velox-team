import { Card } from "@/components/ui/Card";
import { ActualizarPasswordForm } from "@/components/auth/ActualizarPasswordForm";

export default function ActualizarPasswordPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-ink-950">
          Elegí tu nueva contraseña
        </h1>
      </div>
      <Card>
        <ActualizarPasswordForm />
      </Card>
    </div>
  );
}
