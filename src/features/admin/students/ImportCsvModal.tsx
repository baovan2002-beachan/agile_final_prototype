import { useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Field, inputClass } from "../../../components/ui/Field";
import { Modal } from "../../../components/ui/Modal";
import { parseStudentCsv, type CsvResult, type CsvRow } from "./logic";

type Props = { open: boolean; onClose: () => void; onImport: (rows: CsvRow[]) => void };

export default function ImportCsvModal({ open, onClose, onImport }: Props) {
  const [result, setResult] = useState<CsvResult | null>(null);
  const [nonce, setNonce] = useState(0); // remount the file input to clear it

  const close = () => {
    setResult(null);
    setNonce((n) => n + 1);
    onClose();
  };
  const pick = async (file?: File) => {
    if (!file) return setResult(null);
    // Name is checked first, so a non-.csv file is rejected without reading it.
    setResult(parseStudentCsv(file.name, /\.csv$/i.test(file.name) ? await file.text() : ""));
  };
  const error = result && "error" in result ? result.error : undefined;
  const ok = result && "rows" in result ? result : undefined;

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
            {ok ? `Import ${ok.rows.length} students` : "Import"}
          </Button>
        </>
      }
    >
      <Field
        label="CSV file"
        error={error}
        hint="Header row required with the columns: name, level, class. Example row: Amy Lim,P1,P1 Courage"
      >
        <input
          key={nonce}
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => pick(e.target.files?.[0])}
          className={`${inputClass} py-2 file:mr-3 file:rounded-control file:border-0 file:bg-primary-fixed file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-primary`}
        />
      </Field>
      {ok && (
        <div className="mt-4" role="status">
          <p className="font-semibold text-on-surface">
            {ok.total} rows found, {ok.rows.length} valid
            {ok.skipped > 0 && <span className="font-normal text-on-surface-variant"> ({ok.skipped} skipped: missing name or unknown level)</span>}
          </p>
          <p className="mt-2 text-[13px]">First {Math.min(3, ok.rows.length)} valid rows</p>
          {ok.rows.length > 0 && (
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
                  <tr key={i} className="border-b border-line last:border-0 text-on-surface">
                    <td className="py-1.5 pr-3">{r.name}</td>
                    <td className="py-1.5 pr-3">{r.level}</td>
                    <td className="py-1.5">{r.class}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </Modal>
  );
}
