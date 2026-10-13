import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Eye, UsersThree } from "@phosphor-icons/react";
import { AssumptionTag } from "../../../components/ui/AssumptionTag";
import { ActionBar } from "../../../components/ui/ActionBar";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { DataTable, type Column } from "../../../components/ui/DataTable";
import { EmptyState } from "../../../components/ui/EmptyState";
import { Field, inputClass } from "../../../components/ui/Field";
import { SCHOOLS, type School } from "../../../data/schools";
import { useSession } from "../../../session";
import { filterSchools } from "./logic";

export default function SchoolRegistry() {
  const { startSimulation } = useSession();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<string[]>([]);
  // Memoised: DataTable resets to page 1 whenever the rows reference changes.
  const rows = useMemo(() => filterSchools(SCHOOLS, q), [q]);

  const simulate = (as: "school" | "parent", name?: string) => {
    startSimulation(as, name);
    navigate(as === "school" ? "/admin" : "/parent");
  };

  const columns: Column<School>[] = [
    { key: "code", header: "ID", sortable: true },
    { key: "name", header: "School", sortable: true, render: (s) => <span className="font-medium">{s.name}</span> },
    { key: "level", header: "Level", sortable: true },
    { key: "students", header: "Students", sortable: true, align: "right", render: (s) => s.students.toLocaleString("en-SG") },
  ];
  const picked = sel.length === 1 ? rows.find((s) => s.code === sel[0]) : undefined;
  const toggleAll = () => setSel(sel.length === rows.length ? [] : rows.map((s) => s.code));

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-on-surface-variant">
          View the system exactly as a School user or a Parent sees it. Simulation is read-only: nothing you do is saved.
        </p>
        <div className="flex items-center gap-3">
          <AssumptionTag>open question</AssumptionTag>
          <Button icon={<UsersThree size={18} aria-hidden />} onClick={() => simulate("parent")}>
            Simulate as Parent
          </Button>
        </div>
      </div>

      <Card title="School registry">
        <div className="flex flex-wrap items-end gap-4">
          <Field label="Search schools" className="w-full max-w-sm">
            <input
              type="search"
              className={inputClass}
              placeholder="School name or code"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </Field>
          <ActionBar count={sel.length} total={rows.length} onToggleAll={toggleAll}>
            <Button variant="secondary" disabled={!picked} icon={<Eye size={18} aria-hidden />} onClick={() => simulate("school", picked!.name)}>Simulate as School</Button>
          </ActionBar>
        </div>
        <div className="mt-4">
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(s) => s.code}
            selection={{ selected: sel, onChange: setSel, label: (s) => `Select ${s.name}` }}
            empty={
              <EmptyState
                title="No schools match this search"
                hint="Check the spelling or search by school ID instead."
                action={<Button variant="secondary" onClick={() => setQ("")}>Clear search</Button>}
              />
            }
          />
        </div>
      </Card>
    </div>
  );
}
