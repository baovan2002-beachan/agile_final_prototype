import { useMemo, useState, type ReactNode } from "react";
import { CaretDown, CaretLeft, CaretRight, CaretUp } from "@phosphor-icons/react";

export type Column<T> = {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  render?: (row: T) => ReactNode;
  align?: "right";
};

type Props<T> = {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  empty: ReactNode;
  pageSize?: number;
};

const val = <T,>(row: T, key: string) => (row as Record<string, unknown>)[key];

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export function DataTable<T>({ columns, rows, rowKey, empty, pageSize = 10 }: Props<T>) {
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const m = sort.dir === "asc" ? 1 : -1;
    // Array.prototype.sort is stable (ES2019), so ties keep input order
    return [...rows].sort((a, b) => {
      const x = val(a, sort.key),
        y = val(b, sort.key);
      if (typeof x === "number" && typeof y === "number") return (x - y) * m;
      return String(x ?? "").localeCompare(String(y ?? ""), undefined, { numeric: true }) * m;
    });
  }, [rows, sort]);

  if (rows.length === 0) return <>{empty}</>;

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const cur = Math.min(page, pages - 1);
  const visible = sorted.slice(cur * pageSize, (cur + 1) * pageSize);

  const toggle = (key: string) => {
    setSort((s) => (s?.key === key && s.dir === "asc" ? { key, dir: "desc" } : { key, dir: "asc" }));
    setPage(0);
  };
  const pageBtn = `inline-flex size-9 items-center justify-center rounded-full border border-line text-on-surface hover:bg-surface-container-low disabled:opacity-40 disabled:hover:bg-transparent ${focus}`;

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line">
              {columns.map((c) => {
                const k = String(c.key);
                const active = sort?.key === k;
                return (
                  <th
                    key={k}
                    scope="col"
                    aria-sort={c.sortable ? (active ? (sort!.dir === "asc" ? "ascending" : "descending") : "none") : undefined}
                    className={`whitespace-nowrap px-3 py-2.5 font-medium text-on-surface-variant ${c.align === "right" ? "text-right" : ""}`}
                  >
                    {c.sortable ? (
                      <button
                        type="button"
                        onClick={() => toggle(k)}
                        className={`inline-flex items-center gap-1 rounded font-medium hover:text-primary ${focus}`}
                      >
                        {c.header}
                        {active ? (
                          sort!.dir === "asc" ? (
                            <CaretUp size={14} weight="bold" aria-hidden />
                          ) : (
                            <CaretDown size={14} weight="bold" aria-hidden />
                          )
                        ) : null}
                      </button>
                    ) : (
                      c.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={rowKey(row)} className="border-b border-line last:border-0">
                {columns.map((c) => (
                  <td key={String(c.key)} className={`px-3 py-3 text-on-surface ${c.align === "right" ? "text-right tabular-nums" : ""}`}>
                    {c.render ? c.render(row) : String(val(row, String(c.key)) ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <nav aria-label="Pagination" className="mt-3 flex items-center justify-between text-sm text-on-surface-variant">
          <span aria-live="polite">
            Page {cur + 1} of {pages} ({sorted.length} rows)
          </span>
          <div className="flex gap-2">
            <button type="button" className={pageBtn} aria-label="Previous page" disabled={cur === 0} onClick={() => setPage(cur - 1)}>
              <CaretLeft size={16} aria-hidden />
            </button>
            <button type="button" className={pageBtn} aria-label="Next page" disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)}>
              <CaretRight size={16} aria-hidden />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
