import { useRef, useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Field, inputClass } from "../../../components/ui/Field";
import { Modal } from "../../../components/ui/Modal";
import { parseStudentCsv, plural, type CsvResult, type CsvRow } from "./logic";

type Props = { open: boolean; onClose: () => void; onImport: (rows: CsvRow[]) => void };

export default function ImportCsvModal({ open, onClose, onImport }: Props) {
  const [result, setResult] = useState<CsvResult | null>(null);
  const [nonce, setNonce] = useState(0); // remount the file input to clear it
  const req = useRef(0); // latest file selection wins; stale async reads are ignored

  const close = () => {
    req.current++;
    setResult(null);
    setNonce((n) => n + 1);
    onClose();
  };
  const pick = async (file?: File) => {
    const mine = ++req.current;
    if (!file) return setResult(null);
    let next: CsvResult;
    try {
      // Name is checked first, so a non-.csv file is rejected without reading it.
      next = parseStudentCsv(file.name, /\.csv$/i.test(file.name) ? await file.text() : "");
    } catch {
      next = { error: "The file could not be read. Please try again or choose another file." };
    }
    if (mine === req.current) setResult(next);
  };
  const error = result && "error" in result ? result.error : undefined;
  const ok = result && "rows" in result ? result : undefined;
  const reasons = ok ? Object.entries(ok.reasons).map(([why, n]) => `${n} ${why}`).join(", ") : "";

  return (
    <Modal
      open={open}
      onClose={close}
      title="Import students from CSV"
      footer={
        <>
          <Button variant="secondary" onClick={close}>Cancel</Button>
          <Button
            disabled={!ok || ok.rows.length === 0}
            onClick={() => {
              onImport(ok!.rows);
              close();
            }}
          >
            {ok ? `Import ${plural(ok.rows.length, "student")}` : "Import"}
          </Button>
        </>
      }
    >
      <Field required label="CSV file" error={error} hint="Example row: Amy Lim,P1,P1 Courage. Use quotes around values that contain a comma.">
        <input
          key={nonce}
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => pick(e.target.files?.[0])}
          className={`${inputClass} py-2 file:mr-3 file:rounded-control file:border-0 file:bg-primary-fixed file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-primary`}
        />
      </Field>
      <p className="mt-3 text-[13px] text-on-surface-variant">Header row: name, level, class. Invalid rows are skipped.</p>
      {/* Live region is always mounted (empty first) so screen readers announce the result when it fills. */}
      <div role="status" className={ok ? "mt-4" : undefined}>
        {ok && (
          <>
            <p className="font-semibold text-on-surface">
              {plural(ok.total, "row")} found, {ok.rows.length} valid
              {ok.skipped > 0 && <span className="font-normal text-on-surface-variant"> ({ok.skipped} skipped: {reasons})</span>}
            </p>
            {ok.rows.length > 0 && (
              <>
                <p className="mt-2 text-[13px]">First {plural(Math.min(3, ok.rows.length), "valid row")}</p>
                <table className="mt-1 w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-line">
                      <th scope="col" className="py-1.5 pr-3 font-medium">Name</th>
                      <th scope="col" className="py-1.5 pr-3 font-medium">Level</th>
                      <th scope="col" className="py-1.5 font-medium">Class</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ok.rows.slice(0, 3).map((r, i) => (
                      <tr key={i} className="border-b border-line text-on-surface last:border-0">
                        <td className="py-1.5 pr-3">{r.name}</td>
                        <td className="py-1.5 pr-3">{r.level}</td>
                        <td className="py-1.5">{r.class}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
