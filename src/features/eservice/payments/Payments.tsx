import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle } from "@phosphor-icons/react";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/EmptyState";
import { children as CHILDREN, invoices as INVOICES } from "../../../data/payments";
import { formatSGD } from "../../../lib/format";
import { useMockQuery } from "../../../lib/useMockQuery";
import { GatewayModal } from "./GatewayModal";
import { InvoiceList } from "./InvoiceList";
import { PaymentSummary } from "./PaymentSummary";
import { applyPayment, isPayable, settle, type Mode } from "./settle";

export default function Payments() {
  const query = useMockQuery(null);
  const [data, setData] = useState({ invoices: INVOICES, children: CHILDREN });
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [mode, setMode] = useState<Mode>("account-first");
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const msgRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (message) msgRef.current?.focus(); }, [message]);

  const summary = useMemo(() => settle(data.invoices, data.children, selected, mode), [data, selected, mode]);
  const payableIds = data.invoices.filter(isPayable).map((i) => i.id);

  const toggle = (id: string) => setSelected((s) => { const n = new Set(s); if (!n.delete(id)) n.add(id); return n; });
  const toggleAll = () => setSelected((s) => (payableIds.every((id) => s.has(id)) ? new Set() : new Set(payableIds)));

  const onPaid = useCallback(() => {
    setData((d) => applyPayment(d.invoices, d.children, selected, mode));
    setMessage(`Payment of ${formatSGD(summary.total)} received for ${selected.size} ${selected.size === 1 ? "invoice" : "invoices"}.`);
    setSelected(new Set());
  }, [selected, mode, summary.total]);

  return (
    <div className="space-y-4">
      <div ref={msgRef} tabIndex={-1} aria-live="polite" className="outline-none empty:hidden">
        {message && (
          <p className="flex items-center gap-2 rounded-control border border-line bg-success-container px-3 py-2 text-sm font-medium text-success">
            <CheckCircle size={18} weight="bold" aria-hidden="true" /> {message}
          </p>
        )}
      </div>
      {query.status === "loading" && <div aria-busy="true" aria-label="Loading payments" className="space-y-3">{[0, 1, 2, 3].map((i) => <div key={i} className="h-14 animate-pulse rounded-control bg-track" />)}</div>}
      {query.status === "error" && <Card><EmptyState title="Could not load invoices" hint="Check your connection and try again." action={<Button onClick={query.retry}>Retry</Button>} /></Card>}
      {query.status === "ready" && (
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="space-y-4">
            <Card title="Education Account balances">
              <ul className="grid gap-3 sm:grid-cols-2">
                {data.children.map((c) => (
                  <li key={c.id} className="rounded-control border border-line px-4 py-3">
                    <span className="block text-[13px] text-on-surface-variant">{c.name} - {c.level}</span>
                    <span className="block text-xl font-bold tabular-nums">{formatSGD(c.educationBalance)}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card title="Outstanding invoices">
              {payableIds.length === 0 && <EmptyState title="All invoices are paid" hint="You have no outstanding charges." />}
              <InvoiceList invoices={data.invoices} kids={data.children} selected={selected} onToggle={toggle} onToggleAll={toggleAll} />
            </Card>
          </div>
          <PaymentSummary summary={summary} mode={mode} onMode={setMode} onAuthorize={() => setOpen(true)} />
        </div>
      )}
      <GatewayModal open={open} summary={summary} onClose={() => setOpen(false)} onPaid={onPaid} />
    </div>
  );
}
