import { CalendarCheck, CheckCircle, Wallet } from "@phosphor-icons/react";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/EmptyState";
import { StatCard } from "../../../components/ui/StatCard";
import type { Child, Invoice } from "../../../data/parent";
import { formatSGD } from "../../../lib/format";
import { PayLink, fmtDate } from "./shared";
import { childOutstanding, nextDue, outstanding, paidThisYear } from "./summary";

export function Stats({ invoices }: { invoices: Invoice[] }) {
  const due = nextDue(invoices);
  const overdue = invoices.filter((i) => i.status === "overdue").length;
  return (
    <Card>
      <div className="grid divide-y divide-line xl:grid-cols-3 xl:divide-x xl:divide-y-0">
        <StatCard icon={<Wallet size={28} />} label={overdue ? `Outstanding balance (${overdue} overdue)` : "Outstanding balance"} value={formatSGD(outstanding(invoices))} />
        <StatCard
          icon={<CalendarCheck size={28} />}
          label={due ? `Next payment due ${fmtDate(due.date)}` : "Next payment due"}
          value={due ? formatSGD(due.amount) : "None"}
        />
        <StatCard icon={<CheckCircle size={28} />} label="Paid this year" value={formatSGD(paidThisYear(invoices))} />
      </div>
    </Card>
  );
}

export function ChildCards({ children, invoices }: { children: Child[]; invoices: Invoice[] }) {
  if (!children.length) {
    return <Card><EmptyState title="No children linked" hint="Children appear here once their Education Account is created at age 7." /></Card>;
  }
  return (
    <ul className="grid gap-4 lg:grid-cols-2">
      {children.map((c) => {
        const owed = childOutstanding(invoices, c.id);
        const late = invoices.some((i) => i.childId === c.id && i.status === "overdue");
        return (
          <li key={c.id}>
            <Card className="h-full">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-[15px] font-semibold">{c.name}</h3>
                  <p className="text-[13px] text-on-surface-variant">{c.level} - {c.school}</p>
                </div>
                {owed > 0 ? <Badge tone={late ? "alert" : "warning"}>{late ? "Overdue" : "Payment due"}</Badge> : <Badge tone="success">Paid up</Badge>}
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-[13px] text-on-surface-variant">Education account balance</dt>
                  <dd className="text-2xl font-bold tracking-tight">{formatSGD(c.educationBalance)}</dd>
                </div>
                <div>
                  <dt className="text-[13px] text-on-surface-variant">Outstanding</dt>
                  <dd className="text-2xl font-bold tracking-tight">{formatSGD(owed)}</dd>
                </div>
              </dl>
              {owed > 0 && <div className="mt-4 flex justify-end"><PayLink label={`Pay now for ${c.name}`} /></div>}
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
