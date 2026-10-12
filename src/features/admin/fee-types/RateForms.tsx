import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Field, inputClass } from "../../../components/ui/Field";
import { CYCLES, normalizeName, per, validateName, validateRate, type Cycle, type FeeType } from "../../../data/fees";
import { CeilingWarning } from "./CeilingWarning";

/** Focus the first field once the dialog is open (React autoFocus runs before showModal(), so it is lost). */
function useFocusOnOpen() {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const id = setTimeout(() => ref.current?.focus(), 0);
    return () => clearTimeout(id);
  }, []);
  return ref;
}

export const EDIT_FORM_ID = "edit-rate-form";

export function EditRateForm({ fee, onSave }: { fee: FeeType; onSave: (v: number) => void }) {
  const [raw, setRaw] = useState(String(fee.amount));
  const [error, setError] = useState<string>();
  const first = useFocusOnOpen();
  const parsed = validateRate(raw);
  const over = parsed.value !== undefined && !!fee.ceiling && parsed.value > fee.ceiling.citizen;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (parsed.error) return setError(parsed.error);
    onSave(parsed.value!);
  };
  return (
    <form id={EDIT_FORM_ID} onSubmit={submit} noValidate>
      <Field label={`Rate (S$${per(fee.cycle)})`} error={error} hint="Positive amount, up to 2 decimals.">
        <input
          className={inputClass}
          inputMode="decimal"
          value={raw}
          onChange={(e) => { setRaw(e.target.value); setError(undefined); }}
          ref={first}
        />
      </Field>
      {/* live region stays mounted so the warning is announced when it appears */}
      <div role="status" className={over ? "mt-3" : undefined}>{over && <CeilingWarning fee={fee} />}</div>
    </form>
  );
}

export function NewFeeForm({ fees, onAdd, onCancel }: { fees: FeeType[]; onAdd: (f: FeeType) => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [cycle, setCycle] = useState<Cycle | "">("");
  const first = useFocusOnOpen();
  const [errs, setErrs] = useState<{ name?: string; amount?: string; cycle?: string }>({});

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const rate = validateRate(amount);
    const next = { name: validateName(name, fees), amount: rate.error, cycle: cycle ? undefined : "Choose a billing cycle." };
    setErrs(next);
    if (next.name || next.amount || next.cycle) return;
    onAdd({ id: `fee-${Date.now()}`, name: normalizeName(name), amount: rate.value!, cycle: cycle as Cycle });
  };
  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      <Field label="Fee name" error={errs.name}>
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} ref={first} />
      </Field>
      <Field label="Amount (S$)" error={errs.amount} hint="Positive amount, up to 2 decimals.">
        <input className={inputClass} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </Field>
      <Field label="Billing cycle" error={errs.cycle}>
        <select className={inputClass} value={cycle} onChange={(e) => setCycle(e.target.value as Cycle)}>
          <option value="">Select a cycle</option>
          {CYCLES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </Field>
      <div className="flex flex-wrap justify-end gap-3">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Add fee type</Button>
      </div>
    </form>
  );
}
