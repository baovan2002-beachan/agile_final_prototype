import { useRef, useState, type KeyboardEvent } from "react";
import { Check, HandHeart, ShieldCheck, Wallet, type Icon } from "@phosphor-icons/react";
import { Card } from "../../components/ui/Card";
import ParentPanel from "./ParentPanel";
import StaffPanel from "./StaffPanel";

const FEATURES: { icon: Icon; title: string; text: string }[] = [
  { icon: Wallet, title: "Centralised Education Accounts", text: "One account per child, from age 7 to 16, with balance and transactions in one place." },
  { icon: HandHeart, title: "Financial assistance made simple", text: "Apply for FAS once as a family and follow the decision step by step." },
  { icon: ShieldCheck, title: "Transparent fee records", text: "Every top-up, charge and payment is logged and visible to the people who need it." },
];

const TABS = [
  { id: "parent", label: "Parent or guardian" },
  { id: "staff", label: "School or MOE staff" },
] as const;
type TabId = (typeof TABS)[number]["id"];

// Sprint 1 is admin-only: the parent tab (e-Service Portal, Req 8-10) is hidden until Sprint 2.
const VISIBLE = TABS.filter((t) => t.id === "staff");

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export default function SignIn() {
  const [tab, setTab] = useState<TabId>("staff");
  const refs = useRef<Record<TabId, HTMLButtonElement | null>>({ parent: null, staff: null });

  // Automatic activation: arrow keys move focus and select, Home/End jump to the ends.
  const onKeyDown = (e: KeyboardEvent) => {
    const i = VISIBLE.findIndex((t) => t.id === tab);
    const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: VISIBLE.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    const id = VISIBLE[(next + VISIBLE.length) % VISIBLE.length].id;
    setTab(id);
    refs.current[id]?.focus();
  };

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-6xl content-center items-center gap-10 px-4 py-10 sm:px-8 lg:grid-cols-[1fr_28rem]">
      <section>
        <p className="text-[13px] font-semibold uppercase tracking-wide text-primary">MOE Education Account &amp; FAS</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-on-surface">Smarter student finances, made simple.</h1>
        <p className="mt-3 max-w-lg text-base text-on-surface-variant">
          Transparent grants, easy fee payments and connected accounts for families, schools and the Ministry of Education.
        </p>
        <ul className="mt-8 space-y-5">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary-fixed text-primary">
                <Icon size={22} aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-[15px] font-semibold text-on-surface">{title}</h2>
                <p className="text-sm text-on-surface-variant">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <Card className="w-full">
        <h2 className="text-xl font-bold text-on-surface">Sign in</h2>
        <div role="tablist" aria-label="Account type" onKeyDown={onKeyDown} className={`mt-4 grid rounded-control border border-line p-1 ${VISIBLE.length > 1 ? "grid-cols-2" : "hidden"}`}>
          {VISIBLE.map((t) => (
            <button
              key={t.id}
              ref={(el) => {
                refs.current[t.id] = el;
              }}
              role="tab"
              type="button"
              id={`tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={tab === t.id ? `panel-${t.id}` : undefined}
              tabIndex={tab === t.id ? 0 : -1}
              onClick={() => setTab(t.id)}
              className={`min-h-11 rounded-control px-2 text-sm font-semibold motion-safe:transition-colors ${focus} ${
                tab === t.id ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-primary-fixed hover:text-primary"
              }`}
            >
              {tab === t.id && <Check size={16} weight="bold" aria-hidden="true" className="mr-1.5 inline align-[-2px]" />}
              {t.label}
            </button>
          ))}
        </div>
        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="mt-6">
          {tab === "parent" ? <ParentPanel /> : <StaffPanel />}
        </div>
      </Card>
    </main>
  );
}

