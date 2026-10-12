import { useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Field, inputClass } from "../../../components/ui/Field";
import { Modal } from "../../../components/ui/Modal";
import { formatSGD } from "../../../lib/format";

export type Target = { id: string; label: string; budget: number };
type Props = { open: boolean; onClose: () => void; targets: Target[]; onSave: (id: string, amount: number) => void };

/** Validated positive amount (max 2 decimals); null if invalid. */
export function parseAmount(raw: string): number | null {
  const s = raw.replace(/[,\s]/g, "").replace(/^S\$/i, "");
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
  const n = Number(s);
  return n > 0 && n <= 1e10 ? n : null;
}

function Form({ onClose, targets, onSave }: Omit<Props, "open">) {
  const [id, setId] = useState(targets[0].id);
  const [raw, setRaw] = useState("");
  const [error, setError] = useState("");
  const current = targets.find((t) => t.id === id)!;

  const submit = () => {
    const n = parseAmount(raw);
    if (n === null) return setError("Enter an amount greater than 0, for example 125000");
    onSave(id, n);
    onClose();
  };

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="space-y-4"
    >
      {targets.length > 1 && (
        <Field label="Level">
          <select
            className={inputClass}
            value={id}
            onChange={(e) => {
              setId(e.target.value);
              setError("");
            }}
          >
            {targets.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </Field>
      )}
      <Field label="New budget (S$)" hint={`Current: ${formatSGD(current.budget)}`} error={error}>
        <input
          className={inputClass}
          inputMode="decimal"
          autoComplete="off"
          autoFocus
          value={raw}
          onChange={(e) => {
            setRaw(e.target.value);
            setError("");
          }}
        />
      </Field>
      <p className="text-[13px] text-on-surface-variant">Prototype only: the change is kept on this page and is not saved.</p>
      <div className="flex flex-wrap justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit">Save budget</Button>
      </div>
    </form>
  );
}

export function SetBudgetModal({ open, onClose, targets, onSave }: Props) {
  return (
    <Modal open={open} onClose={onClose} title="Set budget">
      {/* Mounted only while open so the form state resets on every open. */}
      {open && <Form onClose={onClose} targets={targets} onSave={onSave} />}
    </Modal>
  );
}
