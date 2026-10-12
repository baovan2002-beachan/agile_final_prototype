import { createContext, useContext, useState, type ReactNode } from "react";
import { userFor, type User } from "./data/users";

export type Role = "hq" | "school" | "parent";
type Session = {
  role: Role | null;
  user: User;
  signIn(role: Role): void;
  signOut(): void;
};

const GUEST: User = { name: "Guest", initials: "G" };
const KEY = "moe-ui-role";
const isRole = (v: unknown): v is Role => v === "hq" || v === "school" || v === "parent";

function initialRole(): Role | null {
  try {
    // DEV only: ?as=hq|school|parent signs in without the sign-in screen.
    if (import.meta.env.DEV) {
      const as = new URLSearchParams(location.search).get("as");
      if (isRole(as)) return as;
    }
    const saved = sessionStorage.getItem(KEY);
    return isRole(saved) ? saved : null;
  } catch {
    return null;
  }
}

const Ctx = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | null>(initialRole);
  const set = (r: Role | null) => {
    setRole(r);
    try {
      if (r) sessionStorage.setItem(KEY, r);
      else sessionStorage.removeItem(KEY);
    } catch {
      /* storage unavailable: session lives in memory only */
    }
  };
  const value: Session = {
    role,
    user: role ? userFor(role) : GUEST,
    signIn: set,
    signOut: () => set(null),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession(): Session {
  const s = useContext(Ctx);
  if (!s) throw new Error("useSession must be used inside SessionProvider");
  return s;
}
