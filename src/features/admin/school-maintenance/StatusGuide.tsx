const IMPACT = [
  ["Student", "Cannot assign new students; existing students stay visible, read-only.", "Assignment allowed."],
  ["Class / Level", "Classes cannot be added or edited.", "Maintained as normal."],
  ["Top-up", "Excluded from batch rules and ad-hoc top-ups.", "Eligible."],
  ["Fee", "No new fee charges; outstanding fees can still be paid.", "Fees charged each cycle."],
  ["FAS / Budget", "No new SBFAS grants; past grants and budget history kept.", "SBFAS can be granted."],
  ["Parent portal", "Children show a \"school inactive\" note; payments still work.", "Normal."],
] as const;

/** Req 3: school state diagram (Active <-> Inactive) and what each state does to other features. */
export default function StatusGuide() {
  return (
    <div className="grid gap-5">
      <svg viewBox="0 0 520 110" role="img" aria-label="Active and Inactive states; edit the school to move between them" className="mx-auto w-full max-w-xl">
        <defs>
          <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0L10 5L0 10z" className="fill-on-surface-variant" />
          </marker>
        </defs>
        <circle cx="20" cy="55" r="6" className="fill-on-surface" />
        <line x1="26" y1="55" x2="70" y2="55" className="stroke-on-surface-variant" strokeWidth="1.5" markerEnd="url(#arr)" />
        <rect x="75" y="30" width="130" height="50" rx="12" className="fill-surface-container-lowest stroke-primary" strokeWidth="2" />
        <text x="140" y="60" textAnchor="middle" className="fill-on-surface text-sm font-semibold">Active</text>
        <rect x="315" y="30" width="130" height="50" rx="12" className="fill-surface-container-lowest stroke-outline" strokeWidth="2" />
        <text x="380" y="60" textAnchor="middle" className="fill-on-surface text-sm font-semibold">Inactive</text>
        <path d="M205 45 H315" className="stroke-on-surface-variant" fill="none" strokeWidth="1.5" markerEnd="url(#arr)" />
        <text x="260" y="38" textAnchor="middle" className="fill-on-surface-variant text-[11px]">deactivate</text>
        <path d="M315 68 H205" className="stroke-on-surface-variant" fill="none" strokeWidth="1.5" markerEnd="url(#arr)" />
        <text x="260" y="88" textAnchor="middle" className="fill-on-surface-variant text-[11px]">reactivate</text>
      </svg>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Effect of school status on other features</caption>
          <thead>
            <tr className="text-on-surface-variant">
              <th scope="col" className="py-1.5 pr-3 font-medium">Feature</th>
              <th scope="col" className="py-1.5 pr-3 font-medium">Inactive</th>
              <th scope="col" className="py-1.5 font-medium">Active</th>
            </tr>
          </thead>
          <tbody>
            {IMPACT.map(([f, off, on]) => (
              <tr key={f} className="border-t border-line align-top">
                <th scope="row" className="py-1.5 pr-3 font-medium text-on-surface">{f}</th>
                <td className="py-1.5 pr-3">{off}</td>
                <td className="py-1.5">{on}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
