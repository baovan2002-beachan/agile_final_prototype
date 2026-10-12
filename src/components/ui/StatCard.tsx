import type { ReactNode } from "react";

/** Circle-style stat from the dashboard target: outlined icon circle, big value, slate label. */
export function StatCard({ label, value, icon }: { label: string; value: ReactNode; icon: ReactNode }) {
  return (
    <div className="flex items-center gap-4 px-3.5 py-3">
      <div className="grid size-15 shrink-0 place-items-center rounded-full border-[1.5px] border-primary-fixed bg-surface-container-lowest text-primary" aria-hidden="true">
        {icon}
      </div>
      <div>
        <div className="text-[27px] font-bold leading-tight tracking-tight">{value}</div>
        <div className="mt-0.5 text-[13px] font-medium text-on-surface-variant">{label}</div>
      </div>
    </div>
  );
}
