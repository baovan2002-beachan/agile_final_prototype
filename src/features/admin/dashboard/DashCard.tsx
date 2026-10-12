import { useId, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router";
import { ArrowUpRight, type Icon } from "@phosphor-icons/react";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { EmptyState } from "../../../components/ui/EmptyState";
import { useMockQuery } from "../../../lib/useMockQuery";

type Query<T> = ReturnType<typeof useMockQuery<T>>;

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

/** useMockQuery for dashboard cards. DEV only: `?fail=1` makes every card end in the error state. */
export function useDashQuery<T>(data: T): Query<T> {
  const [params] = useSearchParams();
  return useMockQuery(data, { fail: import.meta.env.DEV && params.get("fail") === "1" });
}

/** Grey placeholder block; pulses only when motion is allowed. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`rounded-control bg-track motion-safe:animate-pulse ${className}`} />;
}

/** "Assumption" badge for invented behaviour; the note is in the tooltip and read by screen readers. */
export function AssumptionTag({ note }: { note: string }) {
  return (
    <span title={note} className="shrink-0">
      <Badge tone="neutral">Assumption</Badge>
      <span className="sr-only">: {note}</span>
    </span>
  );
}

type CardProps = { title: string; icon: Icon; to?: string; tag?: ReactNode; children: ReactNode; className?: string };

/** Dashboard card: flat white panel, icon tile + h2 title, optional tag and "open" link at top right. */
export function DashCard({ title, icon: Icon, to, tag, children, className = "" }: CardProps) {
  const id = useId();
  return (
    <section
      aria-labelledby={id}
      className={`flex min-w-0 flex-col rounded-card border border-line bg-surface-container-lowest px-6 py-5 ${className}`}
    >
      <div className="flex min-h-10 items-center justify-between gap-3">
        <h2 id={id} className="flex items-center gap-2.5 text-[15px] font-semibold text-on-surface">
          <span className="grid size-[30px] place-items-center rounded-control border border-primary-fixed text-primary" aria-hidden="true">
            <Icon size={17} />
          </span>
          {title}
        </h2>
        {tag && <span className="ml-auto">{tag}</span>}
        {to && (
          <Link
            to={to}
            aria-label={`Open ${title}`}
            className={`grid size-10 shrink-0 place-items-center rounded-full border border-line text-primary motion-safe:transition-colors duration-150 hover:bg-primary-fixed pointer-coarse:size-11 ${focus}`}
          >
            <ArrowUpRight size={16} weight="bold" aria-hidden="true" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

/** Renders the skeleton while loading, an EmptyState with Retry on error, else the content. */
export function Loadable<T>({
  query,
  what,
  skeleton,
  children,
}: {
  query: Query<T>;
  what: string;
  skeleton: ReactNode;
  children: (data: T) => ReactNode;
}) {
  if (query.status === "loading")
    return (
      <div aria-busy="true" className="flex flex-1 flex-col">
        <span className="sr-only">Loading {what}</span>
        {skeleton}
      </div>
    );
  if (query.status === "error" || query.data === undefined)
    return (
      <div role="status" className="flex flex-1 flex-col justify-center">
        <EmptyState
          title={`Could not load ${what}`}
          hint="The mock service did not respond. Try again."
          action={
            <Button size="sm" variant="secondary" onClick={query.retry}>
              Retry
            </Button>
          }
        />
      </div>
    );
  return <>{children(query.data)}</>;
}

/** Small muted footer line pinned to the bottom of a card. */
export function CardFoot({ children }: { children: ReactNode }) {
  return <div className="mt-auto pt-3 text-xs font-medium text-on-surface-variant">{children}</div>;
}
