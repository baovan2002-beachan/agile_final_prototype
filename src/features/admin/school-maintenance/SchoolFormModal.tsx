import { useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Field, inputClass } from "../../../components/ui/Field";
import { Modal } from "../../../components/ui/Modal";
import type { SchoolRecord } from "../../../data/schoolMgmt";
import { validateSchool, type SchoolInput } from "../../../lib/schoolMgmt";

const EMPTY: SchoolInput = { code: "", name: "", level: "", address: "", principal: "" };
export const SCHOOL_TYPES = ["Primary", "Secondary", "Junior College"] as const;
type Props = { open: boolean; editing: SchoolRecord | null; all: SchoolRecord[]; onClose: () => void; onSave: (s: SchoolRecord) => void };

export default function SchoolFormModal({ open, editing, all, onClose, onSave }: Props) {
  const [v, setV] = useState<SchoolInput>(editing ?? EMPTY);
  const [active, setActive] = useState(editing?.active ?? true);
  const [submitted, setSubmitted] = useState(false);
  const others = all.filter((s) => s.code !== editing?.code);
  const errors = submitted ? validateSchool(v, others) : {};
  const set = (k: keyof SchoolInput) => (e: { target: { value: string } }) => setV((p) => ({ ...p, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(validateSchool(v, others)).length) return;
    onSave({
      code: v.code.trim().toUpperCase(),
      name: v.name.trim().replace(/\s+/g, " "),
      level: v.level as SchoolRecord["level"],
      address: v.address.trim(),
      principal: v.principal.trim(),
      students: editing?.students ?? 0,
      active,
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? `Edit ${editing.name}` : "Add school"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="school-form">Save school</Button>
        </>
      }
    >
      <form id="school-form" onSubmit={submit} noValidate className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="School code" error={errors.code} hint="Format S001">
            <input className={inputClass} value={v.code} onChange={set("code")} disabled={!!editing} />
          </Field>
          <Field label="School type" error={errors.level}>
            <select className={inputClass} value={v.level} onChange={set("level")}>
              <option value="">Select type</option>
              {SCHOOL_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
        </div>
        <Field label="School name" error={errors.name}>
          <input className={inputClass} value={v.name} onChange={set("name")} />
        </Field>
        <Field label="Address" error={errors.address}>
          <input className={inputClass} value={v.address} onChange={set("address")} />
        </Field>
        <Field label="Principal" error={errors.principal}>
          <input className={inputClass} value={v.principal} onChange={set("principal")} />
        </Field>
        {editing && (
          <label className="flex min-h-11 items-center gap-3 text-sm">
            <input type="checkbox" className="size-5 accent-primary" checked={active} onChange={(e) => setActive(e.target.checked)} />
            School is active
          </label>
        )}
      </form>
    </Modal>
  );
}
