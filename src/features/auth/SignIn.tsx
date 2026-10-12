import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Check, CheckCircle, CircleNotch, EnvelopeSimple, HandHeart, ShieldCheck, Wallet, WarningCircle, type Icon } from "@phosphor-icons/react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Field, inputClass } from "../../components/ui/Field";
import { Modal } from "../../components/ui/Modal";
import { findStaff, STAFF } from "../../data/users";
import { useSession } from "../../session";

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

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export default function SignIn() {
  const [tab, setTab] = useState<TabId>("parent");
  const refs = useRef<Record<TabId, HTMLButtonElement | null>>({ parent: null, staff: null });

  // Automatic activation: arrow keys move focus and select, Home/End jump to the ends.
  const onKeyDown = (e: KeyboardEvent) => {
    const i = TABS.findIndex((t) => t.id === tab);
    const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: TABS.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    const id = TABS[(next + TABS.length) % TABS.length].id;
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
        <div role="tablist" aria-label="Account type" onKeyDown={onKeyDown} className="mt-4 grid grid-cols-2 rounded-control border border-line p-1">
          {TABS.map((t) => (
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
              className={`min-h-11 rounded-control px-2 text-sm font-semibold transition-colors ${focus} ${
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

// ---------- Parent: simulated SingPass ----------

type Step = "qr" | "verifying" | "done";
// ASSUMPTION: step timings are only there to show the three states of the SingPass hand-off.
const DELAY: Record<Step, number> = { qr: 2000, verifying: 1500, done: 1000 };

function ParentPanel() {
  const { signIn } = useSession();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("qr");

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      if (step === "qr") setStep("verifying");
      else if (step === "verifying") setStep("done");
      else signIn("parent"); // /signin redirects a signed-in visitor to /parent
    }, DELAY[step]);
    return () => clearTimeout(t);
  }, [open, step, signIn]);

  const close = () => {
    setOpen(false);
    setStep("qr");
  };

  return (
    <>
      <h3 className="text-[15px] font-semibold text-on-surface">Parent or guardian</h3>
      <p className="mt-1 text-sm text-on-surface-variant">Sign in securely with your SingPass to view accounts, pay fees and apply for FAS.</p>
      <Button className="mt-5 w-full" onClick={() => setOpen(true)}>
        Log in with SingPass
      </Button>
      <Modal
        open={open}
        onClose={close}
        title="Continue with SingPass"
        footer={step !== "done" && <Button variant="secondary" onClick={close}>Cancel</Button>}
      >
        <div role="status" className="flex flex-col items-center text-center">
          {step === "qr" && (
            <>
              <MockQr />
              <p className="mt-3 text-on-surface">Scan with the SingPass app to continue.</p>
              <span className="mt-2"><Badge tone="warning">Assumption: mock QR</Badge></span>
            </>
          )}
          {step === "verifying" && (
            <>
              <CircleNotch size={40} className="text-primary motion-safe:animate-spin" aria-hidden="true" />
              <p className="mt-3 font-semibold text-on-surface">Verifying</p>
              <p>Checking your identity with SingPass.</p>
            </>
          )}
          {step === "done" && (
            <>
              <CheckCircle size={40} weight="fill" className="text-success" aria-hidden="true" />
              <p className="mt-3 font-semibold text-on-surface">Authenticated</p>
              <p>Taking you to your overview.</p>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}

/** Decorative stand-in for a QR code: three finder squares plus fixed pseudo-random cells. */
function MockQr() {
  const N = 21;
  const cells: [number, number][] = [];
  let seed = 7;
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const finder = (x < 8 && y < 8) || (x >= N - 8 && y < 8) || (x < 8 && y >= N - 8);
      seed = (seed * 1103515245 + 12345) % 2147483648;
      if (!finder && seed % 100 < 48) cells.push([x, y]);
    }
  const finderAt = (x: number, y: number) => (
    <g key={`${x}${y}`}>
      <rect x={x} y={y} width="7" height="7" />
      <rect x={x + 1} y={y + 1} width="5" height="5" className="fill-surface-container-lowest" />
      <rect x={x + 2} y={y + 2} width="3" height="3" />
    </g>
  );
  return (
    <svg viewBox={`-1 -1 ${N + 2} ${N + 2}`} role="img" aria-label="Mock QR code" className="size-44 rounded-control border border-line bg-surface-container-lowest fill-on-surface">
      {cells.map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />)}
      {finderAt(0, 0)}
      {finderAt(N - 7, 0)}
      {finderAt(0, N - 7)}
    </svg>
  );
}

// ---------- Staff: email + password ----------

function StaffPanel() {
  const { signIn } = useSession();
  const [error, setError] = useState("");
  const [forgot, setForgot] = useState(false);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const account = findStaff(String(f.get("email")), String(f.get("password")));
    if (account) signIn(account.role); // /signin redirects a signed-in visitor to their home
    else setError("Email or password is incorrect. Check the details and try again.");
  };

  return (
    <>
      <h3 className="text-[15px] font-semibold text-on-surface">Staff sign in</h3>
      <form onSubmit={submit} className="mt-4 space-y-4">
        {error && (
          <p role="alert" className="flex items-start gap-2 rounded-control border border-alert bg-error-container p-3 text-sm font-medium text-on-error-container">
            <WarningCircle size={18} weight="fill" className="mt-0.5 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}
        <Field label="Email address">
          <input name="email" type="email" required autoComplete="username" onChange={() => setError("")} className={inputClass} />
        </Field>
        <Field label="Password">
          <input name="password" type="password" required autoComplete="current-password" onChange={() => setError("")} className={inputClass} />
        </Field>
        <button type="button" onClick={() => setForgot(true)} className={`-my-2 min-h-11 text-sm font-semibold text-primary underline ${focus}`}>
          Forgot password?
        </button>
        <Button type="submit" className="w-full">Sign in</Button>
      </form>
      <div className="mt-5 border-t border-line pt-4 text-[13px] text-on-surface-variant">
        <p className="font-semibold text-on-surface">Demo accounts</p>
        <ul className="mt-1 space-y-1">
          {STAFF.map((s) => (
            <li key={s.email}>
              {s.name} ({s.title}): {s.email} / {s.password}
            </li>
          ))}
        </ul>
      </div>
      <ForgotModal open={forgot} onClose={() => setForgot(false)} />
    </>
  );
}

function ForgotModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [sent, setSent] = useState(false);
  // The focused field is replaced by the success message on send; move focus to the way out.
  useEffect(() => {
    if (sent) document.getElementById("forgot-back")?.focus();
  }, [sent]);
  const close = () => {
    onClose();
    setSent(false);
  };
  return (
    <Modal
      open={open}
      onClose={close}
      title="Reset staff password"
      footer={
        sent ? (
          <Button id="forgot-back" onClick={close}>Back to sign in</Button>
        ) : (
          <>
            <Button variant="secondary" onClick={close}>Cancel</Button>
            <Button type="submit" form="forgot-form" icon={<EnvelopeSimple size={18} aria-hidden="true" />}>Send reset link</Button>
          </>
        )
      }
    >
      {sent ? (
        // ASSUMPTION: mock flow; wording avoids confirming whether the address belongs to an account.
        <div role="status" className="space-y-2 text-on-surface">
          <p className="flex items-start gap-2">
            <CheckCircle size={20} weight="fill" className="shrink-0 text-success" aria-hidden="true" />
            If this email exists, a reset link is sent.
          </p>
          <Badge tone="warning">Assumption: mock, no email is sent</Badge>
        </div>
      ) : (
        <form id="forgot-form" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
          <Field label="Institutional email" hint="We will email you a link to set a new password.">
            <input type="email" required autoComplete="email" className={inputClass} />
          </Field>
        </form>
      )}
    </Modal>
  );
}
