import { useMemo, useRef, useState } from "react";
import { CheckCircle, Eye } from "@phosphor-icons/react";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { DataTable, type Column } from "../../../components/ui/DataTable";
import { EmptyState } from "../../../components/ui/EmptyState";
import { Field, inputClass } from "../../../components/ui/Field";
import { ACCOUNTS, FUND_TAGS, PAST_EXECUTIONS, type Execution, type Schedule } from "../../../data/topup";
import { formatSGD } from "../../../lib/format";
import { eligibleAccounts } from "../../../lib/topup";
import { PreviewModal, SCHEDULE_LABEL, type Draft } from "./PreviewModal";

type Form = {
  title: string; ageMin: string; ageMax: string; citizenOnly: boolean; enrolledOnly: boolean;
  balanceMin: string; balanceMax: string; amount: string; fundTag: string; schedule: Schedule;
};

const INITIAL: Form = {
  title: "", ageMin: "7", ageMax: "16",
  // ASSUMPTION: Singapore Citizens only by default, matching Req 1; HQ can switch it off.
  citizenOnly: true, enrolledOnly: true,
  balanceMin: "0", balanceMax: "5000", amount: "", fundTag: FUND_TAGS[0], schedule: "now",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

/** Inline validation. Messages only; the caller decides which to show. */
function validate(f: Form) {
  const e: Partial<Record<"title" | "age" | "balance" | "amount", string>> = {};
  if (!f.title.trim()) e.title = "Enter a title for this top-up.";
  const [a0, a1, b0, b1, amt] = [num(f.ageMin), num(f.ageMax), num(f.balanceMin), num(f.balanceMax), num(f.amount)];
  if (Number.isNaN(a0) || Number.isNaN(a1)) e.age = "Enter both a minimum and a maximum age.";
  else if (a0 < 0) e.age = "Age cannot be negative.";
  else if (a0 > a1) e.age = "Minimum age must be less than or equal to maximum age.";
  if (Number.isNaN(b0) || Number.isNaN(b1)) e.balance = "Enter both a minimum and a maximum balance.";
  else if (b0 < 0) e.balance = "Balance cannot be negative.";
  else if (b0 > b1) e.balance = "Minimum balance must be less than or equal to maximum balance.";
  if (Number.isNaN(amt) || amt <= 0) e.amount = "Amount must be greater than S$0.";
  return e;
}

const columns: Column<Execution>[] = [
  { key: "id", header: "Ref", sortable: true },
  { key: "title", header: "Title", sortable: true, render: (x) => (<><span className="font-semibold">{x.title}</span><span className="block text-[13px] text-on-surface-variant">{x.fundTag}</span></>) },
  { key: "date", header: "Date", sortable: true },
  { key: "schedule", header: "Schedule", render: (x) => SCHEDULE_LABEL[x.schedule] },
  { key: "eligible", header: "Accounts", sortable: true, align: "right" },
  { key: "amount", header: "Per account", align: "right", render: (x) => formatSGD(x.amount) },
  { key: "total", header: "Funds", sortable: true, align: "right", render: (x) => formatSGD(x.total) },
  { key: "by", header: "Executed by" },
];

const flag = "flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold text-on-surface";
const box = "size-5 shrink-0 accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export default function TopUp() {
  const [form, setForm] = useState<Form>(INITIAL);
  const [attempted, setAttempted] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [history, setHistory] = useState<Execution[]>(PAST_EXECUTIONS);
  const [message, setMessage] = useState("");
  const msgRef = useRef<HTMLDivElement>(null);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));
  const errors = validate(form);
  // Range errors are live; title and an empty amount wait for a Preview attempt so an untouched form is not shouting.
  const show = { ...errors, title: attempted ? errors.title : undefined, amount: attempted || form.amount !== "" ? errors.amount : undefined };
  const valid = Object.keys(errors).length === 0;

  const rule = useMemo(
    () => ({
      ageMin: num(form.ageMin), ageMax: num(form.ageMax), citizenOnly: form.citizenOnly, enrolledOnly: form.enrolledOnly,
      balanceMin: num(form.balanceMin), balanceMax: num(form.balanceMax),
    }),
    [form],
  );
  const eligible = useMemo(() => (draft && valid ? eligibleAccounts(rule, ACCOUNTS) : []), [draft, valid, rule]);

  const preview = () => {
    setAttempted(true);
    setMessage("");
    if (!valid) return;
    setDraft({
      title: form.title.trim(), fundTag: form.fundTag, schedule: form.schedule, amount: num(form.amount),
      rule: [
        `Age ${form.ageMin} to ${form.ageMax} (inclusive)`,
        form.citizenOnly ? "Singapore Citizens only" : "Citizens and non-citizens",
        form.enrolledOnly ? "Currently enrolled in school only" : "Enrolled and not enrolled",
        `Balance ${formatSGD(rule.balanceMin)} to ${formatSGD(rule.balanceMax)} (inclusive)`,
      ],
    });
  };

  const execute = () => {
    if (!draft) return;
    const x: Execution = {
      id: `TU-${String(history.length + 5).padStart(4, "0")}`, title: draft.title, fundTag: draft.fundTag, schedule: draft.schedule,
      eligible: eligible.length, amount: draft.amount, total: eligible.length * draft.amount,
      date: new Date().toISOString().slice(0, 10), by: "HQ Officer",
    };
    setHistory((h) => [x, ...h]);
    setDraft(null);
    setForm(INITIAL);
    setAttempted(false);
    setMessage(`${x.id} executed: ${formatSGD(x.amount)} to ${x.eligible} accounts (${formatSGD(x.total)}). ${draft.schedule === "now" ? "Credited now." : `Recurs ${draft.schedule}.`}`);
    // The opener is reset, so park focus on the confirmation instead of losing it.
    setTimeout(() => msgRef.current?.focus(), 0);
  };

  return (
    <div className="space-y-4">
      <Card title="Top-up rule builder">
        <p className="mb-4 text-sm text-on-surface-variant">
          Choose which accounts qualify, set the amount, then preview the result before anything is executed.
        </p>
        <div ref={msgRef} tabIndex={-1} aria-live="polite" className="mb-4 outline-none empty:hidden">
          {message && (
            <p className="flex items-center gap-2 rounded-control border border-line bg-success-container px-3 py-2 text-sm font-medium text-success">
              <CheckCircle size={18} weight="bold" aria-hidden="true" /> {message}
            </p>
          )}
        </div>
        <form noValidate onSubmit={(e) => { e.preventDefault(); preview(); }} className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
          <Field label="Title" error={show.title} className="md:col-span-2">
            <input className={inputClass} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. 2026 Primary cohort top-up" />
          </Field>

          <fieldset className="grid grid-cols-2 gap-3">
            <legend className="mb-1.5 text-[13px] font-semibold text-on-surface">Age range (years, inclusive)</legend>
            <Field label="From"><input className={inputClass} type="number" inputMode="numeric" min={0} value={form.ageMin} onChange={(e) => set("ageMin", e.target.value)} /></Field>
            <Field label="To"><input className={inputClass} type="number" inputMode="numeric" min={0} value={form.ageMax} onChange={(e) => set("ageMax", e.target.value)} /></Field>
            {show.age && <p role="alert" className="col-span-2 text-[13px] font-medium text-alert">{show.age}</p>}
          </fieldset>

          <fieldset className="grid grid-cols-2 gap-3">
            <legend className="mb-1.5 text-[13px] font-semibold text-on-surface">Account balance (S$, inclusive)</legend>
            <Field label="From"><input className={inputClass} type="number" inputMode="decimal" min={0} step="0.01" value={form.balanceMin} onChange={(e) => set("balanceMin", e.target.value)} /></Field>
            <Field label="To"><input className={inputClass} type="number" inputMode="decimal" min={0} step="0.01" value={form.balanceMax} onChange={(e) => set("balanceMax", e.target.value)} /></Field>
            {show.balance && <p role="alert" className="col-span-2 text-[13px] font-medium text-alert">{show.balance}</p>}
          </fieldset>

          <div>
            <label className={flag}>
              <input type="checkbox" className={box} checked={form.citizenOnly} onChange={(e) => set("citizenOnly", e.target.checked)} />
              Singapore Citizens only
            </label>
            <label className={flag}>
              <input type="checkbox" className={box} checked={form.enrolledOnly} onChange={(e) => set("enrolledOnly", e.target.checked)} />
              Currently enrolled in school only
            </label>
            <p className="mt-1 text-[13px] text-on-surface-variant">
              <span className="mr-2"><Badge tone="primary">Assumption</Badge></span>
              Both filters start on. Whether non-citizens or out-of-school accounts can ever receive a top-up is still open.
            </p>
          </div>

          <Field label="Amount per account (S$)" error={show.amount}>
            <input className={inputClass} type="number" inputMode="decimal" min={0} step="0.01" value={form.amount} onChange={(e) => set("amount", e.target.value)} placeholder="e.g. 200" />
          </Field>

          <Field label="Fund tag (reason)">
            <select className={inputClass} value={form.fundTag} onChange={(e) => set("fundTag", e.target.value)}>
              {FUND_TAGS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>

          <Field label="Schedule" hint="Run now is an ad-hoc top-up. Other options repeat on that cycle.">
            <select className={inputClass} value={form.schedule} onChange={(e) => set("schedule", e.target.value as Schedule)}>
              {(Object.keys(SCHEDULE_LABEL) as Schedule[]).map((s) => <option key={s} value={s}>{SCHEDULE_LABEL[s]}</option>)}
            </select>
          </Field>

          <div className="flex items-end justify-end md:col-span-2">
            <Button type="submit" icon={<Eye size={18} weight="bold" aria-hidden="true" />}>Preview top-up</Button>
          </div>
        </form>
      </Card>

      <Card title="Execution history">
        <DataTable
          columns={columns}
          rows={history}
          rowKey={(x) => x.id}
          pageSize={5}
          empty={<EmptyState title="No top-ups executed yet" hint="Executed top-ups appear here." />}
        />
      </Card>

      <PreviewModal draft={draft} eligible={eligible} onClose={() => setDraft(null)} onExecute={execute} />
    </div>
  );
}
