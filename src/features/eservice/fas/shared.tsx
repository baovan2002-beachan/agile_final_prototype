import type { StepState } from "./logic";
import type { BadgeTone } from "../../../components/ui/Badge";

/** Marks rules and behaviour that are invented for the mock. */
export function AssumptionTag() {
  return <span className="inline-flex items-center rounded-full border border-line px-2 py-0.5 text-xs font-semibold text-on-surface-variant">Assumption</span>;
}

export const stateTone: Record<StepState, BadgeTone> = { Done: "success", "In progress": "warning", "To do": "neutral", Waiting: "neutral", Failed: "alert" };

/** Mock "today", matches parent.ts. */
export const TODAY = "2026-10-12";
