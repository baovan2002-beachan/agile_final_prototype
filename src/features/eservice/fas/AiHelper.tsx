import { useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { questions } from "../../../data/familyFas";
import { answersToForm, autoFill, type FormValues } from "./logic";
import { AssumptionTag } from "./shared";

type Props = { open: boolean; onClose: () => void; values: FormValues; onFill: (v: FormValues, note: string) => void };
type Answers = Partial<Record<(typeof questions)[number]["id"], string>>;

/** ASSUMPTION: mock AI. Asks one canned question at a time; the parent picks an option. */
export function AiHelper({ open, onClose, values, onFill }: Props) {
  const [answers, setAnswers] = useState<Answers>({});
  const step = questions.findIndex((q) => !answers[q.id]);
  const q = step === -1 ? null : questions[step];
  const label = (id: keyof Answers) => {
    const qq = questions.find((x) => x.id === id)!;
    return qq.options.find((o) => o.value === answers[id])?.label;
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="AI helper"
      footer={
        <>
          <Button variant="ghost" onClick={() => setAnswers({})}>Start over</Button>
          <Button variant="secondary" onClick={() => { onFill(autoFill(), "Auto-filled from mock data. Check every field before you submit."); onClose(); }}>Auto-fill form</Button>
          <Button disabled={step !== -1} onClick={() => { onFill(answersToForm(answers, values), "Filled from your answers to the AI helper. Check every field before you submit."); onClose(); }}>Apply answers</Button>
        </>
      }
    >
      <p className="flex flex-wrap items-center gap-2">
        <AssumptionTag /> Mock AI: questions and answers are canned. Nothing is sent anywhere.
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
            <p className="mt-1 text-sm font-semibold text-on-surface">{q.text}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {q.options.map((o) => (
                <Button key={o.value} size="sm" variant="secondary" onClick={() => setAnswers((p) => ({ ...p, [q.id]: o.value }))}>{o.label}</Button>
              ))}
            </div>
          </div>
        ) : (
          <p className="font-semibold text-on-surface">All done. Apply these answers to the form, or auto-fill everything.</p>
        )}
      </div>
    </Modal>
  );
}
