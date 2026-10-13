import { useState } from "react";
import { PencilSimple } from "@phosphor-icons/react";
import { AssumptionTag } from "../../../components/ui/AssumptionTag";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { DataTable, type Column } from "../../../components/ui/DataTable";
import { Field, inputClass } from "../../../components/ui/Field";
import { Modal } from "../../../components/ui/Modal";
import { CLASS_RECORDS, LEVEL_RECORDS, type LevelRecord } from "../../../data/schoolMgmt";
import HqPermissionNote from "../HqPermissionNote";

type Row = LevelRecord & { classes: number };

export default function Levels() {
  const [levels, setLevels] = useState(LEVEL_RECORDS);
  const [editing, setEditing] = useState<LevelRecord | null>(null);
  const [cohort, setCohort] = useState("");
  const [head, setHead] = useState("");
  const [errors, setErrors] = useState<{ cohort?: string; head?: string }>({});
  const [notice, setNotice] = useState("");

  const rows: Row[] = levels.map((l) => ({ ...l, classes: CLASS_RECORDS.filter((c) => c.level === l.level).length }));
  const total = levels.reduce((t, l) => t + l.cohort, 0);

  const open = (l: LevelRecord) => { setEditing(l); setCohort(String(l.cohort)); setHead(l.head); setErrors({}); };
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(cohort);
    const next: typeof errors = {};
    if (!/^\d+$/.test(cohort.trim()) || n < 1 || n > 1000) next.cohort = "Enter a whole number from 1 to 1,000.";
    if (!head.trim()) next.head = "Enter the head of level.";
    setErrors(next);
    if (Object.keys(next).length || !editing) return;
    setLevels((all) => all.map((l) => (l.level === editing.level ? { ...l, cohort: n, head: head.trim() } : l)));
    setNotice(`${editing.level} was updated.`);
    setEditing(null);
  };

  const columns: Column<Row>[] = [
    { key: "level", header: "Level", sortable: true, render: (l) => <span className="font-medium">{l.level}</span> },
    { key: "cohort", header: "Cohort size", sortable: true, align: "right" },
    { key: "classes", header: "Classes", sortable: true, align: "right" },
    { key: "head", header: "Head of level", sortable: true },
    {
      key: "actions",
      header: "Actions",
      render: (l) => (
        <Button variant="ghost" size="sm" icon={<PencilSimple size={16} aria-hidden />} aria-label={`Edit ${l.level}`} onClick={() => open(l)}>Edit</Button>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
      <HqPermissionNote />
      <p className="flex flex-wrap items-center gap-2 text-sm text-on-surface-variant">
        Levels and cohorts for Greenfield Secondary School: {total.toLocaleString("en-SG")} students in {rows.length} levels.
        <AssumptionTag>Levels are fixed by MOE; you can edit cohort size and head of level but not add levels.</AssumptionTag>
      </p>
      <div role="status">
        {notice && <p className="rounded-control border border-line bg-surface-container-lowest px-4 py-3 text-sm font-medium">{notice}</p>}
      </div>
      <Card title="Levels and cohorts">
        <DataTable columns={columns} rows={rows} rowKey={(l) => l.level} pageSize={12} empty={<p>No levels.</p>} />
      </Card>
      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={`Edit ${editing?.level ?? "level"}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" form="level-form">Save</Button>
          </>
        }
      >
        <form id="level-form" onSubmit={save} noValidate className="grid gap-4">
          <Field label="Cohort size" error={errors.cohort}>
            <input className={inputClass} inputMode="numeric" value={cohort} onChange={(e) => setCohort(e.target.value)} />
          </Field>
          <Field label="Head of level" error={errors.head}>
            <input className={inputClass} value={head} onChange={(e) => setHead(e.target.value)} />
          </Field>
        </form>
      </Modal>
    </div>
  );
}
