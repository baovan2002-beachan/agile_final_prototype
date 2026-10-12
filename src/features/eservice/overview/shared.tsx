import { Link } from "react-router";

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
/** ISO yyyy-mm-dd -> "31 Oct 2026". */
export const fmtDate = (iso: string) => dateFmt.format(new Date(`${iso}T00:00:00`));

/** Link styled like Button (primary, sm). Button itself renders a <button>, so a navigation target needs its own element. */
export function PayLink({ label }: { label: string }) {
  return (
    <Link
      to="/parent/payments"
      aria-label={label}
      className="inline-flex min-h-9 min-w-11 items-center justify-center rounded-control border border-primary bg-primary px-3 text-[13px] font-semibold text-on-primary transition-colors hover:border-primary-container hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary pointer-coarse:min-h-11"
    >
      Pay now
    </Link>
  );
}

export const linkClass =
  "inline-flex min-h-9 items-center rounded-control text-[13px] font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary pointer-coarse:min-h-11";
