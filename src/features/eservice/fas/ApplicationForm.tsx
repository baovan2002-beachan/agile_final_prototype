import { PaperPlaneTilt, Sparkle } from "@phosphor-icons/react";
import { useRef, useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Field, inputClass } from "../../../components/ui/Field";
import { application, circumstances } from "../../../data/familyFas";
import { fmtDate } from "../overview/shared";
import { validateForm, type FormValues } from "./logic";
import { AssumptionTag } from "../../../components/ui/AssumptionTag";
import { TODAY } from "./shared";

type Props = { values: FormValues; onChange: (v: FormValues) => void; filledNote: string; onAskAi: () => void };

export function ApplicationForm({ values, onChange, filledNote, onAskAi }: Props) {
  const [tried, setTried] = useState(false);
  const [consent, setConsent] = useState(false);
  const [sentOn, setSentOn] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // After the first submit attempt, errors re-evaluate live, so they also clear when the AI helper fills a field.
  const errors = tried ? validateForm(values, consent) : {};
  const set = (k: keyof FormValues) => (e: { target: { value: string } }) => {
    setSentOn(null);
    onChange({ ...values, [k]: e.target.value });
  };

  function submit(e: FormEvent) {
    e.preventDefault();
    setTried(true);
    const first = Object.keys(validateForm(values, consent))[0]; // key order = field order on screen
    setSentOn(first ? null : TODAY);
    if (first) (formRef.current?.elements.namedItem(first) as HTMLElement | null)?.focus();
  }

  return (
    <Card
      title="Family application details"
      action={<Button size="sm" variant="secondary" icon={<Sparkle size={16} weight="bold" aria-hidden="true" />} onClick={onAskAi}>Ask AI helper</Button>}
    >
      <p className="text-sm text-on-surface-variant">
        One form for the whole family ({application.id}). Update the details the bursar needs; you can resubmit while review is in progress. <AssumptionTag />
      </p>
      <p role="status" className={filledNote ? "mt-3 rounded-control bg-primary-fixed px-3 py-2 text-[13px] font-medium text-on-primary-fixed" : ""}>{filledNote}</p>
      <form ref={formRef} noValidate onSubmit={submit} className="mt-4 space-y-4">
        <Field label="Contact number" error={errors.contact} hint="Singapore number, e.g. +65 9123 4567">
          <input name="contact" type="tel" autoComplete="tel" className={inputClass} value={values.contact} onChange={set("contact")} />
        </Field>
        <Field label="Mailing address" error={errors.mailingAddress}>
          <input name="mailingAddress" autoComplete="street-address" className={inputClass} value={values.mailingAddress} onChange={set("mailingAddress")} />
        </Field>
        <Field label="What best describes your situation?" error={errors.circumstance}>
          <select name="circumstance" className={inputClass} value={values.circumstance} onChange={set("circumstance")}>
            <option value="">Choose one</option>
            {circumstances.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Anything else the bursar should know? (optional)">
          <textarea name="note" rows={3} className={`${inputClass} py-2`} value={values.note} onChange={set("note")} />
        </Field>
        <div>
          <label className="flex min-h-11 items-start gap-3 text-sm">
            <input
              type="checkbox"
              name="consent"
              checked={consent}
              aria-invalid={Boolean(errors.consent)}
              aria-describedby={errors.consent ? "consent-err" : undefined}
              onChange={(e) => { setConsent(e.target.checked); setSentOn(null); }}
              className="mt-0.5 size-5 shrink-0 accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            />
            I consent to MOE retrieving my household income band from SingPass and sharing this application with my children's schools.
          </label>
          {errors.consent && <p id="consent-err" role="alert" className="mt-1.5 text-[13px] font-medium text-alert">{errors.consent}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" icon={<PaperPlaneTilt size={18} weight="bold" aria-hidden="true" />}>Submit application</Button>
          <p role="status" className="text-sm font-medium text-success">{sentOn && `Submitted on ${fmtDate(sentOn)}. Review continues.`}</p>
        </div>
      </form>
    </Card>
  );
}
