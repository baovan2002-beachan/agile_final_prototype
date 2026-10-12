import { ArrowDown, ArrowUp, CreditCard, FileText, GraduationCap, Minus, Buildings } from "@phosphor-icons/react";
import { StatCard } from "../../../components/ui/StatCard";
import { stats, type Stat, type Trend } from "../../../data/dashboard";
import { Loadable, Skeleton, useDashQuery } from "./DashCard";

const icons = { students: GraduationCap, accounts: CreditCard, schools: Buildings, pendingFas: FileText };
const nf = new Intl.NumberFormat("en-US");

function TrendChip({ trend }: { trend: Trend }) {
  const Icon = trend.dir === "up" ? ArrowUp : trend.dir === "down" ? ArrowDown : Minus;
  const word = trend.dir === "up" ? "up" : trend.dir === "down" ? "down" : "no change,";
  const flat = trend.dir === "flat";
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-bold leading-4 tracking-normal ${
        flat ? "bg-track text-on-surface-variant" : "bg-primary text-on-primary"
      }`}
    >
      <Icon size={11} weight="bold" aria-hidden="true" />
      <span className="sr-only">{word} </span>
      {trend.pct}%
    </span>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((s) => (
        <div key={s.key} className="flex items-center gap-4 px-3.5 py-3">
          <Skeleton className="size-15 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-3.5 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatsPanel() {
  const q = useDashQuery<Stat[]>(stats);
  return (
    <section
      aria-labelledby="stats-title"
      className="flex min-h-28 flex-col justify-center rounded-card border border-line bg-surface-container-lowest px-3.5 py-2"
    >
      <h2 id="stats-title" className="sr-only">
        Key figures
      </h2>
      <Loadable query={q} what="key figures" skeleton={<StatsSkeleton />}>
        {(list) => (
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {list.map((s) => {
              const Icon = icons[s.key];
              return (
                <li key={s.key}>
                  <StatCard
                    label={s.label}
                    icon={<Icon size={26} />}
                    value={
                      <span className="flex items-center gap-2.5">
                        {nf.format(s.value)}
                        <TrendChip trend={s.trend} />
                      </span>
                    }
                  />
                </li>
              );
            })}
          </ul>
        )}
      </Loadable>
    </section>
  );
}
