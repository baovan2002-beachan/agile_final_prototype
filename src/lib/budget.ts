export function budgetUsage(used: number, budget: number): { pct: number; over: boolean; barPct: number } {
  const pct = budget > 0 ? Math.round((used / budget) * 100) : 0;
  return { pct, over: pct > 100, barPct: Math.min(100, pct) };
}
