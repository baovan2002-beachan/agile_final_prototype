import { Children, cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from "react";

type Props = { label: string; error?: string; hint?: string; children: ReactNode };

/** Shared class for text inputs / selects placed inside <Field>. */
export const inputClass =
  "min-h-11 w-full rounded-xl border border-outline bg-surface-container-lowest px-3 text-sm text-on-surface placeholder:text-on-surface-variant focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary aria-[invalid=true]:border-alert";

/** Label above, hint/error below. The single child control gets id, aria-describedby and aria-invalid injected. */
export function Field({ label, error, hint, children }: Props) {
  const id = useId();
  const descId = `${id}-d`;
  const child = Children.only(children);
  const control = isValidElement(child)
    ? cloneElement(child as ReactElement<Record<string, unknown>>, {
        id,
        "aria-describedby": error || hint ? descId : undefined,
        "aria-invalid": error ? true : undefined,
      })
    : child;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold text-on-surface">{label}</label>
      {control}
      {error ? (
        <p id={descId} role="alert" className="mt-1.5 text-[13px] font-medium text-alert">{error}</p>
      ) : hint ? (
        <p id={descId} className="mt-1.5 text-[13px] text-on-surface-variant">{hint}</p>
      ) : null}
    </div>
  );
}
