import { HandHeart } from "@phosphor-icons/react";
import { RingChart } from "../../../components/ui/RingChart";
import { receivedFas } from "../../../data/dashboard";
import { CardFoot, DashCard, Loadable, Skeleton, useDashQuery } from "./DashCard";

const nf = new Intl.NumberFormat("en-US");

function LegendChip({ dot, name, value }: { dot: string; name: string; value: number }) {
  return (
    <li className="flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-[13px] font-semibold">
      <span className={`size-2 rounded-full ${dot}`} aria-hidden="true" />
      {name} <b className="font-bold">{nf.format(value)}</b>
    </li>
  );
}

export function ReceivedFasCard() {
  const q = useDashQuery(receivedFas);
  return (
    <DashCard title="Received FAS" icon={HandHeart} to="/admin/fas">
      <Loadable
        query={q}
        what="Received FAS"
        skeleton={
          <div className="mt-4 flex flex-1 items-center justify-between gap-4">
            <div className="flex-1 space-y-3">
              <Skeleton className="h-14 w-60 max-w-full" />
              <Skeleton className="h-4 w-56 max-w-full" />
              <Skeleton className="h-9 w-48 max-w-full" />
            </div>
            <Skeleton className="size-40 shrink-0 rounded-full" />
          </div>
        }
      >
        {(d) => (
          <>
            <div className="mt-4 flex flex-1 flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[56px] font-bold leading-none tracking-[-0.03em]">
                  {nf.format(d.received)}
                  <span className="text-[28px] font-semibold tracking-tight text-on-surface-variant">
                    {" "}/ {nf.format(d.applicants)}
                  </span>
                </p>
                <p className="mt-2.5 text-[13.5px] font-medium text-on-surface-variant">
                  students received FAS this academic year
                </p>
                <ul className="mt-5 flex flex-wrap gap-2.5" aria-label="By scheme">
                  <LegendChip dot="bg-primary" name="MOEFAS" value={d.moefas} />
                  <LegendChip dot="bg-primary-fixed-dim" name="SBFAS" value={d.sbfas} />
                </ul>
              </div>
              <RingChart
                value={d.received}
                max={d.applicants}
                digits={1}
                caption="of applicants"
                label="Applicants who received FAS"
              />
            </div>
            <CardFoot>Updated {d.updated}</CardFoot>
          </>
        )}
      </Loadable>
    </DashCard>
  );
}
