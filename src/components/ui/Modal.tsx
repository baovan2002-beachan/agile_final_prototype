import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "@phosphor-icons/react";

type Props = { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode };

/** Native <dialog> modal: showModal() gives focus trap + inert background; Esc and backdrop click call onClose. */
export function Modal({ open, onClose, title, children, footer }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      opener.current = document.activeElement as HTMLElement | null;
      d.showModal();
    } else if (!open && d.open) {
      d.close();
      opener.current?.focus();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      // Esc: keep the dialog controlled by `open` instead of letting the browser close it.
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      // Padding lives on the inner div, so a click whose target is the dialog itself is a backdrop click.
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-3xl border border-line bg-surface-container-lowest p-0 text-on-surface backdrop:bg-inverse-surface/40"
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-lg font-bold">{title}</h2>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="grid size-11 shrink-0 place-items-center rounded-full border border-line text-primary hover:bg-primary-fixed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <X size={18} weight="bold" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-4 text-sm text-on-surface-variant">{children}</div>
        {footer && <div className="mt-6 flex flex-wrap justify-end gap-3">{footer}</div>}
      </div>
    </dialog>
  );
}
