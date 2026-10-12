import { useState } from "react";
import { Lock, PencilSimple, Plus, WarningCircle } from "@phosphor-icons/react";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { DataTable, type Column } from "../../../components/ui/DataTable";
import { EmptyState } from "../../../components/ui/EmptyState";
import { Modal } from "../../../components/ui/Modal";
import { formatSGD } from "../../../lib/format";
import { useMockQuery } from "../../../lib/useMockQuery";
import { useSession } from "../../../session";
import { FEE_TYPES, cycleLabel, exceedsCeiling, per, type FeeType } from "../../../data/fees";
import { CeilingWarning } from "./CeilingWarning";
import { EDIT_FORM_ID, EditRateForm, NewFeeForm } from "./RateForms";

const ceilingCols: Column<FeeType>[] = [
  { key: "name", header: "Fee type", sortable: true },
  { key: "cycle", header: "Cycle", render: (f) => cycleLabel(f.cycle) },
  ...(["citizen", "pr", "international"] as const).map((k): Column<FeeType> => ({
    key: k,
    header: { citizen: "Citizen", pr: "PR", international: "International" }[k],
    align: "right",
    render: (f) => (f.ceiling ? formatSGD(f.ceiling[k]) : "-"),
  })),
];

export default function FeeTypes() {
  const { role } = useSession();
  const hq = role === "hq";
  const q = useMockQuery(FEE_TYPES);
  const [added, setAdded] = useState<FeeType[]>([]);
  const [edits, setEdits] = useState<Record<string, number>>({});
  const [editing, setEditing] = useState<FeeType | null>(null);
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState("");

  if (q.status === "loading") {
    return (
      <div aria-busy="true" aria-label="Loading fee types" className="grid gap-4 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => <div key={i} className="h-40 animate-pulse rounded-card bg-track" />)}
      </div>
    );
  }
  if (q.status === "error" || !q.data) {
    return (
      <Card>
        <EmptyState as="h2" title="Could not load fee types" hint="Please try again." action={<Button onClick={q.retry}>Retry</Button>} />
      </Card>
    );
  }

  const fees = [...q.data, ...added].map((f) => (f.id in edits ? { ...f, amount: edits[f.id] } : f));
  const flagged = fees.filter(exceedsCeiling);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm text-on-surface-variant">
          {hq ? "Review school fee rates against the locked national ceilings." : "Set the fee rates your school charges per billing cycle."}
        </p>
        <Button icon={<Plus size={18} weight="bold" aria-hidden="true" />} onClick={() => setCreating(true)}>
          Configure new fee type
        </Button>
      </div>

      <div role="status">{notice && <p className="text-sm font-medium text-success">{notice}</p>}</div>

      {flagged.length > 0 && (
        <div role="alert" className="flex flex-wrap items-center gap-2 rounded-card border border-alert bg-error-container px-4 py-3 text-sm text-on-error-container">
          <WarningCircle size={18} weight="bold" aria-hidden="true" />
          {flagged.length} fee {flagged.length > 1 ? "types are" : "type is"} above the national ceiling: {flagged.map((f) => f.name).join(", ")}.
          <Badge tone="primary">Assumption</Badge>
        </div>
      )}

      {fees.length === 0 ? (
        <Card>
          <EmptyState
            as="h2"
            title="No fee types yet"
            hint="Configure a fee type to start charging students."
            action={<Button onClick={() => setCreating(true)}>Configure new fee type</Button>}
          />
        </Card>
      ) : (
      <section aria-labelledby="fees-h" className="grid gap-4 sm:grid-cols-2">
        <h2 id="fees-h" className="sr-only">Fee types</h2>
        {fees.map((f) => (
          <Card key={f.id}>
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-[15px] font-semibold text-on-surface">{f.name}</h3>
              <Badge tone="neutral">{cycleLabel(f.cycle)}</Badge>
            </div>
            <p className="mt-3 text-3xl font-bold tabular-nums text-on-surface">
              {formatSGD(f.amount)}<span className="text-sm font-medium text-on-surface-variant"> {per(f.cycle)}</span>
            </p>
            {exceedsCeiling(f) && <div className="mt-3"><CeilingWarning fee={f} /></div>}
            {hq && (
              <p className="mt-3 flex items-center gap-1.5 text-[13px] text-on-surface-variant">
                <Lock size={14} weight="bold" aria-hidden="true" />
                {f.ceiling ? `Citizen ceiling ${formatSGD(f.ceiling.citizen)}${per(f.cycle)}` : "No national ceiling set"}
              </p>
            )}
            <div className="mt-4">
              <Button variant="secondary" size="sm" icon={<PencilSimple size={16} aria-hidden="true" />} onClick={() => setEditing(f)}>
                Edit rate<span className="sr-only"> for {f.name}</span>
              </Button>
            </div>
          </Card>
        ))}
      </section>
      )}

      {hq && fees.length > 0 && (
        <Card
          title="National ceilings"
          action={<Badge tone="neutral">Locked</Badge>}
        >
          <p className="mb-3 flex items-center gap-1.5 text-[13px] text-on-surface-variant">
            <Lock size={14} weight="bold" aria-hidden="true" />
            Set nationally and not editable here. Ceiling rule is an <Badge tone="primary">Assumption</Badge>
          </p>
          <DataTable
            columns={ceilingCols}
            rows={fees}
            rowKey={(f) => f.id}
            empty={<EmptyState title="No ceilings" />}
          />
        </Card>
      )}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing ? `Edit rate - ${editing.name}` : "Edit rate"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" form={EDIT_FORM_ID}>Save rate</Button>
          </>
        }
      >
        {editing && (
          <EditRateForm
            key={editing.id}
            fee={fees.find((f) => f.id === editing.id) ?? editing}
            onSave={(v) => {
              setEdits((e) => ({ ...e, [editing.id]: v }));
              setNotice(`${editing.name} rate updated to ${formatSGD(v)}${per(editing.cycle)}.`);
              setEditing(null);
            }}
          />
        )}
      </Modal>

      <Modal open={creating} onClose={() => setCreating(false)} title="Configure new fee type">
        {creating && (
          <NewFeeForm
            fees={fees}
            onCancel={() => setCreating(false)}
            onAdd={(f) => {
              setAdded((a) => [...a, f]);
              setNotice(`${f.name} added.`);
              setCreating(false);
            }}
          />
        )}
      </Modal>
    </div>
  );
}
