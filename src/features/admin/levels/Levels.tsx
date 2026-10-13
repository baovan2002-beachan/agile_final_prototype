import { useState } from "react";
import { PencilSimple } from "@phosphor-icons/react";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { DataTable, type Column } from "../../../components/ui/DataTable";
import { Field, inputClass } from "../../../components/ui/Field";
import { Modal } from "../../../components/ui/Modal";
import { STUDENTS } from "../../../data/students";
import { CLASS_RECORDS, LEVEL_RECORDS, type LevelRecord } from "../../../data/schoolMgmt";

type Row = LevelRecord & { classes: number; students: number };

export default function Levels() {
  const [levels, setLevels] = useState(LEVEL_RECORDS);
  const [editing, setEditing] = useState<LevelRecord | null>(null);
  const [head, setHead] = useState("");
  const [errors, setErrors] = useState<{ head?: string }>({});
  const [notice, setNotice] = useState("");

  const rows: Row[] = levels.map((l) => ({ ...l, classes: CLASS_RECORDS.filter((c) => c.level === l.level).length, students: STUDENTS.filter((s) => s.level === l.level).length }));

  const open = (l: LevelRecord) => { setEditing(l); setHead(l.head); setErrors({}); };
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!head.trim()) next.head = "Enter the head of level.";
    setErrors(next);
    if (Object.keys(next).length || !editing) return;
    setLevels((all) => all.map((l) => (l.level === editing.level ? { ...l, head: head.trim() } : l)));
    setNotice(`${editing.level} was updated.`);
    setEditing(null);
  };

  const columns: Column<Row>[] = [
    { key: "level", header: "Level", sortable: true, render: (l) => <span className="font-medium">{l.level}</span> },
    { key: "students", header: "Students", sortable: true, align: "right" },
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
      <div role="status">
        {notice && <p className="rounded-control border border-line bg-surface-container-lowest px-4 py-3 text-sm font-medium">{notice}</p>}
      </div>
      <Card title="Levels">
        <p className="mb-3 text-[13px] text-on-surface-variant">Levels are fixed (P1 to Sec 4). Only the head of level can be changed.</p>
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
          <Field required label="Head of level" error={errors.head}>
            <input className={inputClass} value={head} onChange={(e) => setHead(e.target.value)} />
          </Field>
        </form>
      </Modal>
    </div>
  );
}
