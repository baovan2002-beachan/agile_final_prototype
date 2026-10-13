import { ArrowDownLeft, ArrowLeft, ArrowUpRight, Bank, Receipt } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/EmptyState";
import { ProgressBar } from "../../../components/ui/ProgressBar";
import { FEE_TYPES, cycleLabel } from "../../../data/fees";
import { ACCOUNT_CLOSES_AT, ACCOUNT_OPENS_AT, accountStatus, ageForLevel, isFeePaid, ledgerFor } from "../../../lib/accounts";
import { formatSGD } from "../../../lib/format";
import { useSession } from "../../../session";
import { statusTone } from "./logic";
import { useStudent } from "./useStudent";

const SBFAS_TONE = { Approved: "success", Pending: "warning", Rejected: "alert", "Not applied": "neutral" } as const;

function Stat({ label, value, note, alert }: { label: string; value: ReactNode; note?: ReactNode; alert?: boolean }) {
  return (
    <div className="px-5 py-4">
      <div className="text-[13px] font-medium text-on-surface-variant">{label}</div>
      <div className={`mt-1 text-[27px] font-bold leading-tight tracking-tight ${alert ? "text-alert" : "text-on-surface"}`}>{value}</div>
      {note && <div className="mt-0.5 text-[13px] text-on-surface-variant">{note}</div>}
    </div>
  );
}

/** Req 1-4: one student's Education Account: summary, fees, ledger, lifecycle, FAS and actions. */
export default function EducationAccountPage() {
  const student = useStudent();
  const navigate = useNavigate();
  const { role } = useSession();

  if (!student) {
    return (
      <Card>
        <EmptyState as="h2" title="Account not found" action={<Link to="/admin/students" className="text-primary underline">Back to students</Link>} />
      </Card>
    );
  }

  const fees = FEE_TYPES.map((f) => ({ ...f, paid: isFeePaid(f.name, student) }));
  const due = fees.filter((f) => !f.paid).reduce((t, f) => t + f.amount, 0);
  const left = student.balance - due;
  const entries = ledgerFor(student);
  const age = ageForLevel(student.level);
  const initials = student.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const feesPath = `/admin/students/${student.id}/fees`;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
      <Link to="/admin/students" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
        <ArrowLeft size={16} aria-hidden /> Back to students
      </Link>

      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <div className="grid size-14 shrink-0 place-items-center rounded-full bg-primary-fixed text-lg font-bold text-primary" aria-hidden>{initials}</div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold text-on-surface">{student.name}</h2>
            <p className="mt-0.5 text-sm text-on-surface-variant">{student.id} · {student.level} · {student.class}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge tone="success">Account {accountStatus(student.level).toLowerCase()}</Badge>
              <Badge tone={statusTone[student.status]}>{student.status}</Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button icon={<Receipt size={18} aria-hidden />} onClick={() => navigate(feesPath, { state: { student } })}>View fees</Button>
            {role === "hq" && <Button variant="secondary" icon={<Bank size={18} aria-hidden />} onClick={() => navigate("/admin/top-up")}>Top up</Button>}
          </div>
        </div>
      </Card>

      <div className="grid divide-y divide-line rounded-card border border-line bg-surface-container-lowest sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <Stat label="Account balance" value={formatSGD(student.balance)} />
        <Stat label="Outstanding fees" value={formatSGD(due)} note={`${fees.filter((f) => !f.paid).length} unpaid`} />
        <Stat label="Balance after fees" value={formatSGD(left)} alert={left < 0} note={left < 0 ? "Balance does not cover the fees" : "Balance covers the fees"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card title="Transactions">
          <ul className="divide-y divide-line">
            {entries.map((e) => {
              const credit = e.amount > 0;
              const Icon = credit ? ArrowDownLeft : ArrowUpRight;
              return (
                <li key={e.description} className="flex items-center gap-3 py-3">
                  <span className={`grid size-9 shrink-0 place-items-center rounded-full ${credit ? "bg-success-container text-success" : "bg-track text-on-surface-variant"}`} aria-hidden>
                    <Icon size={16} weight="bold" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-on-surface">{e.description}</div>
                    <div className="text-[13px] text-on-surface-variant">{e.date}</div>
                  </div>
                  <div className={`text-sm font-semibold ${credit ? "text-success" : "text-on-surface"}`}>
                    {credit ? "+" : "-"}{formatSGD(Math.abs(e.amount))}
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>

        <div className="grid content-start gap-6">
          <Card title="Fees" action={<Link to={feesPath} state={{ student }} className="text-[13px] font-medium text-primary">All fees</Link>}>
            <ul className="grid gap-3">
              {fees.map((f) => (
                <li key={f.id} className="flex items-center justify-between gap-3 text-sm">
                  <div>
                    <div className="font-medium text-on-surface">{f.name}</div>
                    <div className="text-[13px] text-on-surface-variant">{cycleLabel(f.cycle)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-on-surface">{formatSGD(f.amount)}</span>
                    <Badge tone={f.paid ? "success" : "warning"}>{f.paid ? "Paid" : "Unpaid"}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Account lifecycle">
            <ProgressBar
              label={`Age ${age} of ${ACCOUNT_CLOSES_AT}`}
              pct={((age - ACCOUNT_OPENS_AT) / (ACCOUNT_CLOSES_AT - ACCOUNT_OPENS_AT)) * 100}
            />
            <p className="mt-3 text-[13px] text-on-surface-variant">
              Opens at {ACCOUNT_OPENS_AT}, closes at {ACCOUNT_CLOSES_AT}. The balance then goes to the CPF account by default.
            </p>
          </Card>

          {role === "school" && (
            <Card title="Financial assistance">
              <div className="flex items-center justify-between text-sm">
                <span>SBFAS</span>
                <Badge tone={SBFAS_TONE[student.sbfas]}>{student.sbfas}</Badge>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
