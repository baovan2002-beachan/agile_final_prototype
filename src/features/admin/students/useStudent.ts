import { useLocation, useParams } from "react-router";
import { STUDENTS, type Student } from "../../../data/students";

/** Student for /admin/students/:id/...; newly assigned students are not in STUDENTS, so the list passes them via router state. */
export function useStudent(): Student | undefined {
  const { id } = useParams();
  const { state } = useLocation() as { state: { student?: Student } | null };
  return state?.student?.id === id ? state?.student : STUDENTS.find((s) => s.id === id);
}
