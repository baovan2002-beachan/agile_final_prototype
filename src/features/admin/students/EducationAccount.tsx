import { Badge } from "../../../components/ui/Badge";
import type { Student } from "../../../data/students";
import { formatSGD } from "../../../lib/format";
import { ACCOUNT_CLOSES_AT, ACCOUNT_OPENS_AT, accountStatus, ledgerFor } from "../../../lib/accounts";

/** Req 1: Education Account of a student (opens at 7, closes at 16; balance goes to CPF by default). */
export default function EducationAccount({ student }: { student: Student }) {
  const status = accountStatus(student.level);
  const entries = ledgerFor(student);
  return (
    <section aria-labelledby="edu-acct" className="mt-5 border-t border-line pt-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id="edu-acct" className="text-base font-semibold text-on-surface">Education Account</h3>
        <Badge tone={status === "Active" ? "success" : "warning"}>{status}</Badge>
      </div>
      <p className="mt-2 text-sm">
        Balance <strong className="text-on-surface">{formatSGD(student.balance)}</strong>. Opens when the child turns {ACCOUNT_OPENS_AT} and
        closes at {ACCOUNT_CLOSES_AT}; the balance then goes to the CPF account by default.
      </p>
      <table className="mt-3 w-full text-left text-sm">
        <caption className="sr-only">Education Account transactions for {student.name}</caption>
        <thead>
          <tr className="text-on-surface-variant">
            <th scope="col" className="py-1 font-medium">Date</th>
            <th scope="col" className="py-1 font-medium">Description</th>
            <th scope="col" className="py-1 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.description} className="border-t border-line">
              <td className="py-1.5 pr-3">{e.date}</td>
              <td className="py-1.5 pr-3">{e.description}</td>
              <td className="py-1.5 text-right font-medium text-on-surface">{e.amount < 0 ? "-" : "+"}{formatSGD(Math.abs(e.amount))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
