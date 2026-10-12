import { useMemo, useState } from "react";
import { Eye, FileCsv, Plus } from "@phosphor-icons/react";
import { Badge, type BadgeTone } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { DataTable, type Column } from "../../../components/ui/DataTable";
import { EmptyState } from "../../../components/ui/EmptyState";
import { Field, inputClass } from "../../../components/ui/Field";
import { Modal } from "../../../components/ui/Modal";
import { CLASSES, LEVELS, STATUSES, STUDENTS, type SbfasStatus, type Student } from "../../../data/students";
import { formatSGD } from "../../../lib/format";
import AddStudentModal from "./AddStudentModal";
import ImportCsvModal from "./ImportCsvModal";
import { filterStudents, newStudent, NO_FILTERS, statusTone, type Filters } from "./logic";

const sbfasTone: Record<SbfasStatus, BadgeTone> = { Approved: "success", Pending: "warning", Rejected: "alert", "Not applied": "neutral" };
const ALL_CLASSES = LEVELS.flatMap((l) => CLASSES[l]);

export default function Students() {
  const [students, setStudents] = useState(STUDENTS);
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [adding, setAdding] = useState(false);
  const [importing, setImporting] = useState(false);
  const [viewing, setViewing] = useState<Student | null>(null);
  const [notice, setNotice] = useState("");

  // Memoised: DataTable resets to page 1 whenever the rows reference changes.
  const rows = useMemo(() => filterStudents(students, filters), [students, filters]);
  const filtered = filters.level || filters.class || filters.status;
  const classOptions = filters.level ? CLASSES[filters.level as (typeof LEVELS)[number]] : ALL_CLASSES;
  const reset = () => setFilters(NO_FILTERS);

  const columns: Column<Student>[] = [
    { key: "id", header: "ID", sortable: true },
    { key: "name", header: "Name", sortable: true, render: (s) => <span className="font-medium">{s.name}</span> },
    { key: "level", header: "Level", sortable: true },
    { key: "class", header: "Class", sortable: true },
    { key: "status", header: "Status", sortable: true, render: (s) => <Badge tone={statusTone[s.status]}>{s.status}</Badge> },
    { key: "balance", header: "Account balance", sortable: true, align: "right", render: (s) => formatSGD(s.balance) },
    { key: "sbfas", header: "SBFAS", sortable: true, render: (s) => <Badge tone={sbfasTone[s.sbfas]}>{s.sbfas}</Badge> },
    {
      key: "actions",
      header: "Actions",
      render: (s) => (
        <Button variant="ghost" size="sm" icon={<Eye size={16} aria-hidden />} aria-label={`View ${s.name}`} onClick={() => setViewing(s)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-on-surface-variant">
          {students.length} students enrolled. Education Account balances and SBFAS status are shown per student.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" icon={<FileCsv size={18} aria-hidden />} onClick={() => setImporting(true)}>Import CSV</Button>
          <Button icon={<Plus size={18} aria-hidden />} onClick={() => setAdding(true)}>Add student</Button>
        </div>
      </div>

      {notice && (
        <p role="status" className="rounded-control border border-line bg-surface-container-lowest px-4 py-3 text-sm font-medium text-on-surface">
          {notice}
        </p>
      )}

      <Card title="Student list">
        <div role="group" aria-label="Filters" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
          <Field label="Level">
            <select className={inputClass} value={filters.level} onChange={(e) => setFilters({ ...filters, level: e.target.value, class: "" })}>
              <option value="">All levels</option>
              {LEVELS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </Field>
          <Field label="Class">
            <select className={inputClass} value={filters.class} onChange={(e) => setFilters({ ...filters, class: e.target.value })}>
              <option value="">All classes</option>
              {classOptions.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select className={inputClass} value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option value="">All statuses</option>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Button variant="secondary" disabled={!filtered} onClick={reset}>Reset filters</Button>
        </div>
        <p aria-live="polite" className="mt-4 text-[13px] text-on-surface-variant">
          Showing {rows.length} of {students.length} students
        </p>
        <div className="mt-2">
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(s) => s.id}
            empty={
              <EmptyState
                title="No students match these filters"
                hint="Try a different level, class or status, or clear the filters to see everyone."
                action={<Button variant="secondary" onClick={reset}>Reset filters</Button>}
              />
            }
          />
        </div>
      </Card>

      <AddStudentModal
        open={adding}
        onClose={() => setAdding(false)}
        onAdd={(p) => {
          setStudents((all) => [newStudent(all, p), ...all]);
          setNotice(`${p.name.trim()} was added to ${p.class}.`);
        }}
      />
      <ImportCsvModal
        open={importing}
        onClose={() => setImporting(false)}
        onImport={(imported) => {
          setStudents((all) => {
            const added: Student[] = [];
            for (const r of imported) added.push(newStudent([...all, ...added], r));
            return [...added.reverse(), ...all];
          });
          setNotice(`Imported ${imported.length} students from CSV.`);
        }}
      />
      <Modal
        open={viewing !== null}
        onClose={() => setViewing(null)}
        title={viewing?.name ?? "Student"}
        footer={<Button variant="secondary" onClick={() => setViewing(null)}>Close</Button>}
      >
        {viewing && (
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
            {([
              ["Student ID", viewing.id],
              ["Level", viewing.level],
              ["Class", viewing.class],
              ["Status", viewing.status],
              ["Account balance", formatSGD(viewing.balance)],
              ["SBFAS", viewing.sbfas],
            ] as const).map(([k, val]) => (
              <div key={k} className="contents">
                <dt>{k}</dt>
                <dd className="font-medium text-on-surface">{val}</dd>
              </div>
            ))}
          </dl>
        )}
      </Modal>
    </div>
  );
}
