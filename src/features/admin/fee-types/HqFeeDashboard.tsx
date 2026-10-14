import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "@phosphor-icons/react";
import { ActionCell, RowAction } from "../../../components/ui/DataTable";
import { Card } from "../../../components/ui/Card";
import { SCHOOLS } from "../../../data/schools";
import { useFees } from "../../../data/feeStore";
import type { Charge, FeeType } from "../../../data/fees";
import { schoolOfLevel } from "../../../data/schoolMgmt";
import { formatSGD } from "../../../lib/format";
import { aggregate } from "../../../lib/fees";
import { FeeTypeModal, Tiles, selectClass, studentOf } from "./parts";

const tiles = (rows: Charge[], students: number) => {
  const a = aggregate(rows);
  return (
    <Tiles items={[
      { label: "Fee value issued", value: formatSGD(a.fee), note: `${rows.length} charges, ${students} students` },
      { label: "Collected", value: formatSGD(a.collected), good: true, note: `${a.paid} paid` },
      { label: "Outstanding", value: formatSGD(a.outstanding), alert: a.outstanding > 0, note: `${a.unpaid} unpaid${a.overdue ? `, ${a.overdue} overdue` : ""}` },
      { label: "FAS subsidies applied", value: formatSGD(a.subsidy), good: true, note: "On issued charges, per component" },
    ]} />
  );
};

function AggTable({ label, groups, extra }: { label: string; groups: [string, Charge[]][]; extra?: (key: string, rows: Charge[]) => ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[34rem] text-sm">
        <thead>
          <tr className="border-b border-line text-left text-[13px] text-on-surface-variant">
            <th className="py-2 font-semibold">{label}</th>
            {["Charges", "Fee value", "Subsidy", "Payable", "Collected", "Outstanding"].map((h) => <th key={h} className="text-right font-semibold">{h}</th>)}
            {extra && <th className="px-3 text-left font-semibold">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {groups.map(([k, rows]) => {
            const a = aggregate(rows);
            return (
              <tr key={k} className="border-b border-line hover:bg-primary-fixed/30 focus-within:bg-primary-fixed/30">
                <td className="py-2 font-medium">{k}</td>
                <td className="text-right tabular-nums">{rows.length}</td>
                <td className="text-right tabular-nums">{formatSGD(a.fee)}</td>
                <td className="text-right tabular-nums text-success">{formatSGD(a.subsidy)}</td>
                <td className="text-right tabular-nums font-semibold">{formatSGD(a.payable)}</td>
                <td className="text-right tabular-nums text-success">{formatSGD(a.collected)}</td>
                <td className={`text-right tabular-nums ${a.outstanding ? "text-alert" : ""}`}>{formatSGD(a.outstanding)}</td>
                {extra && <ActionCell>{extra(k, rows)}</ActionCell>}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const group = (rows: Charge[], key: (c: Charge) => string) => {
  const m = new Map<string, Charge[]>();
  rows.forEach((c) => m.set(key(c), [...(m.get(key(c)) ?? []), c]));
  return [...m];
};

/** HQ: read-only fee position of all schools, drilling school, then level, class, fee type and student. */
export default function HqFeeDashboard() {
  const { state } = useFees();
  const navigate = useNavigate();
  const [school, setSchool] = useState("");
  const [level, setLevel] = useState("");
  const [ftId, setFtId] = useState("");
  const [typeOpen, setTypeOpen] = useState<FeeType | null>(null);

  const inSchool = (code: string) => state.charges.filter((c) => { const s = studentOf(c.studentId); return s && schoolOfLevel(s.level) === code; });
  const studentsIn = (rows: Charge[]) => new Set(rows.map((c) => c.studentId)).size;

  if (!school) {
    return (
      <div className="space-y-4">
        {tiles(state.charges, studentsIn(state.charges))}
        <Card title="By school">
          <p className="mb-3 text-[13px] text-on-surface-variant">Each school sets its own fees; MOE reviews them here, read-only.</p>
          <AggTable
            label="School"
            groups={SCHOOLS.map((s) => [s.name, inSchool(s.code)] as [string, Charge[]]).filter(([, r]) => r.length)}
            extra={(k) => <RowAction onClick={() => { setSchool(SCHOOLS.find((s) => s.name === k)?.code ?? ""); setLevel(""); setFtId(""); }}>View fees</RowAction>}
          />
        </Card>
      </div>
    );
  }

  const name = SCHOOLS.find((s) => s.code === school)?.name ?? school;
  const all = inSchool(school);
  const levels = [...new Set(all.map((c) => studentOf(c.studentId)!.level))];
  const types = state.types.filter((f) => f.school === school);
  const rows = all.filter((c) => (!level || studentOf(c.studentId)!.level === level) && (!ftId || c.ftId === ftId));

  return (
    <div className="space-y-4">
      <button type="button" onClick={() => setSchool("")} className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
        <ArrowLeft size={16} weight="bold" aria-hidden="true" /> All schools
      </button>
      <h2 className="text-lg font-semibold">{name}: fee breakdown</h2>
      <div className="flex flex-wrap items-center gap-3">
        <select aria-label="Filter by level" className={selectClass} value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="">All levels</option>
          {levels.map((l) => <option key={l}>{l}</option>)}
        </select>
        <select aria-label="Filter by fee type" className={selectClass} value={ftId} onChange={(e) => setFtId(e.target.value)}>
          <option value="">All fee types</option>
          {types.map((f) => <option key={f.id} value={f.id}>{f.name}{f.level ? ` (${f.level})` : ""}</option>)}
        </select>
        <span className="text-[13px] text-on-surface-variant">{level || ftId ? `Filtered: ${rows.length} of ${all.length} charges` : "Filters apply to every table below."}</span>
      </div>
      {tiles(rows, studentsIn(rows))}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="By level"><AggTable label="Level" groups={group(rows, (c) => studentOf(c.studentId)!.level)} /></Card>
        <Card title="By class"><AggTable label="Class" groups={group(rows, (c) => studentOf(c.studentId)!.class)} /></Card>
      </div>
      <Card title="By fee type">
        <AggTable label="Fee type" groups={group(rows, (c) => state.types.find((f) => f.id === c.ftId)?.name ?? c.title)} extra={(_, rs) => {
          const f = state.types.find((x) => x.id === rs[0].ftId);
          return f ? <RowAction onClick={() => setTypeOpen(f)}>Components</RowAction> : null;
        }} />
      </Card>
      <Card title="By student">
        <AggTable label="Student" groups={group(rows, (c) => c.studentId).map(([id, rs]) => [`${studentOf(id)!.name} (${id})`, rs] as [string, Charge[]])} extra={(_, rs) => {
          const s = studentOf(rs[0].studentId)!;
          return <RowAction onClick={() => navigate(`/admin/students/${s.id}/fees`, { state: { student: s } })}>View fees</RowAction>;
        }} />
      </Card>
      <FeeTypeModal fee={typeOpen} used={typeOpen ? new Set(all.filter((c) => c.ftId === typeOpen.id).map((c) => c.studentId)).size : 0} onClose={() => setTypeOpen(null)} />
    </div>
  );
}
