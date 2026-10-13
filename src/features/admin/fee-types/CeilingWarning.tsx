import { WarningCircle } from "@phosphor-icons/react";
import { AssumptionTag } from "../../../components/ui/AssumptionTag";
import { formatSGD } from "../../../lib/format";
import { per, type FeeType } from "../../../data/fees";

/** Over-ceiling warning (icon + text, never colour alone). The ceiling rule is invented, so it carries the Assumption tag. */
export function CeilingWarning({ fee }: { fee: FeeType }) {
  return (
    <p className="flex flex-wrap items-center gap-2 text-[13px] font-medium text-alert">
      <WarningCircle size={16} weight="bold" aria-hidden="true" />
      Above the national ceiling of {formatSGD(fee.ceiling!.citizen)}{per(fee.cycle)}
      <AssumptionTag />
    </p>
  );
}
