import { Button } from "../../../components/ui/Button";
import { EmptyState } from "../../../components/ui/EmptyState";
import { MOEFAS_BY_LEVEL } from "../../../data/budgets";
import { useMockQuery } from "../../../lib/useMockQuery";
import { useSession } from "../../../session";
import { HqBudget } from "./HqBudget";
import { SchoolBudget } from "./SchoolBudget";

export default function Budgets() {
  const { role } = useSession();
  const query = useMockQuery(MOEFAS_BY_LEVEL);
  if (query.status === "loading")
    return (
      <div aria-busy="true" aria-label="Loading budgets" className="space-y-4">
        {[0, 1].map((i) => <div key={i} className="h-40 animate-pulse rounded-card bg-track" />)}
      </div>
    );
  if (query.status === "error")
    return <EmptyState as="h2" title="Could not load budgets" hint="Check your connection and try again." action={<Button onClick={query.retry}>Retry</Button>} />;
  return role === "school" ? <SchoolBudget /> : <HqBudget />;
}
