import { ArrowLeft } from "@phosphor-icons/react";
import { Link } from "react-router";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import { DataTable, type Column } from "../../../components/ui/DataTable";
import { EmptyState } from "../../../components/ui/EmptyState";
import { FEE_TYPES, cycleLabel, type FeeType } from "../../../data/fees";
import { formatSGD } from "../../../lib/format";
import { isFeePaid } from "../../../lib/accounts";
import { useStudent } from "./useStudent";

type Row = FeeType & { paid: boolean };

/** Req 3: a school views each fee type charged to one student. */
export default function StudentFees() {
  const student = useStudent();

  if (!student) {
    return (
      <Card>
        <EmptyState as="h2" title="Student not found" action={<Link to="/admin/students" className="text-primary underline">Back to students</Link>} />
      </Card>
    );
  }
  const rows: Row[] = FEE_TYPES.map((f) => ({ ...f, paid: isFeePaid(f.name, student) }));
  const total = rows.filter((r) => !r.paid).reduce((t, r) => t + r.amount, 0);
  const columns: Column<Row>[] = [
    { key: "name", header: "Fee type", sortable: true, render: (f) => <span className="font-medium">{f.name}</span> },
    { key: "cycle", header: "Cycle", render: (f) => cycleLabel(f.cycle) },
    { key: "amount", header: "Amount", sortable: true, align: "right", render: (f) => formatSGD(f.amount) },
    { key: "paid", header: "Status", sortable: true, render: (f) => <Badge tone={f.paid ? "success" : "warning"}>{f.paid ? "Paid" : "Unpaid"}</Badge> },
  ];

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
      <Link to={`/admin/students/${student.id}/account`} state={{ student }} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
        <ArrowLeft size={16} aria-hidden /> Back to Education Account
      </Link>
      <Card title={`Fees for ${student.name}`}>
        <p className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span>{student.id}</span>
          <span>{student.level}, {student.class}</span>
          <span>Account balance <strong className="text-on-surface">{formatSGD(student.balance)}</strong></span>
          <span>SBFAS <Badge tone="neutral">{student.sbfas}</Badge></span>
        </p>
        <DataTable columns={columns} rows={rows} rowKey={(f) => f.id} pageSize={12} empty={<p>No fee types.</p>} />
        <p className="mt-4 text-right text-sm">Total unpaid <strong className="text-on-surface">{formatSGD(total)}</strong>{total > student.balance && <span className="text-alert"> (exceeds account balance)</span>}</p>
      </Card>
    </div>
  );
}
