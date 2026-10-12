import { ArrowsClockwise } from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Field, inputClass } from "../../../components/ui/Field";
import { BANDS, household } from "../../../data/familyFas";
import { fmtDate } from "../overview/shared";
import type { SyncStatus } from "./logic";
import { AssumptionTag } from "./shared";
import type { Outcome } from "./useSync";

type Props = { status: SyncStatus; bandId: string; syncedOn: string; onSync: (o: Outcome) => void };

export function Household({ status, bandId, syncedOn, onSync }: Props) {
  const [outcome, setOutcome] = useState<Outcome>("b2");
  const band = BANDS.find((b) => b.id === bandId);
  const loading = status === "loading";
  return (
    <Card title="Household">
      <ul className="divide-y divide-line">
        {household.map((m) => (
          <li key={m.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3 first:pt-0">
            <div>
              <p className="text-sm font-semibold">{m.name}</p>
              <p className="text-[13px] text-on-surface-variant">{m.detail}</p>
            </div>
            <span className="text-[13px] font-medium text-on-surface-variant">{m.role}</span>
          </li>
        ))}
      </ul>
      <div className="mt-2 rounded-control border border-line bg-surface-container-low p-4">
        <p className="text-[13px] font-semibold text-on-surface-variant">Household income band (SingPass)</p>
        <p className="mt-1 text-lg font-bold">{band?.label ?? "Not synced"}</p>
        <p className="text-[13px] text-on-surface-variant">Only a band is shared with MOE, never exact income. Last synced {fmtDate(syncedOn)}.</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button size="sm" variant="secondary" disabled={loading} onClick={() => onSync(outcome)} icon={<ArrowsClockwise size={16} weight="bold" aria-hidden="true" className={loading ? "animate-spin" : ""} />}>
            {loading ? "Syncing..." : status === "error" ? "Retry sync" : "Sync income band"}
          </Button>
          <p role="status" className={`text-[13px] font-medium ${status === "error" ? "text-alert" : "text-success"}`}>
            {status === "success" && "Income band synced from SingPass."}
            {status === "error" && "SingPass did not respond. Your previous band is kept. Try again."}
          </p>
        </div>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <Field label="Demo: next sync outcome" className="w-full max-w-72">
            <select className={inputClass} value={outcome} onChange={(e) => setOutcome(e.target.value as Outcome)}>
              <option value="b2">Succeeds - band $751 to $1,000</option>
              <option value="b3">Succeeds - band $1,001 to $1,500</option>
              <option value="fail">Fails (then retry)</option>
            </select>
          </Field>
          <span className="pb-3"><AssumptionTag /></span>
        </div>
      </div>
    </Card>
  );
}
