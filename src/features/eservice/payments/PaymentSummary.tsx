import { AssumptionTag } from "../../../components/ui/AssumptionTag";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { formatSGD } from "../../../lib/format";
import type { Mode, Summary } from "./settle";

const OPTIONS: { value: Mode; title: string; hint: string }[] = [
  { value: "account-first", title: "Education Account first, remainder by card/bank", hint: "Each child's Education Account pays that child's invoices; any shortfall goes to the gateway." },
  { value: "gateway", title: "Gateway only", hint: "Pay the full amount by card or bank. Education Account balances stay untouched." },
];

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-3 py-1.5 text-sm ${strong ? "font-bold" : ""}`}>
      <dt className={strong ? "" : "text-on-surface-variant"}>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}

type Props = { summary: Summary; mode: Mode; onMode: (m: Mode) => void; onAuthorize: () => void };

export function PaymentSummary({ summary, mode, onMode, onAuthorize }: Props) {
  const { total, fromAccount, fromGateway, lines } = summary;
  return (
    <Card title="Payment summary" action={<AssumptionTag />} className="lg:sticky lg:top-4">
      <fieldset>
        <legend className="mb-2 text-[13px] font-semibold">Payment method</legend>
        <div className="space-y-2">
          {OPTIONS.map((o) => (
            <label key={o.value} className={`flex cursor-pointer items-start gap-3 rounded-control border p-3 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary ${mode === o.value ? "border-primary bg-primary-fixed/40" : "border-line"}`}>
              <input type="radio" name="pay-mode" className="mt-0.5 size-5 shrink-0 accent-primary" checked={mode === o.value} onChange={() => onMode(o.value)} />
              <span>
                <span className="block text-sm font-semibold">{o.title}</span>
                <span className="block text-[13px] text-on-surface-variant">{o.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <p className="mt-2 text-[13px] text-on-surface-variant">Assumption: the split rule is invented and still to be confirmed with MOE.</p>

      <dl aria-live="polite" className="mt-4 border-t border-line pt-3">
        {lines.map((l) => (
          <Row key={l.child.id} label={`${l.child.name} (${l.child.level})`} value={formatSGD(l.total)} />
        ))}
        {lines.length === 0 && (
          <div className="py-1.5 text-sm text-on-surface-variant">
            <dt className="sr-only">Selection</dt>
            <dd>No invoices selected. Tick an invoice to see the breakdown.</dd>
          </div>
        )}
        <div className="mt-2 border-t border-line pt-2">
          <Row label="Education Account" value={formatSGD(fromAccount)} />
          <Row label="Card or bank (gateway)" value={formatSGD(fromGateway)} />
          <Row label="Total to pay" value={formatSGD(total)} strong />
        </div>
      </dl>
      <Button className="mt-4 w-full" disabled={total <= 0} onClick={onAuthorize}>Authorize payment</Button>
      {total <= 0 && <p className="mt-2 text-center text-[13px] text-on-surface-variant">Select at least one invoice to continue.</p>}
    </Card>
  );
}
