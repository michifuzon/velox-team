import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Role = "admin" | "profesor";

export type Profile = {
  id: string;
  role: Role;
  nombre: string;
  apellido: string;
  email: string;
  foto_url: string | null;
};

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, nombre, apellido, email, foto_url")
    .eq("id", user.id)
    .single();

  return (profile as Profile) ?? null;
}

/** Redirects to /login if unauthenticated, or to the staff home if the role doesn't match. */
export async function requireRole(...roles: Role[]): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!roles.includes(profile.role)) redirect("/staff/dashboard");
  return profile;
}

export const STAFF_ROLES: Role[] = ["admin", "profesor"];
