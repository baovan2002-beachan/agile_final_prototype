import { ChartBar } from "@phosphor-icons/react";
import { fasByTier } from "../../../data/dashboard";
import { CardFoot, DashCard, Loadable, Skeleton, useDashQuery } from "./DashCard";

const nf = new Intl.NumberFormat("en-US");
// Burgundy ramp from tier 1 (darkest) to tier 4 (lightest); text values carry the meaning.
const fills = ["bg-primary", "bg-primary-container", "bg-primary-container/60", "bg-primary-fixed-dim"];

export function FasTierCard() {
  const q = useDashQuery(fasByTier);
  return (
    <DashCard title="FAS by Tier" icon={ChartBar} to="/admin/fas">
      <Loadable
        query={q}
        what="FAS by tier"
        skeleton={
          <div className="mt-4 grid flex-1 grid-cols-4 items-end gap-4">
            {["h-36", "h-24", "h-12", "h-6"].map((h) => (
              <Skeleton key={h} className={`w-full ${h}`} />
            ))}
          </div>
        }
      >
        {(tiers) => {
          const total = tiers.reduce((s, t) => s + t.count, 0);
          const max = Math.max(...tiers.map((t) => t.count), 1);
          return (
            <>
              <ul className="mt-4 grid flex-1 grid-cols-4 items-end gap-4 pt-2">
                {tiers.map((t, i) => (
                  <li key={t.tier} className="flex h-full flex-col items-center justify-end gap-2 text-center">
                    <span className="text-[15px] font-bold">{nf.format(t.count)}</span>
                    <span
                      aria-hidden="true"
                      className={`block w-full rounded-t-card rounded-b-control ${fills[i % fills.length]}`}
                      style={{ height: `${Math.max(2, (t.count / max) * 140)}px` }}
                    />
                    <span className="text-xs font-semibold text-on-surface-variant">
                      {t.tier}
                      <span className="mt-0.5 block text-[11px] font-medium">
                        {total ? ((t.count / total) * 100).toFixed(1) : "0.0"}%
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
              <CardFoot>MOEFAS + SBFAS recipients - {nf.format(total)} total</CardFoot>
            </>
          );
        }}
      </Loadable>
    </DashCard>
  );
}
