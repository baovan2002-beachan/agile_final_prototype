import { Plus } from "@phosphor-icons/react";
import { topUps } from "../../../data/dashboard";
import { formatSGD } from "../../../lib/format";
import { useSession } from "../../../session";
import { DashCard, Loadable, Skeleton, useDashQuery } from "./DashCard";

const money = (n: number) => formatSGD(n, { compact: true });

export function TopUpCard() {
  const { role } = useSession();
  const q = useDashQuery(topUps);
  return (
    // Top-Up Management is HQ-only.
    <DashCard title="Total Top-Up" icon={Plus} to={role === "hq" ? "/admin/top-up" : undefined}>
      <Loadable
        query={q}
        what="top-up totals"
        skeleton={
          <div className="mt-3 flex flex-1 flex-col gap-5">
            <Skeleton className="h-8 w-36" />
            {topUps.months.map((m) => (
              <Skeleton key={m.month} className="h-4 w-full" />
            ))}
          </div>
        }
      >
        {(d) => {
          const max = Math.max(...d.months.map((m) => m.amount), 1);
          const total = d.months.reduce((s, m) => s + m.amount, 0);
          return (
            <>
              <p className="mt-3 text-[30px] font-bold leading-tight tracking-tight">{money(total)}</p>
              <p className="text-xs font-medium text-on-surface-variant">{d.period}</p>
              <ul className="mt-2.5 flex flex-1 flex-col justify-evenly gap-3" aria-label="Top-up by month">
                {d.months.map((m) => (
                  <li key={m.month} className="grid grid-cols-[2.5rem_1fr_4.25rem] items-center gap-2.5 text-[13px] font-semibold">
                    <abbr title={m.name} className="no-underline">
                      {m.month}
                    </abbr>
                    <span className="h-4 overflow-hidden rounded-full bg-track" aria-hidden="true">
                      <span
                        className={`block h-full rounded-full ${m.amount === max ? "bg-primary" : "bg-primary-container/60"}`}
                        style={{ width: `${(m.amount / max) * 100}%` }}
                      />
                    </span>
                    <span className="text-right font-bold tabular-nums">{money(m.amount)}</span>
                  </li>
                ))}
              </ul>
            </>
          );
        }}
      </Loadable>
    </DashCard>
  );
}
