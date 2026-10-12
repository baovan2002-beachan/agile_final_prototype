import type { StepState } from "./logic";
import type { BadgeTone } from "../../../components/ui/Badge";

export const stateTone: Record<StepState, BadgeTone> = { Done: "success", "In progress": "warning", "To do": "neutral", Waiting: "neutral", Failed: "alert" };

/** Mock "today", matches parent.ts. */
export const TODAY = "2026-10-12";
