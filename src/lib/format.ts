const full = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatSGD(n: number, opts?: { compact?: boolean }): string {
  if (opts?.compact) {
    const a = Math.abs(n);
    if (a >= 1e6) return `S$${(n / 1e6).toFixed(2)}M`;
    if (a >= 1e3) return `S$${+(n / 1e3).toFixed(1)}K`; // unary + trims trailing zeros
    return `S$${+n.toFixed(2)}`;
  }
  return `S$${full.format(n)}`;
}
