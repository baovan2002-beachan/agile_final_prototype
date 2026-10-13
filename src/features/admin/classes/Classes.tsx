import { useMemo, useState } from "react";
import { HeaderActions } from "../../../components/layout/HeaderActions";
import { PencilSimple, Plus, UsersThree } from "@phosphor-icons/react";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { DataTable, type Column } from "../../../components/ui/DataTable";
import { EmptyState } from "../../../components/ui/EmptyState";
import { Field, inputClass } from "../../../components/ui/Field";
import { Modal } from "../../../components/ui/Modal";
import { CLASS_RECORDS, type ClassRecord } from "../../../data/schoolMgmt";
import { LEVELS, STUDENTS } from "../../../data/students";
import ClassFormModal from "./ClassFormModal";

type Row = ClassRecord & { students: number };
const count = (name: string) => STUDENTS.filter((s) => s.class === name).length;

export default function Classes() {
  const [classes, setClasses] = useState(CLASS_RECORDS);
  const [level, setLevel] = useState("");
  const [form, setForm] = useState<{ editing: ClassRecord | null } | null>(null);
  const [roster, setRoster] = useState<ClassRecord | null>(null);
  const [notice, setNotice] = useState("");

  const rows: Row[] = useMemo(
    () => classes.filter((c) => !level || c.level === level).map((c) => ({ ...c, students: count(c.name) })),
    [classes, level],
  );
  const save = (c: ClassRecord) => {
    const exists = form?.editing != null;
    setClasses((all) => (exists ? all.map((x) => (x.name === form!.editing!.name ? c : x)) : [c, ...all]));
    setNotice(`${c.name} was ${exists ? "updated" : "added"}.`);
  };

  const columns: Column<Row>[] = [
    { key: "name", header: "Class", sortable: true, render: (c) => <span className="font-medium">{c.name}</span> },
    { key: "level", header: "Level", sortable: true },
    { key: "teacher", header: "Form teacher", sortable: true },
    { key: "room", header: "Room", sortable: true },
    {
      key: "students",
      header: "Students",
      sortable: true,
      align: "right",
      render: (c) => (
        <Badge tone={c.students >= c.capacity ? "warning" : "neutral"}>
          {c.students} / {c.capacity}{c.students >= c.capacity ? " full" : ""}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (c) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" icon={<UsersThree size={16} aria-hidden />} aria-label={`View students in ${c.name}`} onClick={() => setRoster(c)}>Students</Button>
          <Button variant="ghost" size="sm" icon={<PencilSimple size={16} aria-hidden />} aria-label={`Edit ${c.name}`} onClick={() => setForm({ editing: c })}>Edit</Button>
        </div>
      ),
    },
  ];
  const rosterStudents = roster ? STUDENTS.filter((s) => s.class === roster.name) : [];

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
      <HeaderActions>
        <Button icon={<Plus size={18} aria-hidden />} onClick={() => setForm({ editing: null })}>Add class</Button>
      </HeaderActions>
      <div role="status" className="empty:hidden">
        {notice && <p className="rounded-control border border-line bg-surface-container-lowest px-4 py-3 text-sm font-medium">{notice}</p>}
      </div>
      <Card title="Classes">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,16rem)_auto] sm:items-end">
          <Field label="Level">
            <select className={inputClass} value={level} onChange={(e) => setLevel(e.target.value)}>
              <option value="">All levels</option>
              {LEVELS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </Field>
          <Button className="justify-self-start" variant="secondary" disabled={!level} onClick={() => setLevel("")}>Reset filters</Button>
        </div>
        <p aria-live="polite" className="mt-4 text-[13px] text-on-surface-variant">Showing {rows.length} of {classes.length} classes</p>
        <div className="mt-2">
          <DataTable columns={columns} rows={rows} rowKey={(c) => c.name} empty={<EmptyState title="No classes at this level" hint="Add a class or choose another level." />} />
        </div>
      </Card>
      {form && (
        <ClassFormModal
          key={form.editing?.name ?? "new"}
          editing={form.editing}
          all={classes}
          enrolled={form.editing ? count(form.editing.name) : 0}
          onClose={() => setForm(null)}
          onSave={save}
        />
      )}
      <Modal open={roster !== null} onClose={() => setRoster(null)} title={roster ? `Students in ${roster.name}` : "Students"} footer={<Button variant="secondary" onClick={() => setRoster(null)}>Close</Button>}>
        {rosterStudents.length === 0 ? (
          <p>No students are assigned to this class yet.</p>
        ) : (
          <ul className="grid gap-1">
            {rosterStudents.map((s) => <li key={s.id}>{s.name} <span className="text-on-surface-variant">({s.id})</span></li>)}
          </ul>
        )}
      </Modal>
    </div>
  );
}
