import { useEffect, useState } from "react";
import { CheckCircle, CircleNotch, WarningOctagon } from "@phosphor-icons/react";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { formatSGD } from "../../../lib/format";
import type { Summary } from "./settle";

type Phase = "review" | "processing" | "success" | "failed";
type Props = { open: boolean; summary: Summary; onClose: () => void; onPaid: () => void };

/** Simulated payment gateway. ASSUMPTION: no real gateway; processing takes 1.5s and can be forced to fail. */
export function GatewayModal({ open, summary, onClose, onPaid }: Props) {
  const [phase, setPhase] = useState<Phase>("review");
  const [fail, setFail] = useState(false);
  // Freeze the summary at open: the page's selection is cleared once the payment succeeds.
  const [snap, setSnap] = useState(summary);
  useEffect(() => {
    if (open) { setPhase("review"); setFail(false); setSnap(summary); }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- snapshot only when the modal opens
  }, [open]);

  useEffect(() => {
    if (phase !== "processing") return;
    const id = setTimeout(() => {
      if (fail) return setPhase("failed");
      setPhase("success");
      onPaid();
    }, 1500);
    return () => clearTimeout(id);
  }, [phase, fail, onPaid]);

  const busy = phase === "processing";
  const viaGateway = snap.fromGateway > 0;
  const footer =
    phase === "review" ? (
      <>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={() => setPhase("processing")}>{viaGateway ? `Pay ${formatSGD(snap.fromGateway)}` : "Confirm payment"}</Button>
      </>
    ) : phase === "failed" ? (
      <>
        <Button variant="secondary" onClick={onClose}>Close</Button>
        <Button onClick={() => { setFail(false); setPhase("review"); }}>Try again</Button>
      </>
    ) : phase === "success" ? (
      <Button onClick={onClose}>Done</Button>
    ) : null;

  return (
    <Modal open={open} onClose={() => !busy && onClose()} title="Mock payment gateway" footer={footer}>
      <div aria-live="polite">
        {phase === "review" && (
          <>
            <p className="flex items-center gap-2"><Badge tone="neutral">Simulated</Badge> No real money moves.</p>
            <dl className="mt-3 divide-y divide-line text-on-surface">
              <div className="flex justify-between py-1.5"><dt className="text-on-surface-variant">Education Account</dt><dd className="tabular-nums">{formatSGD(snap.fromAccount)}</dd></div>
              <div className="flex justify-between py-1.5"><dt className="text-on-surface-variant">Card or bank</dt><dd className="tabular-nums">{formatSGD(snap.fromGateway)}</dd></div>
              <div className="flex justify-between py-1.5 font-bold"><dt>Total</dt><dd className="tabular-nums">{formatSGD(snap.total)}</dd></div>
            </dl>
            {!viaGateway && <p className="mt-2">Fully covered by the Education Account, so no card or bank payment is needed.</p>}
            <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-3">
              <input type="checkbox" className="size-5 accent-primary" checked={fail} onChange={(e) => setFail(e.target.checked)} />
              Simulate a failed payment
            </label>
          </>
        )}
        {phase === "processing" && (
          <p role="status" className="flex items-center gap-3 py-4 font-medium text-on-surface">
            <CircleNotch size={24} className="animate-spin text-primary motion-reduce:animate-none" aria-hidden="true" /> Processing payment, please wait...
          </p>
        )}
        {phase === "success" && (
          <p className="flex items-start gap-3 py-2 font-medium text-on-surface">
            <CheckCircle size={24} weight="fill" className="shrink-0 text-success" aria-hidden="true" />
            Payment of {formatSGD(snap.total)} successful. The invoices are marked paid and the Education Account balance is updated.
          </p>
        )}
        {phase === "failed" && (
          <p role="alert" className="flex items-start gap-3 py-2 font-medium text-on-surface">
            <WarningOctagon size={24} weight="fill" className="shrink-0 text-alert" aria-hidden="true" />
            The payment was declined by the gateway. Nothing was charged and your invoices are unchanged.
          </p>
        )}
      </div>
    </Modal>
  );
}
