import { useState } from "react";
import { Coins, Receipt, WarningOctagon } from "@phosphor-icons/react";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { ProgressBar } from "../../../components/ui/ProgressBar";
import { StatCard } from "../../../components/ui/StatCard";
import { MOEFAS_BY_LEVEL, OVER_BUDGET_NOTE } from "../../../data/budgets";
import { budgetUsage } from "../../../lib/budget";
import { formatSGD } from "../../../lib/format";
import { SetBudgetModal } from "./SetBudgetModal";

const compact = { compact: true };

export function HqBudget() {
  const [levels, setLevels] = useState(MOEFAS_BY_LEVEL);
  const [modal, setModal] = useState(false);
  const allocation = levels.reduce((s, l) => s + l.budget, 0);
  const used = levels.reduce((s, l) => s + l.used, 0);
  const overCount = levels.filter((l) => budgetUsage(l.used, l.budget).over).length;

  return (
    <div className="space-y-4">
      <Card title="MOEFAS allocation" action={<Button size="sm" variant="secondary" onClick={() => setModal(true)}>Set budget</Button>}>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Total allocation" value={formatSGD(allocation, compact)} icon={<Coins size={26} />} />
          <StatCard label="Disbursed" value={formatSGD(used, compact)} icon={<Receipt size={26} />} />
          <StatCard label="Levels over budget" value={overCount} icon={<WarningOctagon size={26} />} />
        </div>
        <div className="mt-5">
          <ProgressBar pct={allocation > 0 ? (used / allocation) * 100 : 0} label="Overall usage" />
        </div>
      </Card>
      <Card title="Breakdown by level">
        <ul className="divide-y divide-line">
          {levels.map((l) => {
            const { over } = budgetUsage(l.used, l.budget);
            return (
              <li key={l.id} className="py-4 first:pt-0 last:pb-0">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold">
                    {l.id} <span className="font-normal text-on-surface-variant">- {l.students.toLocaleString("en-US")} students</span>
                  </span>
                  {over && <Badge tone="alert">Over budget</Badge>}
                </div>
                <ProgressBar
                  pct={l.budget > 0 ? (l.used / l.budget) * 100 : 0}
                  label={`${formatSGD(l.used, compact)} of ${formatSGD(l.budget, compact)}`}
                />
                {over && <p className="mt-1 text-[13px] font-medium text-alert">Exceeds budget by {formatSGD(l.used - l.budget, compact)}.</p>}
              </li>
            );
          })}
        </ul>
        <p className="mt-4 flex items-center gap-2 text-[13px] text-on-surface-variant">
          <Badge tone="neutral">Assumption</Badge>
          {OVER_BUDGET_NOTE}
        </p>
      </Card>
      <SetBudgetModal
        open={modal}
        onClose={() => setModal(false)}
        targets={levels.map((l) => ({ id: l.id, label: l.id, budget: l.budget }))}
        onSave={(id, n) => setLevels((p) => p.map((l) => (l.id === id ? { ...l, budget: n } : l)))}
      />
    </div>
  );
}
