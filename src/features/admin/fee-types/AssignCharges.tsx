import { useState } from "react";
import { CheckCircle } from "@phosphor-icons/react";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/EmptyState";
import { Field, inputClass } from "../../../components/ui/Field";
import { useFees } from "../../../data/feeStore";
import { TERMS } from "../../../data/fees";
import { CLASS_RECORDS } from "../../../data/schoolMgmt";
import { formatSGD } from "../../../lib/format";
import { alreadyCharged, studentsOfClass } from "../../../lib/fees";

type Result = { created: number; skipped: number; klass: string; fee: string; term: string };

/** School user: assign a fee type to a class and issue one unpaid charge per student for a term (US-014). Duplicates are skipped. */
export default function AssignCharges({ school, presetFee }: { school: string; presetFee: string }) {
  const { state, dispatch } = useFees();
  const [level, setLevel] = useState("");
  const [klass, setKlass] = useState("");
  const [feeId, setFeeId] = useState(presetFee);
  const [term, setTerm] = useState(TERMS[0]);
  const [result, setResult] = useState<Result | null>(null);

  const fees = state.types.filter((f) => f.school === school);
  const fee = fees.find((f) => f.id === feeId);
  const all = CLASS_RECORDS.filter((c) => c.school === school);
  const levels = [...new Set(all.map((c) => c.level))];
  // A level-specific fee type only offers that level's classes.
  const classes = all.filter((c) => (!level || c.level === level) && (!fee?.level || c.level === fee.level));
  const picked = classes.find((c) => c.name === klass);
  const preview = picked && fee ? studentsOfClass(school, picked.name).map((s) => ({ s, dup: alreadyCharged(state.charges, s.id, fee, term) })) : [];
  const creatable = preview.filter((p) => !p.dup);

  const generate = () => {
    if (!picked || !fee || !creatable.length) return;
    dispatch({ type: "generate", fee, term, students: creatable.map((p) => p.s) });
    setResult({ created: creatable.length, skipped: preview.length - creatable.length, klass: `${picked.level}, ${picked.name}`, fee: fee.name, term });
  };
  const reset = () => setResult(null);

  const touched = !!(level || klass || feeId || term !== TERMS[0]);
  const clear = () => { setLevel(""); setKlass(""); setFeeId(""); setTerm(TERMS[0]); setResult(null); };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-start">
        <Card title="1. Choose" action={touched ? <Button size="sm" variant="ghost" onClick={clear}>Clear filters</Button> : undefined}>
          <div className="grid gap-4">
            <Field required label="Fee type" hint={fee?.level ? `Applies to ${fee.level} only.` : undefined}>
              <select className={inputClass} value={feeId} onChange={(e) => { setFeeId(e.target.value); setKlass(""); reset(); }}>
                <option value="">Select a fee type</option>
                {fees.map((f) => <option key={f.id} value={f.id}>{f.name}{f.level ? ` (${f.level})` : ""}</option>)}
              </select>
            </Field>
            <Field label="Level / cohort (optional)" hint="Narrows the class list.">
              <select className={inputClass} value={level} onChange={(e) => { setLevel(e.target.value); setKlass(""); reset(); }}>
                <option value="">All levels</option>
                {levels.map((l) => <option key={l}>{l}</option>)}
              </select>
            </Field>
            <Field required label="Class">
              <select className={inputClass} value={klass} onChange={(e) => { setKlass(e.target.value); reset(); }}>
                <option value="">Select a class</option>
                {classes.map((c) => <option key={c.name} value={c.name}>{c.name}{level ? "" : `, ${c.level}`}</option>)}
              </select>
            </Field>
            <Field required label="Term">
              <select className={inputClass} value={term} onChange={(e) => { setTerm(e.target.value); reset(); }}>
                {TERMS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
          </div>
        </Card>

        <Card title="2. Preview and generate">
          {picked && fee ? (
            <>
              <p className="mb-3 text-sm">
                <strong>{fee.name}</strong> to <strong>{picked.name}</strong> ({picked.level}), {term}. Each student is charged{" "}
                <strong className="text-primary">{formatSGD(fee.components.reduce((t, c) => t + c.amount, 0))}</strong>.
              </p>
              <ul className="max-h-80 divide-y divide-line overflow-auto rounded-control border border-line text-sm">
                {preview.map(({ s, dup }) => (
                  <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
                    <span>{s.name} <span className="text-on-surface-variant">({s.id})</span></span>
                    {dup ? <Badge tone="neutral">Already charged, skipped</Badge> : <Badge tone="success">New charge (unpaid)</Badge>}
                  </li>
                ))}
                {!preview.length && <li className="px-3 py-3 text-on-surface-variant">No students in this class.</li>}
              </ul>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button onClick={generate} disabled={!creatable.length}>Generate {creatable.length} {creatable.length === 1 ? "charge" : "charges"}</Button>
                <span className="text-[13px] text-on-surface-variant">{creatable.length} to create, {preview.length - creatable.length} already charged (skipped)</span>
              </div>
            </>
          ) : (
            <EmptyState title="Nothing to preview yet" hint="Pick a fee type and a class on the left." />
          )}
        </Card>
      </div>

      {result && (
        <p role="status" className="flex items-center gap-2 rounded-card border border-line bg-success-container px-4 py-3 text-sm font-medium text-success">
          <CheckCircle size={18} weight="bold" aria-hidden="true" />
          Created {result.created}, skipped {result.skipped}: {result.klass}, {result.fee}, {result.term}. Charges are unpaid and appear under Student fees.
        </p>
      )}
    </div>
  );
}
