import { AssumptionTag } from "../../components/ui/AssumptionTag";
import { useSession } from "../../session";

/** One line shown to HQ on screens that currently expose School actions. */
export default function HqPermissionNote() {
  const { role } = useSession();
  if (role !== "hq") return null;
  return (
    <p>
      <AssumptionTag>HQ vs School permissions are an open question: HQ currently sees School actions</AssumptionTag>
    </p>
  );
}
