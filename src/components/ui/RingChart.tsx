/** `digits` = decimals shown in the percentage (default 0). `caption` = small line under the percentage. */
export function RingChart({
  value,
  max,
  label,
  digits = 0,
  caption,
}: {
  value: number;
  max: number;
  label: string;
  digits?: number;
  caption?: string;
}) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const v = Number.isFinite(value) ? value : 0;
  const m = Number.isFinite(max) ? max : 0;
  const frac = m > 0 ? Math.min(1, Math.max(0, v / m)) : 0;
  const pct = +(frac * 100).toFixed(digits);
  return (
    <svg viewBox="0 0 100 100" role="img" aria-label={`${label}: ${v} of ${m} (${pct}%)`} className="size-40">
      <circle cx="50" cy="50" r={r} fill="none" strokeWidth="10" className="stroke-track" />
      {frac > 0 && (
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          className="stroke-primary"
          strokeDasharray={`${frac * c} ${c}`}
          transform="rotate(-90 50 50)"
        />
      )}
      <text x="50" y={caption ? 46 : 50} textAnchor="middle" dominantBaseline="central" className="fill-on-surface text-[18px] font-semibold">
        {pct}%
      </text>
      {caption && (
        <text x="50" y="61" textAnchor="middle" dominantBaseline="central" className="fill-on-surface-variant text-[7px] font-medium">
          {caption}
        </text>
      )}
    </svg>
  );
}
