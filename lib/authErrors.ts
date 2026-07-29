/** Maps raw Supabase Auth error messages to friendly, on-brand Spanish copy. */
export function authErrorMessage(raw: string | undefined | null): string {
  const msg = (raw ?? "").toLowerCase();

  if (msg.includes("invalid login credentials")) {
    return "El correo o la contraseña no son correctos.";
  }
  if (msg.includes("email not confirmed")) {
    return "Todavía no confirmaste tu cuenta. Revisá tu correo y hacé clic en el link de verificación.";
  }
  if (msg.includes("already registered") || msg.includes("already exists") || msg.includes("user already")) {
    return "Ya existe una cuenta con ese correo electrónico. Probá iniciar sesión.";
  }
  if (msg.includes("password") && (msg.includes("weak") || msg.includes("at least"))) {
    return "La contraseña es demasiado débil. Usá al menos 8 caracteres, combinando letras y números.";
  }
  if (msg.includes("rate limit") || msg.includes("too many requests")) {
    return "Hiciste demasiados intentos. Esperá unos minutos y volvé a intentar.";
  }
  if (msg.includes("email") && msg.includes("invalid")) {
    return "Ese correo electrónico no es válido.";
  }
  if (msg.includes("network") || msg.includes("fetch")) {
    return "No pudimos conectarnos. Revisá tu conexión a internet e intentá de nuevo.";
  }
  if (msg.includes("session") && msg.includes("expired")) {
    return "Tu sesión expiró. Volvé a iniciar sesión.";
  }
  if (!msg) {
    return "Ocurrió un error inesperado. Probá de nuevo en unos minutos.";
  }
  return "No pudimos completar la acción. Probá de nuevo en unos minutos.";
}
