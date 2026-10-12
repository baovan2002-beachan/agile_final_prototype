import { useId } from "react";
import { Field, inputClass } from "../../../components/ui/Field";
import { FUND_TAGS, type Schedule } from "../../../data/topup";
import { parseAmount } from "../../../lib/amount";

export type Form = {
  title: string; ageMin: string; ageMax: string; citizenOnly: boolean; enrolledOnly: boolean;
  balanceMin: string; balanceMax: string; amount: string; fundTag: string; schedule: Schedule;
};

export const INITIAL: Form = {
  title: "", ageMin: "7", ageMax: "16",
  // ASSUMPTION: Singapore Citizens only by default, matching Req 1; HQ can switch it off.
  citizenOnly: true, enrolledOnly: true,
  balanceMin: "0", balanceMax: "5000", amount: "", fundTag: FUND_TAGS[0], schedule: "now",
};

export const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

/** Inline validation. Messages only; the caller decides which to show. */
export function validate(f: Form) {
  const e: Partial<Record<"title" | "age" | "balance" | "amount", string>> = {};
  if (!f.title.trim()) e.title = "Enter a title for this top-up.";
  const [a0, a1, b0, b1] = [num(f.ageMin), num(f.ageMax), num(f.balanceMin), num(f.balanceMax)];
  if (Number.isNaN(a0) || Number.isNaN(a1)) e.age = "Enter both a minimum and a maximum age.";
  else if (!Number.isInteger(a0) || !Number.isInteger(a1)) e.age = "Ages must be whole numbers.";
  else if (a0 < 0 || a1 > 120) e.age = "Age must be between 0 and 120.";
  else if (a0 > a1) e.age = "Minimum age must be less than or equal to maximum age.";
  if (Number.isNaN(b0) || Number.isNaN(b1)) e.balance = "Enter both a minimum and a maximum balance.";
  else if (b0 < 0) e.balance = "Balance cannot be negative.";
  else if (b0 > b1) e.balance = "Minimum balance must be less than or equal to maximum balance.";
  const amt = parseAmount(f.amount);
  if ("error" in amt) e.amount = amt.error;
  return e;
}

export const flag = "flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold text-on-surface";
export const box = "size-5 shrink-0 accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

type RangeProps = { legend: string; error?: string; step: number; mode: "numeric" | "decimal"; from: string; to: string; onFrom: (v: string) => void; onTo: (v: string) => void };

/** Two number inputs under one legend; the shared error is wired to both via aria-invalid + aria-describedby. */
export function RangePair({ legend, error, step, mode, from, to, onFrom, onTo }: RangeProps) {
  const errId = useId();
  const props = { className: inputClass, type: "number", inputMode: mode, min: 0, step, "aria-invalid": error ? true : undefined, "aria-describedby": error ? errId : undefined } as const;
  return (
    <fieldset className="grid grid-cols-2 gap-3">
      <legend className="mb-1.5 text-[13px] font-semibold text-on-surface">{legend}</legend>
      <Field label="From"><input {...props} value={from} onChange={(e) => onFrom(e.target.value)} /></Field>
      <Field label="To"><input {...props} value={to} onChange={(e) => onTo(e.target.value)} /></Field>
      {error && <p id={errId} role="alert" className="col-span-2 text-[13px] font-medium text-alert">{error}</p>}
    </fieldset>
  );
}
