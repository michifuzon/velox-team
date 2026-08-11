import { Suspense } from "react";
import { Card } from "@/components/ui/Card";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-ink-950">
          Iniciar sesión
        </h1>
        <p className="mt-1 text-sm text-ink-700/60">
          Acceso para el equipo de Velox Running Team.
        </p>
      </div>
      <Card>
        <Suspense fallback={<div className="h-72" />}>
          <LoginForm />
        </Suspense>
      </Card>
    </div>
  );
}
