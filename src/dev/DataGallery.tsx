import { DataTable, type Column } from "../components/ui/DataTable";
import { RingChart } from "../components/ui/RingChart";
import { BarChart } from "../components/ui/BarChart";
import { ProgressBar } from "../components/ui/ProgressBar";

type Row = { id: string; name: string; school: string; balance: number };
const schools = ["Bukit View Primary", "Greenridge Secondary", "Tampines North Primary", "Jurong Crest Secondary"];
const rows: Row[] = Array.from({ length: 25 }, (_, i) => ({
  id: `S${1000 + i}`,
  name: `Student ${String.fromCharCode(65 + ((i * 7) % 26))}${i + 1}`,
  school: schools[i % 4],
  balance: 120 + ((i * 373) % 900),
}));
const columns: Column<Row>[] = [
  { key: "id", header: "ID", sortable: true },
  { key: "name", header: "Name", sortable: true },
  { key: "school", header: "School", sortable: true },
  { key: "balance", header: "Balance", sortable: true, align: "right", render: (r) => `S$${r.balance.toFixed(2)}` },
];
const card = "rounded-2xl border border-line bg-surface-container-lowest p-5";

export default function DataGallery() {
  return (
    <main className="mx-auto max-w-5xl space-y-6 p-8">
      <h1 className="text-2xl font-semibold">Data components</h1>
      <section className={card}>
        <h2 className="mb-3 font-semibold">DataTable - 0 rows</h2>
        <DataTable
          columns={columns}
          rows={[]}
          rowKey={(r) => r.id}
          empty={<p className="py-8 text-center text-on-surface-variant">No students found.</p>}
        />
      </section>
      <section className={card}>
        <h2 className="mb-3 font-semibold">DataTable - 25 rows, page size 10</h2>
        <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} empty={null} />
      </section>
      <section className={`${card} grid gap-6 sm:grid-cols-2`}>
        <div className="space-y-5">
          <h2 className="font-semibold">ProgressBar</h2>
          <ProgressBar pct={80} label="Budget used" />
          <ProgressBar pct={118} tone="alert" label="Budget used (over)" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <h2 className="self-start font-semibold">RingChart</h2>
          <RingChart value={312} max={400} label="FAS received" />
        </div>
      </section>
      <section className={card}>
        <h2 className="mb-3 font-semibold">BarChart</h2>
        <BarChart
          data={[
            { label: "Jan", value: 2.4 },
            { label: "Feb", value: 3.1 },
            { label: "Mar", value: 1.8 },
            { label: "Apr", value: 2.9 },
          ]}
          format={(n) => `S$${n.toFixed(1)}M`}
        />
      </section>
    </main>
  );
}
