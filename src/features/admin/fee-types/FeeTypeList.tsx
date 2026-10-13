import { useState } from "react";
import { PencilSimple, Plus, Trash } from "@phosphor-icons/react";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/EmptyState";
import { Field, inputClass } from "../../../components/ui/Field";
import { Modal } from "../../../components/ui/Modal";
import { useFees } from "../../../data/feeStore";
import type { FeeType } from "../../../data/fees";
import { schoolOfLevel } from "../../../data/schoolMgmt";
import { LEVELS, type Level } from "../../../data/students";
import { formatSGD } from "../../../lib/format";
import { TODAY, feeDraftOk, nextFeeTypeId, validateFeeType, type FeeDraft } from "../../../lib/fees";

const FORM_ID = "fee-type-form";
const gray = `${inputClass} cursor-not-allowed bg-surface-container-high text-on-surface-variant`;
const BLANK: FeeDraft = { name: "", level: "", components: [{ name: "", amount: "", on: true }] };
const total = (f: FeeType) => f.components.reduce((t, c) => t + c.amount, 0);

/** School user: set up this school's own fee types (US-013). */
export default function FeeTypeList({ school, onAssign }: { school: string; onAssign: (id: string) => void }) {
  const { state, dispatch } = useFees();
  const mine = state.types.filter((f) => f.school === school);
  const [editing, setEditing] = useState<{ id: string; draft: FeeDraft } | null>(null);
  const [notice, setNotice] = useState("");
  const openNew = () => setEditing({ id: "", draft: BLANK });
  const openEdit = (f: FeeType) => setEditing({ id: f.id, draft: { name: f.name, level: f.level ?? "", components: f.components.map((c) => ({ name: c.name, amount: String(c.amount), on: true })) } });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="text-sm font-medium text-success empty:hidden">{notice}</p>
        <Button icon={<Plus size={18} weight="bold" aria-hidden="true" />} onClick={openNew}>New fee type</Button>
      </div>
      {mine.length === 0 && <Card><EmptyState title="No fee types yet" hint="Create a fee type, then assign it to a class." /></Card>}
      <div className="grid gap-4 lg:grid-cols-2">
        {mine.map((f) => (
          <Card key={f.id} title={f.name} action={<Badge tone="neutral">{f.level ?? "All levels"}</Badge>}>
            <p className="text-3xl font-bold tabular-nums text-on-surface">{formatSGD(total(f))}<span className="text-sm font-medium text-on-surface-variant"> per student</span></p>
            <p className="mb-3 mt-1 text-[13px] text-on-surface-variant">{f.id}, {f.components.length} components, updated {f.updated}, {new Set(state.charges.filter((c) => c.ftId === f.id).map((c) => c.studentId)).size} students charged</p>
            <ul className="flex flex-wrap gap-2">
              {f.components.map((c) => <li key={c.name} className="rounded-full bg-surface-container-low px-3 py-1 text-[13px]">{c.name} <strong className="tabular-nums">{formatSGD(c.amount)}</strong></li>)}
            </ul>
            <div className="mt-4 flex gap-2 border-t border-line pt-4">
              <Button size="sm" variant="secondary" icon={<PencilSimple size={16} aria-hidden="true" />} onClick={() => openEdit(f)}>Edit<span className="sr-only"> {f.name}</span></Button>
              <Button size="sm" variant="ghost" onClick={() => onAssign(f.id)}>Assign to a class</Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? `Edit fee type ${editing.id}` : "New fee type"}
        footer={<><Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button><Button type="submit" form={FORM_ID}>Save fee type</Button></>}
      >
        {editing && (
          <FeeTypeForm
            key={editing.id || "new"}
            school={school}
            initial={editing.draft}
            others={mine.filter((f) => f.id !== editing.id)}
            id={editing.id || nextFeeTypeId(state.types)}
            onSave={(fee) => {
              dispatch({ type: "saveType", fee });
              setNotice(editing.id ? "Fee type updated. Issued charges keep their original amounts." : "Fee type created. Next, assign it to a class to generate charges.");
              setEditing(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
}

function FeeTypeForm({ school, initial, others, id, onSave }: { school: string; initial: FeeDraft; others: FeeType[]; id: string; onSave: (f: FeeType) => void }) {
  const [d, setD] = useState(initial);
  const [tried, setTried] = useState(false);
  const { errors, components } = validateFeeType(d, others);
  const levels = LEVELS.filter((l) => schoolOfLevel(l) === school);
  const setRow = (i: number, p: Partial<FeeDraft["components"][number]>) => setD((x) => ({ ...x, components: x.components.map((c, j) => (j === i ? { ...c, ...p } : c)) }));
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!feeDraftOk(errors)) return;
    onSave({ id, school, name: d.name.trim().replace(/\s+/g, " "), level: (d.level || undefined) as Level | undefined, components, updated: TODAY });
  };
  const sum = components.reduce((t, c) => t + c.amount, 0);

  return (
    <form id={FORM_ID} onSubmit={submit} noValidate className="grid gap-4">
      <Field label="Fee type ID" hint={initial.name ? undefined : "Generated automatically on save"}>
        <input className={gray} value={id} readOnly disabled />
      </Field>
      <Field required label="Fee type name" error={tried ? errors.name : ""}>
        <input className={inputClass} placeholder="e.g. School Fees (Secondary)" value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} />
      </Field>
      <Field label="Level / cohort (optional)" hint="Leave as All levels to offer this fee to every class.">
        <select className={inputClass} value={d.level} onChange={(e) => setD({ ...d, level: e.target.value })}>
          <option value="">All levels</option>
          {levels.map((l) => <option key={l}>{l}</option>)}
        </select>
      </Field>
      <fieldset>
        <legend className="mb-1.5 text-[13px] font-semibold">Components <span aria-hidden className="text-alert">*</span> <span className="font-normal text-on-surface-variant">(tick to include)</span></legend>
        <div className="grid gap-2">
          {d.components.map((c, i) => (
            <div key={i} className={`flex items-center gap-2 ${c.on ? "" : "opacity-50"}`}>
              <input type="checkbox" className="size-5 shrink-0 accent-primary" checked={c.on} onChange={(e) => setRow(i, { on: e.target.checked })} aria-label={`Include component ${i + 1}`} />
              <input className={inputClass} aria-label={`Component ${i + 1} name`} placeholder="Component name" value={c.name} onChange={(e) => setRow(i, { name: e.target.value })} aria-invalid={tried && !!errors.rows[i]} />
              <input className={inputClass.replace("w-full", "w-28 shrink-0")} aria-label={`Component ${i + 1} amount`} inputMode="decimal" placeholder="Amount" value={c.amount} onChange={(e) => setRow(i, { amount: e.target.value })} aria-invalid={tried && !!errors.rows[i]} />
              <Button size="sm" variant="ghost" aria-label={`Remove component ${i + 1}`} onClick={() => setD((x) => ({ ...x, components: x.components.length > 1 ? x.components.filter((_, j) => j !== i) : [{ name: "", amount: "", on: true }] }))}><Trash size={16} aria-hidden="true" /></Button>
            </div>
          ))}
        </div>
        <Button size="sm" variant="secondary" className="mt-2" onClick={() => setD((x) => ({ ...x, components: [...x.components, { name: "", amount: "", on: true }] }))}>+ Add component</Button>
        <p className="mt-1.5 text-[13px] text-on-surface-variant">{components.length} of {d.components.length} included, total {formatSGD(sum)}</p>
        {tried && errors.components && <p role="alert" className="mt-1 text-[13px] font-medium text-alert">{errors.components}</p>}
        {tried && Object.keys(errors.rows).length > 0 && <p role="alert" className="mt-1 text-[13px] font-medium text-alert">Each included component needs a name and an amount above 0 (max 2 decimals).</p>}
      </fieldset>
      <p className="rounded-control border border-line bg-warning-container px-3 py-2 text-[13px] text-warning">Issued charges are not affected. Saving only applies to charges generated from now on.</p>
    </form>
  );
}
