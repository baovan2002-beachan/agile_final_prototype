import type { ReactNode } from "react";
import { Info } from "@phosphor-icons/react";

/**
 * The one "Assumption" marker for invented mock behaviour (icon + text, never colour alone).
 * `children` is shown after the word; `note` is for tight spaces: tooltip + screen-reader text only.
 */
export function AssumptionTag({ children, note }: { children?: ReactNode; note?: string }) {
  return (
    <span
      title={note}
      className={`inline-flex items-start gap-1 bg-track px-2 py-0.5 text-xs font-semibold text-on-surface-variant ${children ? "rounded-control" : "whitespace-nowrap rounded-full"}`}
    >
      <Info size={14} weight="bold" aria-hidden="true" className="mt-px shrink-0" />
      <span>
        Assumption{children ? <>: {children}</> : null}
        {note && <span className="sr-only">: {note}</span>}
      </span>
    </span>
  );
}
