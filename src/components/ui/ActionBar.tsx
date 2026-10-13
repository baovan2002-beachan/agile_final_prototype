import type { ReactNode } from "react";
import { Button } from "./Button";

/** Row actions for a DataTable with `selection`. Drop it inside the filter row; buttons stay disabled until the right number of rows is ticked. */
export function ActionBar({ count, total, onToggleAll, children }: { count: number; total: number; onToggleAll: () => void; children: ReactNode }) {
  return (
    <div role="toolbar" aria-label="Actions for the selected rows" className="flex flex-wrap items-end gap-2 lg:ml-auto">
      <Button variant="secondary" disabled={total === 0} onClick={onToggleAll} aria-pressed={total > 0 && count === total}>
        {count > 0 && count === total ? `Clear (${count})` : "Select all"}
      </Button>
      {children}
    </div>
  );
}
