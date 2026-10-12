export function ProgressBar({ pct, tone, label }: { pct: number; tone?: "primary" | "alert"; label: string }) {
  const real = Number.isFinite(pct) ? pct : 0;
  const fill = Math.min(100, Math.max(0, real)); // bar never overflows; the text shows the true pct
  const t = tone ?? (real > 100 ? "alert" : "primary");
  const shown = Math.round(real);
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm text-on-surface-variant">
        <span>{label}</span>
        <span className="font-medium text-on-surface">
          {shown}%{real > 100 && " - over budget"}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(fill)}
        aria-valuetext={`${shown}%${real > 100 ? " - over budget" : ""}`}
        className="h-2 overflow-hidden rounded-full bg-track"
      >
        <div className={`h-full rounded-full ${t === "alert" ? "bg-alert" : "bg-primary"}`} style={{ width: `${fill}%` }} />
      </div>
    </div>
  );
}
