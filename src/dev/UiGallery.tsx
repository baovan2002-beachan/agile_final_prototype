import { useState } from "react";
import { Buildings, CreditCard, GraduationCap, Hourglass, Plus, Users } from "@phosphor-icons/react";
import { Badge, type BadgeTone } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { Field, inputClass } from "../components/ui/Field";
import { Modal } from "../components/ui/Modal";
import { StatCard } from "../components/ui/StatCard";

const tones: BadgeTone[] = ["success", "warning", "alert", "neutral", "primary"];

export default function UiGallery() {
  const [open, setOpen] = useState(false);
  return (
    <main className="mx-auto max-w-5xl space-y-5 p-6">
      <h1 className="text-3xl font-bold tracking-tight">UI primitives</h1>

      <Card title="Buttons" action={<Badge tone="neutral">Dev only</Badge>}>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button icon={<Plus size={18} weight="bold" aria-hidden="true" />}>With icon</Button>
          <Button size="sm">Small</Button>
          <Button variant="secondary" size="sm">Small secondary</Button>
          <Button disabled>Disabled</Button>
        </div>
      </Card>

      <Card title="Badges">
        <div className="flex flex-wrap gap-3">
          {tones.map((t) => <Badge key={t} tone={t}>{t[0].toUpperCase() + t.slice(1)}</Badge>)}
        </div>
      </Card>

      <Card className="py-2">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Student" value="12,480" icon={<Users size={26} />} />
          <StatCard label="Active Account" value="9,312" icon={<CreditCard size={26} />} />
          <StatCard label="Total School" value="184" icon={<Buildings size={26} />} />
          <StatCard label="Pending FAS" value="37" icon={<Hourglass size={26} />} />
        </div>
      </Card>

      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <Card.Header>
            <h3 className="text-[15px] font-semibold">Card.Header / Card.Body</h3>
            <Badge tone="primary">Composed</Badge>
          </Card.Header>
          <Card.Body className="text-sm text-on-surface-variant">Flat card, 1px line border, no shadow.</Card.Body>
        </Card>
        <Card title="Empty state">
          <EmptyState
            title="No FAS applications yet"
            hint="Applications captured by schools will appear here."
            action={<Button size="sm" icon={<GraduationCap size={16} aria-hidden="true" />}>New application</Button>}
          />
        </Card>
      </div>

      <Card title="Fields">
        <div className="grid gap-5 md:grid-cols-3">
          <Field label="School name" hint="As registered with MOE."><input className={inputClass} placeholder="Example Primary School" /></Field>
          <Field label="Top-up amount" error="Enter an amount between $1 and $500."><input className={inputClass} defaultValue="0" /></Field>
          <Field label="Level">
            <select className={inputClass} defaultValue="P1"><option>P1</option><option>P2</option></select>
          </Field>
        </div>
      </Card>

      <Card title="Modal">
        <Button variant="secondary" onClick={() => setOpen(true)}>Open modal</Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Confirm top-up"
          footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => setOpen(false)}>Confirm</Button></>}
        >
          <Field label="Reason"><input className={inputClass} /></Field>
        </Modal>
      </Card>
    </main>
  );
}
