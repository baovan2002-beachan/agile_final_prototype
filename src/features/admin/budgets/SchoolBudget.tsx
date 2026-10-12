import { useState } from "react";
import { Coins, Receipt, UsersThree, Gavel } from "@phosphor-icons/react";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { BarChart } from "../../../components/ui/BarChart";
import { ProgressBar } from "../../../components/ui/ProgressBar";
import { StatCard } from "../../../components/ui/StatCard";
import { SBFAS, SBFAS_BY_TIER, SBFAS_GOVERNANCE } from "../../../data/budgets";
import { budgetUsage } from "../../../lib/budget";
import { formatSGD } from "../../../lib/format";
import { SetBudgetModal } from "./SetBudgetModal";

export function SchoolBudget() {
  const [budget, setBudget] = useState(SBFAS.budget);
  const [modal, setModal] = useState(false);
  const { absorbed } = SBFAS;
  const { over } = budgetUsage(absorbed, budget);
  const exact = budget > 0 ? (absorbed / budget) * 100 : 0;
  const total = SBFAS_BY_TIER.reduce((s, t) => s + t.value, 0);

  return (
    <div className="space-y-4">
      <Card title="SBFAS budget" action={<Button size="sm" variant="secondary" onClick={() => setModal(true)}>Set budget</Button>}>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard label="SBFAS budget" value={formatSGD(budget)} icon={<Coins size={26} />} />
          <StatCard label={`Absorbed (${exact.toFixed(1)}%)`} value={formatSGD(absorbed)} icon={<Receipt size={26} />} />
          <StatCard label="Beneficiaries" value={total} icon={<UsersThree size={26} />} />
        </div>
        <div className="mt-5 space-y-2">
          <ProgressBar pct={exact} label="Budget absorbed" />
          {over && <Badge tone="alert">Over budget</Badge>}
        </div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Beneficiaries by tier">
          <BarChart data={SBFAS_BY_TIER} />
          <p className="mt-2 text-sm text-on-surface-variant">{total} students receiving SBFAS this year.</p>
        </Card>
        <Card title="Governance notes">
          <ul className="space-y-3 text-sm text-on-surface-variant">
            {SBFAS_GOVERNANCE.map((n) => (
              <li key={n} className="flex gap-2">
                <Gavel size={18} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                {n}
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <SetBudgetModal open={modal} onClose={() => setModal(false)} targets={[{ id: "sbfas", label: "SBFAS", budget }]} onSave={(_, n) => setBudget(n)} />
    </div>
  );
}
