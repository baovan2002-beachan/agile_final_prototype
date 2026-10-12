import { createContext, useContext, useState, type ReactNode } from "react";
import { userFor, type User } from "./data/users";
import { effectiveRole, newSessionId, parseSimulating, simulationFor, type Simulating } from "./features/admin/simulation/logic";

export type Role = "hq" | "school" | "parent";
type Session = {
  /** Effective role: the simulated role while an HQ user is simulating, else the signed-in role. */
  role: Role | null;
  /** The role actually signed in (HQ while simulating). */
  realRole: Role | null;
  user: User;
  simulating: Simulating | null;
  startSimulation(as: "school" | "parent", schoolName?: string): void;
  stopSimulation(): void;
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

const SIM_KEY = "moe-ui-sim";

function initialSim(): Simulating | null {
  try {
    return parseSimulating(JSON.parse(sessionStorage.getItem(SIM_KEY) ?? "null"));
  } catch {
    return null;
  }
}

const Ctx = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [realRole, setRole] = useState<Role | null>(initialRole);
  const [sim, setSim] = useState<Simulating | null>(initialSim);
  const simulating = simulationFor(realRole, sim);
  const role = effectiveRole(realRole, simulating);
  const setSimulating = (v: Simulating | null) => {
    setSim(v);
    try {
      if (v) sessionStorage.setItem(SIM_KEY, JSON.stringify(v));
      else sessionStorage.removeItem(SIM_KEY);
    } catch {
      /* storage unavailable: simulation lives in memory only */
    }
  };
  const set = (r: Role | null) => {
    setSimulating(null);
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
    realRole,
    simulating,
    startSimulation: (as, schoolName) => {
      if (realRole === "hq") setSimulating({ as, sessionId: newSessionId(), ...(schoolName ? { schoolName } : {}) });
    },
    stopSimulation: () => setSimulating(null),
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
