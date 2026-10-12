import type { ReactNode } from "react";
import { CheckCircle, Warning, WarningOctagon, MinusCircle, Info } from "@phosphor-icons/react";

export type BadgeTone = "success" | "warning" | "alert" | "neutral" | "primary";

// Each tone has an icon so status is never conveyed by color alone.
const tones: Record<BadgeTone, { cls: string; Icon: typeof Info }> = {
  success: { cls: "bg-success-container text-success", Icon: CheckCircle },
  warning: { cls: "bg-warning-container text-warning", Icon: Warning },
  alert: { cls: "bg-error-container text-alert", Icon: WarningOctagon },
  neutral: { cls: "bg-track text-on-surface-variant", Icon: MinusCircle },
  primary: { cls: "bg-primary-fixed text-primary", Icon: Info },
};

export function Badge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  const { cls, Icon } = tones[tone];
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>
      <Icon size={14} weight="bold" aria-hidden="true" />
      {children}
    </span>
  );
}
