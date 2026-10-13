import { useMemo, useState, type ReactNode } from "react";
import { CheckCircle, Eye } from "@phosphor-icons/react";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Field, inputClass } from "../../../components/ui/Field";
import { Modal } from "../../../components/ui/Modal";
import { Segmented } from "../../../components/ui/Segmented";
import { FUND_TAGS, type Account, type Execution, type FundRule, type Schedule } from "../../../data/topup";
import { parseAmount } from "../../../lib/amount";
import { formatSGD } from "../../../lib/format";
import { eligibleForRule, nextExecutionId, totalFunds } from "../../../lib/topup";

/** Today in Singapore (UTC+8), as YYYY-MM-DD, regardless of the browser time zone. */
export const sgToday = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Singapore" });

export const SCHEDULE_LABEL: Record<Schedule, string> = {
  now: "Run now (ad-hoc)", once: "Once, on a date", weekly: "Weekly", monthly: "Monthly", quarterly: "Quarterly", yearly: "Yearly",
};
const LATER: Schedule[] = ["once", "weekly", "monthly", "quarterly", "yearly"];

type Props = { rules: FundRule[]; accounts: Account[]; history: Execution[]; onDone: (x: Execution, creditedIds: string[]) => void };

function Row({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-2.5 text-sm last:border-0">
      <dt className="text-on-surface-variant">{k}</dt>
      <dd className="text-right font-semibold text-on-surface">{v}</dd>
    </div>
  );
}

export default function Execute({ rules, accounts, history, onDone }: Props) {
  const [mode, setMode] = useState<"single" | "batch">("single");
  const [accountId, setAccountId] = useState("");
  const [ruleId, setRuleId] = useState("");
  const [amount, setAmount] = useState("");
  const [fundTag, setFundTag] = useState(FUND_TAGS[0]);
  const [timing, setTiming] = useState<"now" | "later">("now");
  const [date, setDate] = useState("");
  const [freq, setFreq] = useState<Schedule>("once");
  const [snapshot, setSnapshot] = useState<string[] | null>(null); // eligible ids frozen at Preview
  const [attempted, setAttempted] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [signed, setSigned] = useState(false);
  const [message, setMessage] = useState("");

  const today = sgToday();
  const later = timing === "later";
  const rule = rules.find((r) => r.id === ruleId && r.status === "Active");
  const account = accounts.find((a) => a.id === accountId);
  const ids = mode === "single" ? (account ? [account.id] : []) : snapshot ?? [];
  const amt = parseAmount(amount);
  const per = "value" in amt ? amt.value : 0;
  const known = mode === "single" ? Boolean(account) : snapshot !== null;
  const preview = useMemo(() => (snapshot ?? []).flatMap((id) => accounts.find((a) => a.id === id) ?? []), [snapshot, accounts]);

  const errors = {
    target:
      mode === "single"
        ? account ? "" : "Select an Education Account."
        : !rule ? "Select an active funding rule." : !snapshot ? "Preview the eligible accounts first." : snapshot.length ? "" : "No account matches this rule.",
    amount: "error" in amt ? amt.error : "",
    date: later ? (!date ? "Choose the first execution date." : date < today ? "Choose today or a future date." : "") : "",
  };
  // Untouched fields stay quiet until the first Review attempt.
  const show = attempted ? errors : { target: "", amount: amount !== "" ? errors.amount : "", date: "" };
  const valid = !errors.target && !errors.amount && !errors.date;

  const reset = () => {
    setMode("single"); setAccountId(""); setRuleId(""); setAmount(""); setTiming("now"); setDate(""); setFreq("once"); setSnapshot(null); setAttempted(false);
  };
  const pickRule = (id: string) => {
    setRuleId(id);
    setSnapshot(null);
    const r = rules.find((x) => x.id === id);
    if (r) setAmount(String(r.amount));
  };
  const runPreview = () => { if (rule) setSnapshot(eligibleForRule(rule, accounts).map((a) => a.id)); };
  const review = () => { setAttempted(true); setMessage(""); if (valid) setConfirm(true); };
  const close = () => { setConfirm(false); setSigned(false); };

  const execute = () => {
    const x: Execution = {
      id: nextExecutionId(history),
      title: mode === "batch" ? rule!.name : `Single top-up: ${account!.name}`,
      fundTag, schedule: later ? freq : "now", eligible: ids.length, amount: per, total: totalFunds(ids.length, per),
      date: later ? date : today, by: "HQ Officer", status: later ? "Scheduled" : "Success",
    };
    onDone(x, later ? [] : ids);
    setMessage(`${x.id} ${later ? `scheduled from ${date}` : "executed"}: ${formatSGD(per)} to ${ids.length} ${ids.length === 1 ? "account" : "accounts"} (${formatSGD(x.total)}).`);
    close();
    reset();
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(17rem,1fr)] lg:items-start">
      <Card title="Create top-up">
        {message && (
          <p role="status" className="mb-4 flex items-center gap-2 rounded-control border border-line bg-success-container px-3 py-2 text-sm font-medium text-success">
            <CheckCircle size={18} weight="bold" aria-hidden="true" /> {message}
          </p>
        )}
        <div className="space-y-5">
          <div>
            <p className="mb-1.5 text-[13px] font-semibold">Recipient type</p>
            <Segmented label="Recipient type" value={mode} onChange={(m) => { setMode(m); setAttempted(false); }} options={[{ value: "single", label: "Single account" }, { value: "batch", label: "Batch (by rule)" }]} />
          </div>

          {mode === "single" ? (
            <Field label="Education account" error={show.target}>
              <select className={inputClass} value={accountId} onChange={(e) => setAccountId(e.target.value)}>
                <option value="">Select an account...</option>
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.id})</option>)}
              </select>
            </Field>
          ) : (
            <div className="space-y-3">
              <Field label="Funding rule" hint="Rules are created in the Funding rules tab. Only Active rules appear here." error={show.target}>
                <select className={inputClass} value={ruleId} onChange={(e) => pickRule(e.target.value)}>
                  <option value="">Select an active rule...</option>
                  {rules.filter((r) => r.status === "Active").map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </Field>
              {rule && (
                <div className="rounded-control border border-line bg-surface-container-low p-3 text-sm">
                  <p className="font-semibold">{rule.name}</p>
                  <p className="mt-0.5 text-on-surface-variant">Age {rule.ageMin}-{rule.ageMax}, balance below {formatSGD(rule.balanceBelow)}, in one of {rule.schools.length} school(s).</p>
                  <Button size="sm" variant="secondary" className="mt-3" icon={<Eye size={16} weight="bold" aria-hidden="true" />} onClick={runPreview}>Preview eligible accounts</Button>
                </div>
              )}
              {snapshot && (
                <div className="rounded-control border border-line">
                  <p className="border-b border-line px-3 py-2 text-sm font-semibold" aria-live="polite">{preview.length} eligible {preview.length === 1 ? "account" : "accounts"}</p>
                  {preview.length > 0 && (
                    <ul className="max-h-56 divide-y divide-line overflow-auto text-sm">
                      {preview.map((a) => (
                        <li key={a.id} className="flex justify-between gap-3 px-3 py-1.5">
                          <span>{a.name} <span className="text-on-surface-variant">({a.school}, age {a.age})</span></span>
                          <span className="tabular-nums">{formatSGD(a.balance)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Amount per account (S$)" error={show.amount} hint={mode === "batch" ? "Filled from the rule; adjust for this run if needed." : undefined}>
              <input className={inputClass} inputMode="decimal" placeholder="e.g. 200" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </Field>
            <Field label="Fund tag (reason)">
              <select className={inputClass} value={fundTag} onChange={(e) => setFundTag(e.target.value)}>
                {FUND_TAGS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
          </div>

          <div>
            <p className="mb-1.5 text-[13px] font-semibold">Execution timing</p>
            <Segmented label="Execution timing" value={timing} onChange={setTiming} options={[{ value: "now", label: "Execute now" }, { value: "later", label: "Schedule for later" }]} />
          </div>
          {later && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First execution date" error={show.date}>
                <input className={inputClass} type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} />
              </Field>
              <Field label="Frequency">
                <select className={inputClass} value={freq} onChange={(e) => setFreq(e.target.value as Schedule)}>
                  {LATER.map((s) => <option key={s} value={s}>{SCHEDULE_LABEL[s]}</option>)}
                </select>
              </Field>
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={reset}>Reset</Button>
          <Button onClick={review}>{later ? "Review schedule" : "Review and confirm"}</Button>
        </div>
      </Card>

      <Card title="Top-up summary" className="lg:sticky lg:top-6">
        <dl>
          <Row k="Recipient" v={mode === "single" ? "Single account" : "Batch (by rule)"} />
          <Row k="Target" v={mode === "single" ? account?.name ?? "Not selected" : rule?.name ?? "Not selected"} />
          <Row k="Eligible accounts" v={known ? ids.length : mode === "batch" ? "Preview required" : "-"} />
          <Row k="Per account" v={formatSGD(per)} />
          <Row k="Execution" v={later ? `${SCHEDULE_LABEL[freq]}${date ? `, from ${date}` : ""}` : "Execute now"} />
          <Row k="Estimated total" v={<span className="text-lg text-primary">{known ? formatSGD(totalFunds(ids.length, per)) : "-"}</span>} />
        </dl>
      </Card>

      <Modal
        open={confirm}
        onClose={close}
        title={later ? "Confirm top-up schedule" : "Confirm top-up"}
        footer={<><Button variant="secondary" onClick={close}>Cancel</Button><Button onClick={execute} disabled={!signed}>{later ? "Save schedule" : "Execute top-up"}</Button></>}
      >
        <dl>
          <Row k="Recipient" v={mode === "batch" ? rule?.name : account?.name} />
          <Row k="Accounts" v={ids.length} />
          <Row k="Per account" v={formatSGD(per)} />
          <Row k="Total funds" v={formatSGD(totalFunds(ids.length, per))} />
          <Row k="Execution" v={later ? `${SCHEDULE_LABEL[freq]}, from ${date}` : "Now"} />
        </dl>
        {/* ASSUMPTION: dual sign-off is one confirmation checkbox; the real second-officer approval flow is undefined. */}
        <label className="mt-4 flex min-h-11 cursor-pointer items-start gap-3 rounded-control border border-line bg-surface-container-low p-3 text-on-surface">
          <input type="checkbox" checked={signed} onChange={(e) => setSigned(e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-primary" />
          <span className="font-semibold">A second authorised officer has approved this top-up (required)</span>
        </label>
      </Modal>
    </div>
  );
}
