import { useLocation } from "react-router";
import { Hammer } from "@phosphor-icons/react";
import { navFor } from "../../data/nav";
import { useSession } from "../../session";

export default function PagePlaceholder({ title, note }: { title: string; note?: string }) {
  return (
    <section className="flex flex-col items-center rounded-2xl border border-line bg-surface-container-lowest px-6 py-16 text-center">
      <span className="grid size-14 place-items-center rounded-full border border-line text-primary">
        <Hammer size={24} />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-on-surface">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-on-surface-variant">
        {note ?? "This screen is a placeholder in the base UI and will be built in a later task."}
      </p>
    </section>
  );
}

/** Generic route for nav entries that have no screen in the base UI. */
export function ComingSoon() {
  const { role } = useSession();
  const { pathname } = useLocation();
  const label = (role && navFor(role).find((n) => n.to === pathname)?.label) ?? "This page";
  return <PagePlaceholder title={`${label} - coming soon`} note="Not part of the base UI yet." />;
}
