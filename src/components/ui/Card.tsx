import type { ReactNode } from "react";

type Props = { title?: string; action?: ReactNode; children?: ReactNode; className?: string };

function Header({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`flex items-center justify-between gap-3 ${className}`}>{children}</div>;
}

function Body({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mt-4 ${className}`}>{children}</div>;
}

/** Flat card: white, 1px line border, no shadow. Pass `title`/`action` for a quick header, or compose Card.Header / Card.Body. */
export function Card({ title, action, children, className = "" }: Props) {
  const hasHeader = Boolean(title || action);
  return (
    <section className={`rounded-card border border-line bg-surface-container-lowest px-6 py-5 ${className}`}>
      {hasHeader && (
        <Header>
          {title && <h3 className="text-[15px] font-semibold text-on-surface">{title}</h3>}
          {action}
        </Header>
      )}
      {hasHeader ? <Body>{children}</Body> : children}
    </section>
  );
}

Card.Header = Header;
Card.Body = Body;
