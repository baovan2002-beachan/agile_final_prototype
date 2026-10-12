import { useMemo, useRef, useState } from "react";
import { CheckCircle, Eye } from "@phosphor-icons/react";
import { AssumptionTag } from "../../../components/ui/AssumptionTag";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { DataTable, type Column } from "../../../components/ui/DataTable";
import { EmptyState } from "../../../components/ui/EmptyState";
import { Field, inputClass } from "../../../components/ui/Field";
import { ACCOUNTS, FUND_TAGS, PAST_EXECUTIONS, type Execution, type Schedule } from "../../../data/topup";
import { formatSGD } from "../../../lib/format";
import { parseAmount } from "../../../lib/amount";
import { eligibleAccounts, nextExecutionId, totalFunds, type TopUpRule } from "../../../lib/topup";
import { box, flag, INITIAL, num, RangePair, validate, type Form } from "./form";
import { PreviewModal, SCHEDULE_LABEL, type Draft } from "./PreviewModal";

/** Today in Singapore (UTC+8), as YYYY-MM-DD, regardless of the browser time zone. */
const sgToday = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Singapore" });
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

export default function TopUp() {
  const [form, setForm] = useState<Form>(INITIAL);
  const [attempted, setAttempted] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [history, setHistory] = useState<Execution[]>([...PAST_EXECUTIONS].reverse()) // newest first;
  const [message, setMessage] = useState("");
  const msgRef = useRef<HTMLDivElement>(null);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));
  const errors = validate(form);
  // Range errors are live; title and an empty amount wait for a Preview attempt so an untouched form is not shouting.
  const show = { ...errors, title: attempted ? errors.title : undefined, amount: attempted || form.amount !== "" ? errors.amount : undefined };
  const valid = Object.keys(errors).length === 0;

  // Eligibility comes from the snapshot taken at Preview, never from the live form.
  const eligible = useMemo(() => (draft ? eligibleAccounts(draft.spec, ACCOUNTS) : []), [draft]);

  const preview = () => {
    setAttempted(true);
    setMessage("");
    const amt = parseAmount(form.amount);
    if (!valid || "error" in amt) return;
    const spec: TopUpRule = {
      ageMin: num(form.ageMin), ageMax: num(form.ageMax), citizenOnly: form.citizenOnly, enrolledOnly: form.enrolledOnly,
      balanceMin: num(form.balanceMin), balanceMax: num(form.balanceMax),
    };
    setDraft({
      title: form.title.trim(), fundTag: form.fundTag, schedule: form.schedule, amount: amt.value, spec,
      rule: [
        `Age ${form.ageMin} to ${form.ageMax} (inclusive)`,
        form.citizenOnly ? "Singapore Citizens only" : "Citizens and non-citizens",
        form.enrolledOnly ? "Currently enrolled in school only" : "Enrolled and not enrolled",
        `Balance ${formatSGD(spec.balanceMin)} to ${formatSGD(spec.balanceMax)} (inclusive)`,
      ],
    });
  };

  const execute = () => {
    if (!draft) return;
    const x: Execution = {
      id: nextExecutionId(history), title: draft.title, fundTag: draft.fundTag, schedule: draft.schedule,
      eligible: eligible.length, amount: draft.amount, total: totalFunds(eligible.length, draft.amount),
      date: sgToday(), by: "HQ Officer",
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

          <RangePair legend="Age range (years, inclusive)" error={show.age} step={1} mode="numeric" from={form.ageMin} to={form.ageMax} onFrom={(v) => set("ageMin", v)} onTo={(v) => set("ageMax", v)} />
          <RangePair legend="Account balance (S$, inclusive)" error={show.balance} step={0.01} mode="decimal" from={form.balanceMin} to={form.balanceMax} onFrom={(v) => set("balanceMin", v)} onTo={(v) => set("balanceMax", v)} />

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
              <span className="mr-2"><AssumptionTag /></span>
              Both filters start on. Whether non-citizens or out-of-school accounts can ever receive a top-up is still open.
            </p>
          </div>

          <Field label="Amount per account (S$)" error={show.amount}>
            <input className={inputClass} type="text" inputMode="decimal" value={form.amount} onChange={(e) => set("amount", e.target.value)} placeholder="e.g. 200" />
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
