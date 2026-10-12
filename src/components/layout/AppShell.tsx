import { useEffect, useRef, useState, type ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { homeFor, navFor } from "../../data/nav";
import { useSession, type Role } from "../../session";
import Header from "./Header";
import Sidebar from "./Sidebar";
import SimulationBanner, { READ_ONLY_HINT } from "../../features/admin/simulation/SimulationBanner";

const SUBTITLE: Record<Role, string> = {
  hq: "MOE HQ - Education Account & FAS",
  school: "School Admin - Education Account & FAS",
  parent: "e-Service Portal - Education Account & FAS",
};

/** Route wrapper: renders children only for the listed roles, else sends the user home. */
export function RequireRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { role } = useSession();
  if (role && !roles.includes(role)) return <Navigate to={homeFor(role)} replace />;
  return children;
}

export default function AppShell() {
  const { role, simulating } = useSession();
  const { pathname } = useLocation();
  const [pinned, setPinned] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const { key, state } = useLocation() as { key: string; state: { focusMain?: boolean } | null };
  // A navigation can ask for focus on the content (e.g. after the Exit simulation button unmounts).
  useEffect(() => {
    if (state?.focusMain) mainRef.current?.focus();
  }, [key, state]);

  if (!role) return <Navigate to="/signin" replace />;
  // A role cannot open another role's prefix.
  const prefix = role === "parent" ? "/parent" : "/admin";
  if (pathname !== prefix && !pathname.startsWith(prefix + "/")) {
    return <Navigate to={homeFor(role)} replace />;
  }

  const current = navFor(role).find((n) => n.to === pathname);

  return (
    <div className="flex min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary"
      >
        Skip to content
      </a>
      <Sidebar pinned={pinned} onTogglePin={() => setPinned((p) => !p)} />
      <div className="min-w-0 flex-1 p-6">
        <SimulationBanner />
        <Header
          title={current?.title ?? current?.label ?? "MOE"}
          subtitle={simulating?.schoolName ?? SUBTITLE[role]}
          showFilter={role !== "parent"}
        />
        <main ref={mainRef} id="main" tabIndex={-1} className="outline-none">
          {simulating ? (
            // Read-only simulation: a disabled fieldset natively disables every button, input and select inside it
            // (dialogs included), so simulated screens need no per-screen gating. Links stay clickable.
            // ponytail: sort headers, pagination and filters are disabled too; no way to whitelist inside a disabled fieldset.
            <fieldset disabled title={READ_ONLY_HINT} className="m-0 min-w-0 border-0 p-0">
              <legend className="sr-only">Simulated screen, read-only</legend>
              <Outlet />
            </fieldset>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}
