import type { ReactNode } from "react";
import { Tray } from "@phosphor-icons/react";

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div role="status" className="flex flex-col items-center px-4 py-10 text-center">
      <div className="grid size-14 place-items-center rounded-full border-[1.5px] border-primary-fixed text-primary" aria-hidden="true">
        <Tray size={26} />
      </div>
      <h3 className="mt-4 text-[15px] font-semibold">{title}</h3>
      {hint && <p className="mt-1 max-w-sm text-sm text-on-surface-variant">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
