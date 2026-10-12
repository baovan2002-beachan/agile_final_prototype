import { BudgetUsageCard } from "./BudgetUsageCard";
import { FasTierCard } from "./FasTierCard";
import { PaymentHistoryCard } from "./PaymentHistoryCard";
import { ReceivedFasCard } from "./ReceivedFasCard";
import { SchoolInfoCard } from "./SchoolInfoCard";
import { StatsPanel } from "./StatsPanel";
import { TopUpCard } from "./TopUpCard";

/** Admin dashboard (visual target: reference/dashboard_v6_burgundy). DOM order = reading order, row by row. */
export default function Dashboard() {
  return (
    <div className="flex flex-col gap-4">
      <StatsPanel />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-[1fr_1fr_0.7fr] 2xl:grid-rows-[repeat(2,minmax(22.5rem,auto))]">
        <ReceivedFasCard />
        <FasTierCard />
        <SchoolInfoCard />
        <PaymentHistoryCard />
        <BudgetUsageCard />
        <TopUpCard />
      </div>
    </div>
  );
}
