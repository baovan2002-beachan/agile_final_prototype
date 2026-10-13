import { useMemo, useState } from "react";
import { PencilSimple, Plus } from "@phosphor-icons/react";
import { AssumptionTag } from "../../../components/ui/AssumptionTag";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { DataTable, type Column } from "../../../components/ui/DataTable";
import { EmptyState } from "../../../components/ui/EmptyState";
import { Field, inputClass } from "../../../components/ui/Field";
import { SCHOOL_RECORDS, type SchoolRecord } from "../../../data/schoolMgmt";
import SchoolFormModal, { SCHOOL_TYPES } from "./SchoolFormModal";

export default function SchoolMaintenance() {
  const [schools, setSchools] = useState(SCHOOL_RECORDS);
  const [type, setType] = useState("");
  const [q, setQ] = useState("");
  const [form, setForm] = useState<{ editing: SchoolRecord | null } | null>(null);
  const [notice, setNotice] = useState("");

  // Memoised: DataTable goes back to page 1 whenever the rows reference changes.
  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return schools.filter((s) => (!type || s.level === type) && (!needle || `${s.code} ${s.name}`.toLowerCase().includes(needle)));
  }, [schools, type, q]);
  const reset = () => { setType(""); setQ(""); };
  const save = (s: SchoolRecord) => {
    const exists = schools.some((x) => x.code === s.code);
    setSchools((all) => (exists ? all.map((x) => (x.code === s.code ? s : x)) : [s, ...all]));
    setNotice(`${s.name} was ${exists ? "updated" : "added"}.`);
  };

  const columns: Column<SchoolRecord>[] = [
    { key: "code", header: "Code", sortable: true },
    { key: "name", header: "School", sortable: true, render: (s) => <span className="font-medium">{s.name}</span> },
    { key: "level", header: "Type", sortable: true },
    { key: "principal", header: "Principal", sortable: true },
    { key: "students", header: "Students", sortable: true, align: "right", render: (s) => s.students.toLocaleString("en-SG") },
    { key: "active", header: "Status", sortable: true, render: (s) => <Badge tone={s.active ? "success" : "neutral"}>{s.active ? "Active" : "Inactive"}</Badge> },
    {
      key: "actions",
      header: "Actions",
      render: (s) => (
        <Button variant="ghost" size="sm" icon={<PencilSimple size={16} aria-hidden />} aria-label={`Edit ${s.name}`} onClick={() => setForm({ editing: s })}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex flex-wrap items-center gap-2 text-sm text-on-surface-variant">
          Maintain the school master list.
          <AssumptionTag>Deactivating a school only changes its status here.</AssumptionTag>
        </p>
        <Button icon={<Plus size={18} aria-hidden />} onClick={() => setForm({ editing: null })}>Add school</Button>
      </div>
      <div role="status">
        {notice && <p className="rounded-control border border-line bg-surface-container-lowest px-4 py-3 text-sm font-medium">{notice}</p>}
      </div>
      <Card title="Schools">
        <div role="group" aria-label="Filters" className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <Field label="Search by code or name">
            <input className={inputClass} value={q} onChange={(e) => setQ(e.target.value)} />
          </Field>
          <Field label="School type">
            <select className={inputClass} value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">All types</option>
              {SCHOOL_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Button variant="secondary" disabled={!type && !q} onClick={reset}>Reset filters</Button>
        </div>
        <p aria-live="polite" className="mt-4 text-[13px] text-on-surface-variant">
          Showing {rows.length} of {schools.length} schools
        </p>
        <div className="mt-2">
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(s) => s.code}
            empty={<EmptyState title="No schools match" hint="Change the search or type filter." action={<Button variant="secondary" onClick={reset}>Reset filters</Button>} />}
          />
        </div>
      </Card>
      {form && <SchoolFormModal key={form.editing?.code ?? "new"} open editing={form.editing} all={schools} onClose={() => setForm(null)} onSave={save} />}
    </div>
  );
}
