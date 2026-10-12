import type { ReactNode } from "react";
import { Button } from "../../../components/ui/Button";
import { EmptyState } from "../../../components/ui/EmptyState";
import { MOEFAS_BY_LEVEL, SBFAS } from "../../../data/budgets";
import { useMockQuery } from "../../../lib/useMockQuery";
import { useSession } from "../../../session";
import { HqBudget } from "./HqBudget";
import { SchoolBudget } from "./SchoolBudget";

/** Simulated fetch of the role's own dataset: skeleton, error + retry, then the view. */
function Gate({ data, children }: { data: unknown; children: ReactNode }) {
  const query = useMockQuery(data);
  if (query.status === "loading")
    return (
      <div aria-busy="true" aria-label="Loading budgets" className="space-y-4">
        {[0, 1].map((i) => <div key={i} className="h-40 motion-safe:animate-pulse rounded-card bg-track" />)}
      </div>
    );
  if (query.status === "error")
    return <EmptyState as="h2" title="Could not load budgets" hint="Check your connection and try again." action={<Button onClick={query.retry}>Retry</Button>} />;
  return <>{children}</>;
}

export default function Budgets() {
  const { role } = useSession();
  if (role === "hq") return <Gate data={MOEFAS_BY_LEVEL}><HqBudget /></Gate>;
  if (role === "school") return <Gate data={SBFAS}><SchoolBudget /></Gate>;
  return <EmptyState as="h2" title="Budgets are not available" hint="Budgets and stats are shown to School and MOE HQ users only." />;
}
