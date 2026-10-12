export function ProgressBar({ pct, tone = "primary", label }: { pct: number; tone?: "primary" | "alert"; label: string }) {
  const fill = Math.min(100, Math.max(0, pct)); // bar never overflows; the text shows the true pct
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm text-on-surface-variant">
        <span>{label}</span>
        <span className="font-medium text-on-surface">
          {Math.round(pct)}%{pct > 100 && " - over budget"}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(fill)}
        className="h-2 overflow-hidden rounded-full bg-track"
      >
        <div className={`h-full rounded-full ${tone === "alert" ? "bg-alert" : "bg-primary"}`} style={{ width: `${fill}%` }} />
      </div>
    </div>
  );
}
