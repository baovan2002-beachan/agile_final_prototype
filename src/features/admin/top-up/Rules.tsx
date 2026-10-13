import { useState } from "react";
import { ArrowLeft, Plus, WarningCircle } from "@phosphor-icons/react";
import { Badge, type BadgeTone } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { DataTable, type Column } from "../../../components/ui/DataTable";
import { EmptyState } from "../../../components/ui/EmptyState";
import { Field, inputClass } from "../../../components/ui/Field";
import { SCHOOLS } from "../../../data/schools";
import type { FundRule, RuleStatus } from "../../../data/topup";
import { formatSGD } from "../../../lib/format";
import { checkRule, nextRuleId } from "../../../lib/topup";

const TONE: Record<RuleStatus, BadgeTone> = { Active: "success", Draft: "warning", Paused: "neutral" };
const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

type Props = { rules: FundRule[]; onChange: (next: FundRule[]) => void };
type Draft = { id: string; name: string; amount: string; ageMin: string; ageMax: string; balanceBelow: string; schools: string[] };
const BLANK: Draft = { id: "", name: "", amount: "200", ageMin: "7", ageMax: "16", balanceBelow: "500", schools: [] };

export default function Rules({ rules, onChange }: Props) {
  const [draft, setDraft] = useState<Draft | null>(null);
  if (draft) return <RuleForm draft={draft} rules={rules} onCancel={() => setDraft(null)} onSave={(r) => { onChange(r.id && rules.some((x) => x.id === r.id) ? rules.map((x) => (x.id === r.id ? r : x)) : [r, ...rules]); setDraft(null); }} />;
  return <RuleList rules={rules} onNew={() => setDraft(BLANK)} onEdit={(r) => setDraft({ id: r.id, name: r.name, amount: String(r.amount), ageMin: String(r.ageMin), ageMax: String(r.ageMax), balanceBelow: String(r.balanceBelow), schools: [...r.schools] })} onToggle={(id) => onChange(rules.map((r) => (r.id === id ? { ...r, status: r.status === "Active" ? "Paused" : "Active" } : r)))} />;
}

function RuleList({ rules, onNew, onEdit, onToggle }: { rules: FundRule[]; onNew: () => void; onEdit: (r: FundRule) => void; onToggle: (id: string) => void }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const rows = rules.filter((r) => `${r.name} ${r.id}`.toLowerCase().includes(q.trim().toLowerCase()) && (status === "All" || r.status === status));
  const columns: Column<FundRule>[] = [
    { key: "name", header: "Rule", sortable: true, render: (r) => (<><span className="font-semibold">{r.name}</span><span className="block text-[13px] text-on-surface-variant">{r.id}</span></>) },
    { key: "ageMin", header: "Age range", render: (r) => `${r.ageMin}-${r.ageMax} yrs` },
    { key: "balanceBelow", header: "Balance", sortable: true, render: (r) => `below ${formatSGD(r.balanceBelow)}` },
    { key: "schools", header: "Schools", render: (r) => `${r.schools.length} selected` },
    { key: "amount", header: "Top-up", sortable: true, align: "right", render: (r) => formatSGD(r.amount) },
    { key: "status", header: "Status", render: (r) => <Badge tone={TONE[r.status]}>{r.status}</Badge> },
    {
      key: "actions", header: "Actions",
      render: (r) => (
        <span className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => onEdit(r)} aria-label={`Edit ${r.name}`}>Edit</Button>
          <Button size="sm" variant="ghost" onClick={() => onToggle(r.id)} aria-label={`${r.status === "Active" ? "Pause" : "Activate"} ${r.name}`}>{r.status === "Active" ? "Pause" : "Activate"}</Button>
        </span>
      ),
    },
  ];
  return (
    <div className="space-y-4">
      <Card title="Funding rules" action={<Button size="sm" icon={<Plus size={16} weight="bold" aria-hidden="true" />} onClick={onNew}>Add rule</Button>}>
        <div className="mb-4 flex flex-wrap gap-3">
          <input aria-label="Search rules" className={inputClass.replace("w-full", "min-w-48 max-w-xs flex-1")} placeholder="Search rule name or ID..." value={q} onChange={(e) => setQ(e.target.value)} />
          <select aria-label="Filter by status" className={inputClass.replace("w-full", "w-44")} value={status} onChange={(e) => setStatus(e.target.value)}>
            {["All", "Active", "Draft", "Paused"].map((s) => <option key={s} value={s}>{s === "All" ? "All statuses" : s}</option>)}
          </select>
        </div>
        <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} pageSize={8} empty={<EmptyState title="No matching rules" hint="Change the search or status filter, or add a rule." />} />
      </Card>
    </div>
  );
}

function RuleForm({ draft, rules, onCancel, onSave }: { draft: Draft; rules: FundRule[]; onCancel: () => void; onSave: (r: FundRule) => void }) {
  const [d, setD] = useState(draft);
  const [find, setFind] = useState("");
  const [tried, setTried] = useState(false);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));
  const input = { ageMin: num(d.ageMin), ageMax: num(d.ageMax), balanceBelow: num(d.balanceBelow), amount: num(d.amount), schools: d.schools };
  const { errors, overlaps } = checkRule(input, rules, d.id || undefined);
  const nameError = tried && !d.name.trim() ? "Enter a rule name." : "";
  const toggle = (name: string, on: boolean) => set("schools", on ? [...d.schools, name] : d.schools.filter((s) => s !== name));
  const shown = SCHOOLS.filter((s) => s.name.toLowerCase().includes(find.trim().toLowerCase()));

  const save = (status: RuleStatus) => {
    setTried(true);
    if (!d.name.trim() || errors.length) return;
    onSave({ id: d.id || nextRuleId(rules), name: d.name.trim(), ageMin: input.ageMin, ageMax: input.ageMax, balanceBelow: input.balanceBelow, amount: input.amount, schools: d.schools, status });
  };
  const age = (k: "ageMin" | "ageMax", label: string) => (
    <Field label={label}><input className={inputClass} type="number" min={0} max={120} step={1} value={d[k]} onChange={(e) => set(k, e.target.value)} /></Field>
  );

  return (
    <div>
      <button type="button" onClick={onCancel} className="mb-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
        <ArrowLeft size={16} weight="bold" aria-hidden="true" /> Back to funding rules
      </button>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(17rem,1fr)] lg:items-start">
        <Card title={d.id ? `Edit funding rule ${d.id}` : "Create funding rule"}>
          <form noValidate onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <fieldset className="grid gap-4 sm:grid-cols-2">
              <legend className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-on-surface-variant">1. Rule details</legend>
              <Field label="Rule name" error={nameError}><input className={inputClass} maxLength={80} placeholder="e.g. Primary Student Support" value={d.name} onChange={(e) => set("name", e.target.value)} /></Field>
              <Field label="Top-up per account (S$)"><input className={inputClass} type="number" min={0.01} step={0.01} value={d.amount} onChange={(e) => set("amount", e.target.value)} /></Field>
            </fieldset>
            <fieldset className="grid gap-4 sm:grid-cols-2">
              <legend className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-on-surface-variant">2. Recipient criteria (all must match)</legend>
              {age("ageMin", "Minimum age (inclusive)")}
              {age("ageMax", "Maximum age (inclusive)")}
              <Field label="Current balance below (S$)" hint="Strictly less than: a balance exactly at the limit does not qualify." className="sm:col-span-2">
                <input className={inputClass} type="number" min={0.01} step={0.01} value={d.balanceBelow} onChange={(e) => set("balanceBelow", e.target.value)} />
              </Field>
            </fieldset>
            <fieldset>
              <legend className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-on-surface-variant">3. Schools</legend>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <input aria-label="Search schools" className={inputClass.replace("w-full", "min-w-48 max-w-xs flex-1")} placeholder="Search school name..." value={find} onChange={(e) => setFind(e.target.value)} />
                <Button size="sm" variant="secondary" onClick={() => set("schools", [...new Set([...d.schools, ...shown.map((s) => s.name)])])}>Select shown</Button>
                <Button size="sm" variant="ghost" onClick={() => set("schools", [])}>Clear all</Button>
              </div>
              <ul className="max-h-56 divide-y divide-line overflow-auto rounded-control border border-line">
                {shown.map((s) => (
                  <li key={s.code}>
                    <label className="flex min-h-11 cursor-pointer items-center gap-3 px-3 text-sm">
                      <input type="checkbox" className="size-5 shrink-0 accent-primary" checked={d.schools.includes(s.name)} onChange={(e) => toggle(s.name, e.target.checked)} />
                      {s.name} <span className="text-on-surface-variant">{s.level}</span>
                    </label>
                  </li>
                ))}
                {!shown.length && <li className="px-3 py-3 text-sm text-on-surface-variant">No matching schools.</li>}
              </ul>
              <p className="mt-1.5 text-[13px] text-on-surface-variant">{d.schools.length} selected</p>
            </fieldset>
            <div className="flex flex-wrap justify-end gap-3">
              <Button variant="secondary" onClick={onCancel}>Cancel</Button>
              <Button variant="secondary" onClick={() => save("Draft")}>Save draft</Button>
              <Button onClick={() => save("Active")}>Save and activate</Button>
            </div>
          </form>
        </Card>

        <Card title="Live rule summary" className="lg:sticky lg:top-6">
          <div className="rounded-control bg-surface-container-low p-3 text-sm leading-relaxed">
            <p className="font-semibold">{d.name || "Unnamed rule"}</p>
            <p>Age {d.ageMin || "?"}-{d.ageMax || "?"} <b>AND</b> balance below {formatSGD(input.balanceBelow || 0)} <b>AND</b> {d.schools.length} school(s)</p>
            <p className="mt-1 font-semibold text-primary">Top-up per account: {formatSGD(input.amount || 0)}</p>
          </div>
          <div className="mt-5 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold">Rule clash check</h3>
            <Badge tone={errors.length ? "alert" : overlaps.length ? "warning" : "success"}>
              {errors.length ? `${errors.length} error${errors.length > 1 ? "s" : ""}` : overlaps.length ? `${overlaps.length} warning${overlaps.length > 1 ? "s" : ""}` : "No clash"}
            </Badge>
          </div>
          <div aria-live="polite" className="mt-3 space-y-2 text-[13px]">
            {errors.map((e) => (
              <p key={e} className="flex items-start gap-2 rounded-control border border-alert bg-error-container p-3 font-medium text-on-error-container">
                <WarningCircle size={16} weight="fill" aria-hidden="true" className="mt-0.5 shrink-0" /> {e}
              </p>
            ))}
            {overlaps.map((o) => (
              <div key={o.rule.id} className="rounded-control border border-line bg-warning-container p-3 text-warning">
                <p className="font-semibold">Potential overlap: {o.rule.name} ({o.rule.id})</p>
                <p>Common age {o.ageMin}-{o.ageMax}. Shared: {o.schools.join(", ")}.</p>
                <p>Both rules may include accounts below {formatSGD(o.balanceBelow)}, so the same account could be paid twice if both run.</p>
              </div>
            ))}
            {!errors.length && !overlaps.length && <p className="rounded-control bg-success-container p-3 font-medium text-success">No Active rule shares this age range and school selection.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
