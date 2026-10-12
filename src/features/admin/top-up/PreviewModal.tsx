import { useState } from "react";
import { WarningCircle } from "@phosphor-icons/react";
import { AssumptionTag } from "../../../components/ui/AssumptionTag";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import type { Account, Schedule } from "../../../data/topup";
import { formatSGD } from "../../../lib/format";
import { totalFunds, type TopUpRule } from "../../../lib/topup";

export const SCHEDULE_LABEL: Record<Schedule, string> = { now: "Run now (ad-hoc)", monthly: "Monthly", quarterly: "Quarterly", yearly: "Yearly" };

/** Snapshot taken at Preview time: `spec` is the numeric rule, so later form edits cannot change what gets executed. */
export type Draft = { title: string; fundTag: string; schedule: Schedule; amount: number; spec: TopUpRule; rule: string[] };

type Props = { draft: Draft | null; eligible: Account[]; onClose: () => void; onExecute: () => void };

function Dt({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[13px] text-on-surface-variant">{label}</dt>
      <dd className="mt-0.5 font-semibold text-on-surface">{children}</dd>
    </div>
  );
}

export function PreviewModal({ draft, eligible, onClose, onExecute }: Props) {
  const [signed, setSigned] = useState(false);
  const count = eligible.length;
  const total = draft ? totalFunds(count, draft.amount) : 0;
  const blocked = count === 0;

  const close = () => {
    setSigned(false);
    onClose();
  };
  const execute = () => {
    setSigned(false);
    onExecute();
  };

  return (
    <Modal
      open={draft !== null}
      onClose={close}
      title="Review top-up before execution"
      footer={
        <>
          <Button variant="secondary" onClick={close}>Cancel</Button>
          <Button onClick={execute} disabled={blocked || !signed} aria-describedby="topup-exec-help">
            Execute top-up
          </Button>
        </>
      }
    >
      {draft && (
        <div className="space-y-5">
          <p className="text-base font-bold text-on-surface" aria-live="polite">
            Preview: {count} eligible {count === 1 ? "account" : "accounts"}
          </p>

          {blocked && (
            <p className="flex items-start gap-2 rounded-control border border-line bg-error-container px-3 py-2 text-sm font-medium text-on-error-container">
              <WarningCircle size={18} weight="bold" aria-hidden="true" className="mt-0.5 shrink-0" />
              <span>No account matches these rules, so there is nothing to execute. Go back and widen the age or balance range, or switch off a filter.</span>
            </p>
          )}

          <dl className="grid grid-cols-2 gap-4">
            <Dt label="Title">{draft.title}</Dt>
            <Dt label="Fund tag">{draft.fundTag}</Dt>
            <Dt label="Amount per account">{formatSGD(draft.amount)}</Dt>
            <Dt label="Schedule">{SCHEDULE_LABEL[draft.schedule]}</Dt>
            <Dt label="Treasury funds required">{formatSGD(total)}</Dt>
            <Dt label="Calculation">{count} x {formatSGD(draft.amount)}</Dt>
          </dl>

          <div>
            <p className="text-[13px] text-on-surface-variant">Rules applied</p>
            <ul className="mt-1 list-disc pl-5 text-on-surface">
              {draft.rule.map((r) => <li key={r}>{r}</li>)}
            </ul>
          </div>

          {!blocked && (
            <div>
              <p className="text-[13px] text-on-surface-variant">Sample of eligible accounts (first {Math.min(5, count)} of {count})</p>
              <ul className="mt-1 divide-y divide-line rounded-control border border-line text-on-surface">
                {eligible.slice(0, 5).map((a) => (
                  <li key={a.id} className="flex justify-between gap-3 px-3 py-1.5">
                    <span>{a.name} <span className="text-on-surface-variant">({a.id}, age {a.age})</span></span>
                    <span className="tabular-nums">{formatSGD(a.balance)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ASSUMPTION: dual sign-off is one confirmation checkbox; the real second-officer approval flow is undefined. */}
          <div className="rounded-control border border-line bg-surface-container-low p-4">
            <label className="flex min-h-11 cursor-pointer items-start gap-3 text-on-surface">
              <input
                type="checkbox"
                checked={signed}
                onChange={(e) => setSigned(e.target.checked)}
                className="mt-0.5 size-5 shrink-0 accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              />
              <span className="font-semibold">Dual sign-off confirmed: a second authorised officer has approved this top-up (required)</span>
            </label>
            <p id="topup-exec-help" className="mt-2 text-[13px]">
              <span className="mr-2"><AssumptionTag /></span>
              {blocked
                ? "Execute is disabled because no accounts are eligible."
                : signed
                  ? "Ready to execute."
                  : "Execute stays disabled until sign-off is confirmed. The real approval flow (second officer, audit trail) is not defined yet."}
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}
