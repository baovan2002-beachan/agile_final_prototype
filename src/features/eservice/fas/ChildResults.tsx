import { Badge, type BadgeTone } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import { children } from "../../../data/parent";
import type { Band } from "../../../data/familyFas";
import { assess } from "./logic";
import { AssumptionTag } from "./shared";

const tone: Record<string, BadgeTone> = { Indicative: "success", "School decides": "warning", "Not eligible": "neutral" };

export function ChildResults({ band }: { band: Band | undefined }) {
  const r = band ? assess(band) : null;
  return (
    <Card title="Result per child">
      <ul className="space-y-3">
        {children.map((c) => (
          <li key={c.id} className="rounded-control border border-line px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">{c.name}</p>
                <p className="text-[13px] text-on-surface-variant">{c.level}, {c.school}</p>
              </div>
              {r ? <Badge tone={tone[r.status]}>{r.scheme ? `${r.scheme}${r.tier ? ` ${r.tier}` : ""} - ` : ""}{r.status}</Badge> : <Badge tone="neutral">Not synced</Badge>}
            </div>
            <p className="mt-2 text-[13px] text-on-surface-variant">{r ? r.note : "Sync your household income band to see a result."}</p>
          </li>
        ))}
      </ul>
      <p className="mt-3 flex flex-wrap items-center gap-2 text-[13px] text-on-surface-variant">
        <AssumptionTag /> Results are indicative until review ends. MOEFAS takes precedence: SBFAS is only considered when MOEFAS is not granted.
      </p>
    </Card>
  );
}
