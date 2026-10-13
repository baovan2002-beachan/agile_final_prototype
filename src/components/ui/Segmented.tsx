type Option<T extends string> = { value: T; label: string };
type Props<T extends string> = { label: string; value: T; options: Option<T>[]; onChange: (v: T) => void };

/** Two-to-four way switch (aria-pressed buttons). The selected option is a white chip on a grey track. */
export function Segmented<T extends string>({ label, value, options, onChange }: Props<T>) {
  return (
    <div role="group" aria-label={label} className="inline-flex flex-wrap gap-1 rounded-control bg-surface-container p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={`min-h-9 rounded-control border px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-safe:transition-colors ${
            value === o.value ? "border-line bg-surface-container-lowest text-primary" : "border-transparent text-on-surface-variant hover:text-primary"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
