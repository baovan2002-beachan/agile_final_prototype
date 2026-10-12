import { useState, type ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { homeFor, navFor } from "../../data/nav";
import { useSession, type Role } from "../../session";
import Header from "./Header";
import Sidebar from "./Sidebar";

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
  const { role } = useSession();
  const { pathname } = useLocation();
  const [pinned, setPinned] = useState(false);

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
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-[10px] focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary"
      >
        Skip to content
      </a>
      <Sidebar pinned={pinned} onTogglePin={() => setPinned((p) => !p)} />
      <div className="min-w-0 flex-1 p-6">
        <Header
          title={current?.title ?? current?.label ?? "MOE"}
          subtitle={SUBTITLE[role]}
          showFilter={role !== "parent"}
        />
        <main id="main" tabIndex={-1} className="outline-none">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
