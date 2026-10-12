import { createContext, useContext, useState, type ReactNode } from "react";

export type Role = "hq" | "school" | "parent";
type User = { name: string; initials: string };
type Session = {
  role: Role | null;
  user: User;
  signIn(role: Role): void;
  signOut(): void;
};

// ASSUMPTION: temporary names; Task 6 replaces them with the mock users in src/data.
const USERS: Record<Role, User> = {
  hq: { name: "Daniel Lim", initials: "DL" },
  school: { name: "Alicia Tan", initials: "AT" },
  parent: { name: "Sarah Mitchell", initials: "SM" },
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
    user: role ? USERS[role] : GUEST,
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
