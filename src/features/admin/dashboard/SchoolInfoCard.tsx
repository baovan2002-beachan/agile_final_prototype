import { Buildings, MapPin, Phone, Users } from "@phosphor-icons/react";
import { school } from "../../../data/dashboard";
import { useSession } from "../../../session";
import { DashCard, Loadable, Skeleton, useDashQuery } from "./DashCard";

const nf = new Intl.NumberFormat("en-US");

export function SchoolInfoCard() {
  const { role } = useSession();
  const q = useDashQuery(school);
  return (
    // The school registry is an HQ-only route, so School users get no link.
    <DashCard title="School Info" icon={Buildings} to={role === "hq" ? "/admin/schools" : undefined}>
      <Loadable
        query={q}
        what="school info"
        skeleton={
          <div className="mt-3.5 space-y-3">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-16 w-full" />
          </div>
        }
      >
        {(s) => (
          <>
            <div
              aria-hidden="true"
              className="my-3.5 grid h-28 place-items-center rounded-card border border-line bg-surface-container-low text-primary"
            >
              <Buildings size={72} weight="regular" />
            </div>
            <p className="text-[15.5px] font-bold leading-tight tracking-tight">{s.name}</p>
            <p className="mt-2">
              <span className="inline-block rounded-md bg-primary px-2.5 py-0.5 text-[11px] font-bold text-on-primary">
                {role === "hq" ? "Selected school" : "Your school"}
              </span>
            </p>
            <ul className="mt-3.5 space-y-2 text-[13px] font-medium text-on-surface">
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="mt-px shrink-0 text-primary" aria-hidden="true" />
                <span className="sr-only">Address: </span>
                {s.address}
              </li>
              <li className="flex items-start gap-2.5">
                <Phone size={16} className="mt-px shrink-0 text-primary" aria-hidden="true" />
                <span className="sr-only">Phone: </span>
                {s.phone}
              </li>
              <li className="flex items-start gap-2.5">
                <Users size={16} className="mt-px shrink-0 text-primary" aria-hidden="true" />
                {nf.format(s.students)} students - {s.classes} classes
              </li>
            </ul>
          </>
        )}
      </Loadable>
    </DashCard>
  );
}
