# MOE Base UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the component-based base UI for the MOE Education Account & FAS project (Admin portal + Parent e-Service portal) on mock data.

**Architecture:** Vite SPA. Shared primitives in `src/components/ui`, shell in `src/components/layout`, one folder per screen group in `src/features`, all mock data in `src/data`, pure logic with tests in `src/lib`. Role (HQ / School / Parent) lives in one `SessionContext` and selects nav + routes.

**Tech Stack:** Vite, React 18, TypeScript, Tailwind v4 (`@tailwindcss/vite`), `react-router`, `@phosphor-icons/react`, `@fontsource-variable/inter`, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-12-moe-base-ui-design.md`. Visual target: `reference/dashboard_v6_burgundy.png`. Tokens: `design/palette.md`, `design/tailwind-colors.red.js`. Content/flow reference only: `stitch-export/red/`.

## Global Constraints

- Red + white only; primary burgundy `#8A2538`; alert red `#B52F37` for alerts only; **no gradients**; no shadows; flat cards with 1px `#ECE6E6` border.
- Radii: cards 16px, controls 10px, pills full, sidebar 24px. Spacing on an 8px scale.
- Inter variable, self-hosted. No CDN, no remote images, no Material Symbols. One icon family (Phosphor), one weight.
- Components use tokens (`bg-primary`, `text-on-surface-variant`...), never raw hex.
- Status is never color alone: badge text always present.
- Secondary small text uses `#5E5658`; body contrast >= 4.5:1; visible focus ring on every control.
- Motion: hover/focus transitions 150-200ms only, wrapped for `prefers-reduced-motion`.
- All mock names/amounts/IDs live in `src/data/`; mock-only rules from the handoff's open questions are labelled `// ASSUMPTION:` in code and shown with an "Assumption" tag in UI where behaviour is invented.
- No git repository exists; there are no commit steps.
- Per-screen gate (every task that adds a screen): run dev server, screenshot at 1600x1000 and 768x1024, check no clipping/overflow, check console is clean.

## Review Focus

1. Table with zero rows (filters match nothing) shows an empty state with a reset action, not a blank body.
2. Budget used above 100% renders a capped bar plus an alert badge "Over budget", no overflow. (Behaviour when exceeded is an open question: display only.)
3. FAS review override without a justification cannot be submitted; the error appears under the field.
4. Split settlement: balance 0, balance greater than total, and total 0 all give a valid breakdown (no negative or NaN).
5. Top-Up preview with rules matching no accounts shows "0 eligible accounts" and disables Execute.

---

### Task 1: Scaffold, tokens, font

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/index.css`, `src/App.tsx`
- Test: `src/lib/smoke.test.ts`

**Interfaces:**
- Produces: Tailwind theme tokens from `design/tailwind-colors.red.js` exposed as `@theme` CSS variables in `src/index.css` (`--color-primary`, `--color-on-surface`, ... same names as the Material-style keys); `font-sans` = Inter.

- [ ] **Step 1:** In `moe-ui/`, scaffold Vite React-TS in place; install `react-router`, `@phosphor-icons/react`, `@fontsource-variable/inter`, `tailwindcss`, `@tailwindcss/vite`, `vitest`.
- [ ] **Step 2:** Add every color key of `design/tailwind-colors.red.js` plus `success #18794A / success-container #E4F4EC`, `warning #8F5F00 / warning-container #FDF1D6`, `alert #B52F37`, `line #ECE6E6`, `track #F1EFEF`, `slate #73787A` to `@theme`; body bg = `background`, text = `on-surface`; import Inter in `main.tsx`.
- [ ] **Step 3:** Smoke test `expect(1).toBe(1)` in `src/lib/smoke.test.ts`; run `npx vitest run` -> PASS.
- [ ] **Step 4:** `npm run build` -> exits 0; `npm run dev` renders a page with a `bg-primary` swatch in Inter. Add `.claude/launch.json` entry `moe-ui` (npm run dev, port 5173).

### Task 2: Pure logic (`src/lib`)

**Files:** Create `src/lib/format.ts`, `src/lib/fas.ts`, `src/lib/settlement.ts`, `src/lib/budget.ts`, `src/lib/useMockQuery.ts`; tests beside each pure module (`*.test.ts`).

**Interfaces (produces):**
- `formatSGD(n: number, opts?: {compact?: boolean}): string` -> `"S$2.40M"` compact, `"S$1,284.50"` otherwise.
- `riskLevel(score: number): "Low" | "Medium" | "High"` (score 0-100: `<35` Low, `<70` Medium, else High). `// ASSUMPTION` thresholds.
- `splitSettlement(total: number, balance: number): {fromAccount: number; fromGateway: number}` (account first, remainder gateway; clamps to >= 0).
- `useMockQuery<T>(data: T, opts?: {delayMs?: number; fail?: boolean}): {status: "loading" | "error" | "ready"; data: T | undefined; retry(): void}` (default delay 400ms; hook, verified by use in later tasks, no unit test).
- `budgetUsage(used: number, budget: number): {pct: number; over: boolean; barPct: number}` (`barPct` capped at 100; `budget<=0` -> pct 0).

- [ ] **Step 1:** Write tests: `riskLevel(18)==="Low"`, `riskLevel(54)==="Medium"`, `riskLevel(89)==="High"`; `splitSettlement(100,40)` -> `{40,60}`, `(100,0)` -> `{0,100}`, `(100,250)` -> `{100,0}`, `(0,50)` -> `{0,0}`; `budgetUsage(2.4e6,3e6)` -> `{pct:80,over:false,barPct:80}`, `(120,100)` -> `over:true, barPct:100`, `(5,0)` -> `pct:0`; `formatSGD(2400000,{compact:true})==="S$2.40M"`, `formatSGD(310000,{compact:true})==="S$310K"`.
- [ ] **Step 2:** Run `npx vitest run` -> FAIL (modules missing).
- [ ] **Step 3:** Implement the four modules to the signatures above.
- [ ] **Step 4:** Run `npx vitest run` -> all PASS.

### Task 3: UI primitives

**Files:** Create `src/components/ui/{Card,Badge,Button,Modal,StatCard,EmptyState,Field}.tsx`.

**Interfaces (produces):**
- `Card({title?, action?, children, className?})` composition: `Card`, `Card.Header`, `Card.Body`.
- `Badge({tone: "success"|"warning"|"alert"|"neutral"|"primary", children})`.
- `Button({variant: "primary"|"secondary"|"ghost", size?: "sm"|"md", icon?: ReactNode, ...buttonProps})`.
- `Modal({open: boolean, onClose(): void, title: string, children, footer?})` built on native `<dialog>` (`showModal`), Esc and backdrop click close, focus returns to opener.
- `StatCard({label, value, icon})` circle-style stat from the target.
- `EmptyState({title, hint?, action?})`; `Field({label, error?, hint?, children})` label above input, error below with `role="alert"`.

- [ ] **Step 1:** Implement the components against the tokens; `Button` has a 44px min touch target and `focus-visible` ring.
- [ ] **Step 2:** Create `src/dev/UiGallery.tsx` (default export) showing every variant. To view it, temporarily make `src/App.tsx` render it in your worktree, screenshot, verify contrast and Tab order, Esc closes Modal, then `git checkout src/App.tsx` before committing (Task 5 registers the route `/dev/ui` under `import.meta.env.DEV`).

### Task 4: DataTable and charts

**Files:** Create `src/components/ui/{DataTable,RingChart,BarChart,ProgressBar}.tsx`.

**Interfaces (produces):**
- `DataTable<T>({columns: {key: keyof T | string; header: string; sortable?: boolean; render?(row:T): ReactNode; align?: "right"}[]; rows: T[]; rowKey(row:T): string; empty: ReactNode; pageSize?: number})` with sort, pagination, wrapper `overflow-x-auto`.
- `RingChart({value: number; max: number; label: string})` SVG, text in the center, `role="img"` + `aria-label`.
- `BarChart({data: {label: string; value: number}[]; format?(n:number):string})` SVG, values labelled (not hover-only).
- `ProgressBar({pct: number; tone?: "primary"|"alert"; label: string})` no gradient, fill `barPct`.

- [ ] **Step 1:** Implement; sorting is stable and toggles asc/desc via a `<button>` in the header with `aria-sort`.
- [ ] **Step 2:** Create `src/dev/DataGallery.tsx` (default export; route `/dev/data` is registered by Task 5) showing: 0 rows (shows `empty`), 25 rows (paginates), over-budget ProgressBar, both charts; view via a temporary uncommitted `src/App.tsx` edit as in Task 3; screenshot.

### Task 5: Layout, session, routing

**Files:** Create `src/components/layout/{AppShell,Sidebar,Header}.tsx`, `src/session.tsx`, `src/routes.tsx`, `src/data/nav.ts`; Modify `src/App.tsx`.

**Interfaces:**
- Produces: `type Role = "hq" | "school" | "parent"`; `useSession(): {role: Role | null; user: {name: string; initials: string}; signIn(role: Role): void; signOut(): void}`; `navFor(role: Role): {to: string; label: string; icon: Icon; badge?: number}[]` (HQ and School lists from the handoff section 7 B/C, Parent from D).
- `AppShell` renders Sidebar + Header + `<Outlet/>`; unauthenticated users redirect to `/signin`; a role cannot open another role's prefix (`/admin/*` for hq+school, `/parent/*` for parent).

- [ ] **Step 1:** Sidebar: 84px rounded rail, icons with `aria-label` and tooltip, pin toggle to 232px showing labels (no clipping: `truncate` + title); active item burgundy.
- [ ] **Step 2:** Header: title/subtitle props, "Filter A-Z" pill, bell with dot, avatar initials, sign out.
- [ ] **Step 3:** Create stub screens so later tasks only replace file contents (each a default-export component rendering `<PagePlaceholder title="..."/>` from `src/components/layout/PagePlaceholder.tsx`, plain markup, no dependency on `components/ui`): `features/auth/SignIn.tsx`, `features/admin/dashboard/Dashboard.tsx`, `features/admin/students/Students.tsx`, `features/admin/fee-types/FeeTypes.tsx`, `features/admin/fas/FasApplications.tsx`, `features/admin/budgets/Budgets.tsx`, `features/admin/top-up/TopUp.tsx`, `features/admin/simulation/SchoolRegistry.tsx`, `features/eservice/overview/Overview.tsx`, `features/eservice/payments/Payments.tsx`, `features/eservice/fas/FamilyApplication.tsx`. `routes.tsx` lazy-loads all of them: `/signin`, `/admin` (Dashboard), `/admin/students`, `/admin/fee-types`, `/admin/fas`, `/admin/budgets`, `/admin/top-up` (hq only), `/admin/schools` (hq only, SchoolRegistry), `/parent`, `/parent/payments`, `/parent/fas`; every other nav entry goes to a generic "Coming soon" placeholder route. Also register `/dev/ui` -> `src/dev/UiGallery` and `/dev/data` -> `src/dev/DataGallery` only when `import.meta.env.DEV` (lazy, via `import.meta.glob("/src/dev/*.tsx")` so the route works whichever gallery files exist in your branch; do not create gallery files yourself).
- [ ] **Step 4:** Verify by screenshot: rail and pinned states at 1600 and 768 widths; HQ nav shows 11 items without clipping.

### Task 6: Sign-in

**Files:** Replace the stub `src/features/auth/SignIn.tsx` (default export); Create `src/data/users.ts`.

- [ ] **Step 1:** Two tabs: Parent (button "Log in with SingPass" opens Modal: mock QR -> "Verifying" -> "Authenticated" -> `signIn("parent")` and navigate `/parent`) and Staff (email, password with labelled Fields, forgot-password Modal; two seeded accounts from `users.ts`, wrong credentials show an inline error). No demo quick-jump buttons.
- [ ] **Step 2:** Per-screen gate; confirm each role lands on its own home.

### Task 7: Admin dashboard (visual target)

**Files:** Create `src/features/admin/dashboard/Dashboard.tsx` + card components under the same folder, `src/data/dashboard.ts`.

**Interfaces:** Consumes Tasks 3-5 and `budgetUsage`, `formatSGD`.

- [ ] **Step 1:** Stats panel (Total Student 12,480; Active Account 9,236; Total School 186; Pending FAS Application 342) and the 3x2 card grid from the handoff section 6 (Received FAS ring 1,284/3,420 with MOEFAS 962 / SBFAS 322; FAS by Tier 612/388/191/93; Payment History table; Budget Usage with 80% alert chip and 62%; School Info; Total Top-Up Jan-Apr bar chart). Values come from `dashboard.ts`.
- [ ] **Step 2:** Each card has a skeleton state (first render shows skeletons via `useMockQuery` from Task 2; error state shows `EmptyState` with a Retry action).
- [ ] **Step 3:** Screenshot at 1600x1000 and overlay-compare with `reference/dashboard_v6_burgundy.png`; fix spacing/typography deltas until layout matches.

### Task 8: Students (School)

**Files:** Create `src/features/admin/students/Students.tsx`, `AddStudentModal.tsx`, `src/data/students.ts`.

- [ ] **Step 1:** Filters (level, class, status), DataTable (ID, name, level, class, status, balance, SBFAS status, actions), Add Student Modal with validated Fields, CSV import Modal (file picker, parses mock, shows row count). Empty state with "Reset filters".
- [ ] **Step 2:** Per-screen gate; test filter combo that matches 0 rows.

### Task 9: Fee Types

**Files:** Create `src/features/admin/fee-types/FeeTypes.tsx`, `src/data/fees.ts`.

- [ ] **Step 1:** Cards/table for the four fee types (Miscellaneous S$13/month, Learning Materials S$55/term, Enrichment S$65/term, Student Insurance S$8/year); edit-rate Modal; "Configure new fee type" form (name, amount, cycle). HQ view additionally shows locked national ceilings.
- [ ] **Step 2:** Per-screen gate.

### Task 10: FAS Applications (AI risk + review modal)

**Files:** Create `src/features/admin/fas/{FasApplications,ReviewModal}.tsx`, `src/data/fasApplications.ts`.

**Interfaces:** Consumes `riskLevel`, `Badge`, `Modal`, `Field`.

- [ ] **Step 1:** Queue sorted by risk score desc; columns student, per-capita income band (bands only, never exact income), risk badge with score, recommended tier, SLA, "Open review".
- [ ] **Step 2:** ReviewModal: AI explanation text, recommended tier, override select requiring a non-empty justification (Review Focus 3), actions Reject / Override / Approve that update list state and show a confirmation toast-free inline status. MOEFAS vs SBFAS precedence note tagged "Assumption".
- [ ] **Step 3:** Per-screen gate; test override with empty justification is blocked.

### Task 11: Budgets & Stats

**Files:** Create `src/features/admin/budgets/Budgets.tsx`, `src/data/budgets.ts`.

- [ ] **Step 1:** School view: SBFAS budget S$120,000, absorbed S$74,800 (62.3%), 148 beneficiaries by tier. HQ view: MOEFAS allocation and per-level breakdown. Uses `budgetUsage`, `ProgressBar`; include one over-budget row in mock data (Review Focus 2).
- [ ] **Step 2:** Per-screen gate.

### Task 12: Top-Up rule builder (HQ)

**Files:** Create `src/features/admin/top-up/{TopUp,PreviewModal}.tsx`, `src/lib/topup.ts` (+ `topup.test.ts`), `src/data/topup.ts`.

**Interfaces (produces):** `eligibleAccounts(rule: TopUpRule, accounts: Account[]): Account[]` where `TopUpRule = {ageMin:number; ageMax:number; citizenOnly:boolean; enrolledOnly:boolean; balanceMin:number; balanceMax:number}`.

- [ ] **Step 1:** Test: accounts outside age range, non-citizens (when `citizenOnly`), non-enrolled (when `enrolledOnly`), and balances outside range are excluded; empty result when rule matches nothing.
- [ ] **Step 2:** Run -> FAIL; implement `eligibleAccounts`; run -> PASS.
- [ ] **Step 3:** Builder form (title, rule fields, amount, fund tag, schedule now/monthly/quarterly/yearly), PreviewModal shows eligible count and funds required (`count * amount`); Execute disabled at 0 (Review Focus 5); execution appends to history table. Dual sign-off shown as a required checkbox.
- [ ] **Step 4:** Per-screen gate.

### Task 13: Simulation (HQ)

**Files:** Create `src/features/admin/simulation/{SchoolRegistry,SimulationBanner}.tsx`; Modify `src/session.tsx` to add `simulating: {as: "school"|"parent"; sessionId: string} | null`.

- [ ] **Step 1:** HQ school registry with "Simulate" action; entering sets `simulating`, renders the School (or Parent) screens read-only (mutating buttons disabled) under a persistent banner with session ID and "Exit simulation". Banner text labels read-only as "Assumption (open question)".
- [ ] **Step 2:** Per-screen gate; verify Exit restores HQ view and disabled actions have an explanatory tooltip.

### Task 14: Parent overview

**Files:** Create `src/features/eservice/overview/Overview.tsx`, `src/data/parent.ts`.

- [ ] **Step 1:** Outstanding balance, next payment due, paid this year, child account cards with education-account balance and "Pay now", recent activity, upcoming invoices, FAS status card, transactions list (Req 8). Profile edit Modal limited to address, mailing address, contact number (tagged "Assumption").
- [ ] **Step 2:** Per-screen gate at 1600 and 768.

### Task 15: Payments (split settlement)

**Files:** Create `src/features/eservice/payments/Payments.tsx`; Consumes `splitSettlement`.

- [ ] **Step 1:** Select invoices (checkbox list), choose "Education Account first, remainder by card/bank" or "Gateway only", live payment summary from `splitSettlement` (Review Focus 4), Authorize button -> mock gateway Modal -> success state marks invoices paid and updates balance. Tag split behaviour "Assumption".
- [ ] **Step 2:** Per-screen gate; test balance 0 and balance > total in the UI.

### Task 16: FAS family application

**Files:** Create `src/features/eservice/fas/FamilyApplication.tsx`, `src/data/familyFas.ts`.

- [ ] **Step 1:** One application for the family unit: household members list, mock SingPass income-band sync (bands only), per-child result, status tracker (Submission -> Income sync -> Review -> Disbursement). "Ask AI helper" opens a Modal with a canned follow-up question flow and an auto-fill button that fills Fields from mock data.
- [ ] **Step 2:** Per-screen gate; then final pass: `npm run build` exits 0, `npx vitest run` all PASS, walk each role end to end (sign in -> main flow -> sign out) in the browser pane with a clean console.

---

## Self-review notes

- Spec coverage: stack, structure, design contract, sidebar toggle, states, phases 1-4, assumptions labelling, out-of-scope items are all mapped to tasks 1-16.
- Types consistent: `Role`, `splitSettlement`, `budgetUsage`, `riskLevel`, `eligibleAccounts` are defined once (Tasks 2, 5, 12) and only consumed later.
