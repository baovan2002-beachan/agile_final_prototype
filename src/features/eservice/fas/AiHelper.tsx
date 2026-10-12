import { useEffect, useRef, useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { questions } from "../../../data/familyFas";
import { answersToForm, autoFill, type FormValues } from "./logic";
import { AssumptionTag } from "../../../components/ui/AssumptionTag";

type Props = { open: boolean; onClose: () => void; values: FormValues; onFill: (v: FormValues, note: string) => void };
type Answers = Partial<Record<(typeof questions)[number]["id"], string>>;

const check = "Check every field before you submit.";

/** ASSUMPTION: mock AI. Asks one canned question at a time; the parent picks an option. */
export function AiHelper({ open, onClose, values, onFill }: Props) {
  const [answers, setAnswers] = useState<Answers>({});
  const heading = useRef<HTMLParagraphElement>(null);
  const step = questions.findIndex((q) => !answers[q.id]);
  const q = step === -1 ? null : questions[step];
  const answered = Object.keys(answers).length;

  // Every close path (X, Esc, backdrop, apply, auto-fill) leaves the flow reset for next time.
  useEffect(() => {
    if (!open) setAnswers({});
  }, [open]);
  // After each pick, move focus to the next question (or the "all done" line) so keyboard users are not left on a removed button.
  useEffect(() => {
    if (open && answered > 0) heading.current?.focus();
  }, [answered, open]);

  const label = (id: keyof Answers) => questions.find((x) => x.id === id)?.options.find((o) => o.value === answers[id])?.label;

  function autoFillForm() {
    const { values: next, count } = autoFill(values);
    onFill(next, count ? `Auto-filled ${count} empty field${count > 1 ? "s" : ""} from mock data. ${check}` : "Nothing to auto-fill: every field already has a value.");
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="AI helper"
      footer={
        <>
          <Button variant="ghost" onClick={() => setAnswers({})}>Start over</Button>
          <Button variant="secondary" onClick={autoFillForm}>Auto-fill form</Button>
          <Button disabled={step !== -1} onClick={() => { onFill(answersToForm(answers, values), `Filled from your answers to the AI helper. ${check}`); onClose(); }}>Apply answers</Button>
        </>
      }
    >
      <p className="flex flex-wrap items-center gap-2">
        <AssumptionTag /> Mock AI: questions and answers are canned. Nothing is sent anywhere. Auto-fill only fills empty fields.
      </p>
      <ol className="mt-4 space-y-2">
        {questions.slice(0, step === -1 ? questions.length : step).map((x) => (
          <li key={x.id} className="rounded-control border border-line px-3 py-2">
            <p className="text-[13px]">{x.text}</p>
            <p className="font-semibold text-on-surface">{label(x.id)}</p>
          </li>
        ))}
      </ol>
      <div aria-live="polite" className="mt-3">
        {q ? (
          <div>
            <p className="text-xs font-semibold">Question {step + 1} of {questions.length}</p>
            <p ref={heading} tabIndex={-1} className="mt-1 text-sm font-semibold text-on-surface">{q.text}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {q.options.map((o) => (
                <Button key={o.value} size="sm" variant="secondary" onClick={() => setAnswers((p) => ({ ...p, [q.id]: o.value }))}>{o.label}</Button>
              ))}
            </div>
          </div>
        ) : (
          <p ref={heading} tabIndex={-1} className="font-semibold text-on-surface">All done. Apply these answers to the form, or auto-fill the empty fields.</p>
        )}
      </div>
    </Modal>
  );
}
