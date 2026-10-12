import { useEffect, useRef, useState } from "react";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Field, inputClass } from "../../../components/ui/Field";
import { Modal } from "../../../components/ui/Modal";
import { CLASSES, LEVELS, type Level } from "../../../data/students";
import { validateNewStudent, type NewStudentInput } from "./logic";

const EMPTY: NewStudentInput = { name: "", dob: "", level: "", class: "" };
const FORM_ID = "add-student-form";

type Props = { open: boolean; onClose: () => void; onAdd: (s: { name: string; level: Level; class: string }) => void };

export default function AddStudentModal({ open, onClose, onAdd }: Props) {
  const [v, setV] = useState(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const [failedTick, setFailedTick] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  // Errors are shown only after the first submit attempt, then update live.
  const errors = submitted ? validateNewStudent(v) : {};
  const set = (k: keyof NewStudentInput) => (e: { target: { value: string } }) =>
    setV((p) => ({ ...p, [k]: e.target.value, ...(k === "level" ? { class: "" } : {}) }));

  // After a failed submit, move focus to the first invalid field (runs once errors have rendered).
  useEffect(() => {
    if (failedTick) formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [failedTick]);

  const close = () => {
    setV(EMPTY);
    setSubmitted(false);
    setFailedTick(0);
    onClose();
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(validateNewStudent(v)).length) return setFailedTick((t) => t + 1);
    onAdd({ name: v.name, level: v.level as Level, class: v.class });
    close();
  };
  const classes = LEVELS.includes(v.level as Level) ? CLASSES[v.level as Level] : [];

  return (
    <Modal
      open={open}
      onClose={close}
      title="Add student"
      footer={
        <>
          <Button variant="secondary" onClick={close}>Cancel</Button>
          <Button type="submit" form={FORM_ID}>Add student</Button>
        </>
      }
    >
      <form ref={formRef} id={FORM_ID} onSubmit={submit} noValidate className="grid gap-4">
        <Field label="Full name" error={errors.name}>
          <input className={inputClass} value={v.name} onChange={set("name")} autoComplete="off" />
        </Field>
        <div>
          <Field label="Date of birth" error={errors.dob}>
            <input type="date" className={inputClass} value={v.dob} max={new Date().toLocaleDateString("en-CA")} onChange={set("dob")} />
          </Field>
          <p className="mt-1.5 flex flex-wrap items-center gap-2 text-[13px]">
            <Badge tone="primary">Assumption</Badge>
            Student age must be 6 to 16.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Level" error={errors.level}>
            <select className={inputClass} value={v.level} onChange={set("level")}>
              <option value="">Select level</option>
              {LEVELS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </Field>
          <Field label="Class" error={errors.class}>
            <select className={inputClass} value={v.class} onChange={set("class")}>
              <option value="">Select class</option>
              {classes.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
        </div>
        <p className="flex flex-wrap items-center gap-2 text-[13px]">
          <Badge tone="primary">Assumption</Badge>
          New students start as Active with a S$0.00 balance and SBFAS "Not applied".
        </p>
      </form>
    </Modal>
  );
}
