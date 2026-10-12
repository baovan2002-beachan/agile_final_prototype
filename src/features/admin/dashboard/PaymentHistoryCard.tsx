import { CreditCard, FileText } from "@phosphor-icons/react";
import { Link } from "react-router";
import { Badge, type BadgeTone } from "../../../components/ui/Badge";
import { DataTable, type Column } from "../../../components/ui/DataTable";
import { EmptyState } from "../../../components/ui/EmptyState";
import { payments, type Payment, type PaymentStatus } from "../../../data/dashboard";
import { formatSGD } from "../../../lib/format";
import { DashCard, Loadable, Skeleton, useDashQuery } from "./DashCard";

const tone: Record<PaymentStatus, BadgeTone> = { Paid: "success", Upcoming: "primary", Overdue: "alert" };
// ASSUMPTION: no invoice detail screen yet; the invoice link opens the accounts area.
const INVOICES = "/admin/accounts";

const columns: Column<Payment>[] = [
  { key: "invoice", header: "Invoice No.", render: (p) => <span className="whitespace-nowrap font-medium">{p.invoice}</span> },
  { key: "date", header: "Payment Date", render: (p) => <span className="whitespace-nowrap text-on-surface-variant">{p.date}</span> },
  { key: "amount", header: "Amount", render: (p) => <span className="font-medium tabular-nums">{formatSGD(p.amount)}</span> },
  { key: "status", header: "Status", render: (p) => <Badge tone={tone[p.status]}>{p.status}</Badge> },
  {
    key: "doc",
    header: "View",
    align: "right",
    render: (p) => (
      <Link
        to={INVOICES}
        aria-label={`Open invoice ${p.invoice}`}
        className="inline-grid size-8 align-middle place-items-center rounded-full text-primary hover:bg-primary-fixed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary pointer-coarse:size-11"
      >
        <FileText size={18} aria-hidden="true" />
      </Link>
    ),
  },
];

export function PaymentHistoryCard() {
  const q = useDashQuery(payments);
  return (
    <DashCard title="Payment History" icon={CreditCard} to={INVOICES}>
      <Loadable
        query={q}
        what="payment history"
        skeleton={
          <div className="mt-4 space-y-3">
            {payments.map((p) => (
              <Skeleton key={p.invoice} className="h-10 w-full" />
            ))}
          </div>
        }
      >
        {(rows) => (
          <div className="-mx-3 mt-2">
            <DataTable
              columns={columns}
              rows={rows}
              rowKey={(p) => p.invoice}
              empty={<EmptyState title="No payments yet" hint="Payments appear here once invoices are issued." />}
            />
          </div>
        )}
      </Loadable>
    </DashCard>
  );
}
