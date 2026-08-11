import Link from "next/link";
import { Users } from "lucide-react";

type AccessMenuProps = {
  role: "admin" | "profesor" | null;
};

// Anonymous visitors never see a login affordance — the site has nothing
// for them to log into. Staff reach /login by going there directly; once
// signed in, this becomes a discreet link back to the admin panel.
export function AccessMenu({ role }: AccessMenuProps) {
  const isStaff = role === "admin" || role === "profesor";
  if (!isStaff) return null;

  return (
    <Link
      href="/staff/dashboard"
      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-ink-700/50 transition-colors hover:bg-mist-100 hover:text-ink-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
    >
      <Users className="h-3.5 w-3.5" />
      Admin
    </Link>
  );
}
