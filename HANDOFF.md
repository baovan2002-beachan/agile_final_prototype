# MOE Education Account & FAS — UI handoff for Claude Code

Everything Claude Code needs to continue the **base UI**. Self-contained: no other doc is required.

## 1. Project context

> **Other project files** are in the parent folder (`../`): `MOE_Consolidated_Project_Brief.md`, `MOE_Full_Clarification_Log.md`, `MOE_Epics_and_User_Stories.md` (+ `.pdf`), `MOE_Kickoff_Prep_Pack.pdf`, `MOE_Question_Triage.xlsx`. Read the Brief and the Epics/User Stories when you need the full requirement detail or story-level acceptance criteria. This file is only the UI handoff.

- Agile/Scrum practice project ("Agile final"). Simulated customer: **Ministry of Education (MOE), Singapore**.
- Two portals on the same database:
  - **Admin Portal** — roles: MOE HQ User, School User (Req 1–7)
  - **e-Service Portal** — role: Parent, login via SingPass (Req 8–10)
- Student is not a confirmed portal user. **The Parent owns the Education Account** and pays the fees.
- All third parties (SingPass, income API, payment gateway, AI/ML) are **simulated**. Use **mock data** only.
- Team: 4 BA (fill the Product Owner / Scrum Master roles), 10 developers, 4 QA. 3 one-week sprints, UAT in week 4.
- Final demo must show **working end-to-end flows**, not only mockups. AI features are optional but the team plans to include them.
- Current state: **images / static mockups only** — no backend, no framework yet. The user wants a proper base UI the team can extend.

## 2. The 10 requirements (official baseline)

| # | Portal | Requirement |
|---|---|---|
| 1 | Admin | Education Account for Singapore Citizens: auto-created and activated when the child turns 7, auto-closed at 16. Balance goes to the CPF account on closure by default. |
| 2 | Admin | MOE HQ **Top-Up**: in batches or to specific account holders. Batch rules by age, account balance, schooling status etc. Regular or ad-hoc. |
| 3 | Admin | HQ and School users maintain schools, levels/cohorts, classes, students per class, fee types and fee components. Singaporean students can pay fees from the Education Account balance. |
| 4 | Admin | **FAS**: configurable schemes with eligibility by nationality, household income band, per-capita income band; tiers and subsidy per fee component. Income comes from a third-party API (bands only). **MOEFAS** auto-granted if criteria met; otherwise School may grant **SBFAS**. Outcome must be reflected in fees payable. Optional AI: rules decide eligibility, ML predicts remaining difficulty (Low / Medium / High risk) and recommends a tier. |
| 5 | Admin | Capture and process **hardcopy FAS applications** collected by School users for parents who can't use the e-Service Portal. |
| 6 | Admin | **Budget and statistics**: HQ sets budget and tracks MOEFAS subsidies; School sets budget and tracks SBFAS subsidies. |
| 7 | Admin | **Simulation**: HQ can see the system as a School user or Parent to answer queries. (Read-only vs act-on-behalf is still open.) |
| 8 | e-Service | Parent logs in via **SingPass**; views education account details, balance, transactions; edits basic personal details (address, mailing address, contact number) "where applicable". Optional AI assistant (asks follow-ups) and auto-fill of the FAS form. |
| 9 | e-Service | Parent views **outstanding charges**; pays from Education Account balance or online payment. |
| 10 | e-Service | Parent applies for FAS **as a family unit**. |

## 3. Confirmed facts that affect the UI

- Account closes on the 16th birthday; remaining balance auto-transfers to CPF by default.
- A dropped-out student keeps the account; a student can keep studying after the account is terminated.
- Income API returns **bands/ranges**, never exact income.
- MOE FAS is nationwide; HQ decides tiers and subsidy amounts; criteria must be configurable (trainer suggested a **rule/condition-builder UI**).
- The school UI can be configured per school (what is configurable is not specified).
- Government allocates FAS budget to schools once FAS is granted.
- Payment gateway: our choice of solution; waiting for VM whitelist approval.

## 4. Open questions (don't invent rules for these — mark as mock/assumption)

Leap-day birthdays; citizenship change after age 7 or before 16; CPF transfer failure/SLA; refunds, partial and split payment, overpayment, allocation order; whether MOEFAS and SBFAS are mutually exclusive and which wins; which fee components MOEFAS covers; one FAS application per family or per child (Req 4 says student, Req 10 says family); hardcopy flow details; simulation read-only or not; behaviour when budget is exceeded; HQ vs School permission matrix; which personal fields a parent can edit.

## 5. Design decisions (do not undo)

- **Red + white** are the two main colors. Small elements red, everything else white.
- **No gradients** (team feedback).
- Pure bright red was "too red / eye-hurting" → primary is **burgundy `#8A2538`**; a brighter red only for alerts.
- Flat cards, thin soft borders, lots of whitespace, rounded sidebar, **Inter** font.
- Status colors only for status: success green, warning amber, alert red.
- Colorways tried and not chosen: brown (team said it "isn't working"), navy, forest.
- User verdict on the Stitch-generated screens: **"the UI is really bad."** Use them for content/flow only, not as the visual target.

### Tokens

| Role | Hex |
|---|---|
| Primary (burgundy) | `#8A2538` |
| Primary tier 1 / 2 / 3 | `#A8343F` / `#CB7A83` / `#F0D9DC` |
| Alert red | `#B52F37` (dashboard), `#D61F26` (Stitch export) |
| Ink (text) | `#1A1512` |
| Slate (secondary text) | `#73787A` (use `#5E5658` for small text) |
| Line / track | `#ECE6E6` / `#F1EFEF` |
| Page bg / card | `#F8F6F6` / `#FFFFFF` |
| Success / warning | `#18794A` on `#E4F4EC` / `#8F5F00` on `#FDF1D6` |

Tailwind snippet (Material-style tokens used by the Stitch export, red palette):

```js
// tailwind.config.js -> theme.extend.colors
{
  "background": "#F8F6F6", "surface": "#F8F6F6",
  "surface-container-lowest": "#FFFFFF", "surface-container-low": "#F6F3F3",
  "surface-container": "#F0ECEC", "surface-container-high": "#EAE5E5", "surface-container-highest": "#E4DEDE",
  "on-surface": "#1A1512", "on-surface-variant": "#5E5658",
  "outline": "#8A8082", "outline-variant": "#E0D8D9",
  "primary": "#8A2538", "on-primary": "#FFFFFF", "primary-container": "#A8343F",
  "primary-fixed": "#F3D2D5", "primary-fixed-dim": "#E8BFC3",
  "secondary": "#A8343F", "secondary-fixed": "#F9E3E5",
  "tertiary": "#D61F26", "tertiary-fixed": "#FDE3E3",
  "error": "#BA1A1A", "error-container": "#FFDAD6"
}
```

## 6. Target base screen: Admin Portal dashboard (visual target = `reference/dashboard_v6_burgundy.png`)

Derived from the team's wireframe. Layout (1600 × 1000):

- **Sidebar** (84 px, rounded): logo, Home (active) + 4 nav icons, logout at the bottom.
- **Header**: title "Dashboard" + subtitle, **Filter A–Z** pill, notification bell with dot, avatar "AD".
- **Stats panel** (white, 4 items): Total Student 12,480 · Active Account 9,236 · Total School 186 · Pending FAS Application 342.
- **Card grid 3 × 2**:
  1. **Received FAS** — 1,284 / 3,420, 37.5 % ring, MOEFAS 962 / SBFAS 322.
  2. **FAS by Tier** — 612 / 388 / 191 / 93.
  3. **Payment History** — table: INV-260931 Upcoming, INV-260927 Paid, INV-260915 Paid, INV-260902 Overdue.
  4. **Budget Usage** — MOEFAS S$2.40M / S$3.00M (80 %, alert chip), SBFAS S$310K / S$500K (62 %).
  5. **School Info** — Greenfield Secondary School + illustration (invented).
  6. **Total Top-Up** — S$4.43M; Jan 1.20M, Feb 0.85M, Mar 1.46M, Apr 0.92M (bar chart).
- All numbers are mock. Several cards were filler for blank boxes in the wireframe — change freely.

## 7. Screen inventory (from the Stitch export — content/flow reference)

Stitch screens are Tailwind-CDN HTML with Material icons. Raw versions are in `stitch-export/original/`, red + trimmed in `stitch-export/red/`.

**A. Sign-in** (`2_signin`): left panel with title + 3 feature points; right panel with tabs *Parent or guardian* / *School or MOE staff*. Parent tab: **Log in with Singpass** (opens a mock QR modal → "Verifying…" → "Authenticated" → redirect to Parent overview) + a "quick demo jump" row. Staff tab: email, password, forgot-password modal (reset link flow), "sign in", demo fast-fill buttons for *Alicia Tan – School Admin* and *Daniel Lim – MOE HQ Officer*.

**B. School Admin portal** (`1_school_admin_dashboard`), sidebar sections: Overview, Education Levels, Classes, Students, Fee Types, FAS Applications (badge 14), Budgets & Stats, Audit Log, Settings.
- *Overview*: school header (Riverside Primary School, BPS001, AY 2026), 4 tiles (Total Enrollment 1,200; Total Classes 30; Education Levels 6; Active Fee Types 4), quick actions, fee-schedule summary, student directory sample.
- *Education Levels*: P1–P6 cards (cohort 200, 5 classes, curriculum head, assistance rate).
- *Classes*: 12 class cards with form teacher, room, 40/40 capacity.
- *Students*: filters (level, class, status), Import CSV, Add Student, table with ID / name / level / class / status / balance / SBFAS status / actions, pagination. Modals: CSV ingest, add student.
- *Fee Types*: Miscellaneous S$13/month, Learning Materials S$55/term, Enrichment S$65/term, Student Insurance S$8/year, with edit rate and "configure new fee type".
- *FAS Applications*: SBFAS review queue sorted by risk. Columns: student, household per-capita income, **AI risk rating** (High 89 % / Medium 54 % / Low 18 %), recommended tier, SLA, "Open review". Review modal: AI explanation, recommended tier, override with mandatory justification, reject / override / approve.
- *Budgets & Stats*: SBFAS budget S$120,000, absorbed S$74,800 (62.3 %), beneficiaries 148 by tier, governance notes.
- *Audit Log*: timestamp, administrator, action, target, details, status.
- *Settings*: academic calendar, billing cycles, bursar delegation, approval threshold.

**C. MOE HQ portal** (`4_moe_hq_dashboard`), sidebar: Overview, Schools, Budget allocation, Classes, Students, Education Accounts, Top-Up Management, Fee Types, FAS Schemes & Budgets, Audit Log, Settings.
- *Overview*: national KPIs (186 schools, 142,860 students, 3,810 classes, 114,280 education accounts), school registry with **Simulate** action.
- **Simulation mode banner** (read-only sandbox, session ID, exit button) showing the School user's view.
- *Budget allocation / education levels*: Primary / Secondary / Post-secondary cards (cohort, schools, annual grant ceiling), class distribution, density.
- *Education Accounts*: auto-created at age 7 count, PSEA rollover at 16+, ledger inspection.
- *Top-Up Management*: **batch rule builder** (title, age range, citizen status, schooling enrolment, balance range, amount, reason/fund tag, dual sign-off), preview and validation modal (eligible accounts, treasury funds required, schedule now / monthly / quarterly / yearly), execution history table.
- *Fee Types*: national tariff by citizen / PR / international with locked ceilings.
- *FAS Schemes & Budgets*: national MOEFAS allocation, granted to date, beneficiaries, auto-grant engine log (application, income band, AI confidence, action).
- *Audit Log* with chain-hash verify; *Settings* with SingPass gateway sync, fiscal calendar.

**D. Parent portal / e-Service** (`3_parent_portal`), sidebar: Overview, Students (2), Payments, Transactions, Financial Aid (FAS), Statements, Settings. Header has an **EduFund AI** helper.
- *Overview*: outstanding balance $2,100; next payment due $1,700 (Nov 1); paid this year $4,800; student account cards (Emma Mitchell Gr 8, Noah Mitchell Gr 5) with education-account balance and **Pay now**; recent activity; upcoming invoices; FAS status card.
- *Students*: enrolled dependents, link new dependent, pay fees / view ledger.
- *Payments*: checkout workbench — select invoices, **split settlement** (education account first, remainder by bank/card) vs direct gateway, payment summary, authorize.
- *Transactions*: filters, table with receipt.
- *FAS*: family application status tracker (Submission → Singpass income sync → bursar review → disbursement), per-child result, re-sync income, "ask AI helper".
- *Statements*: monthly PDFs. *Settings*: profile (legal name, NRIC, email, phone), notification preferences.

## 8. Known issues in the Stitch export

- Sidebar labels wrap/clip at 232 px (e.g. "FAS Schemes & Budgets").
- Visually generic, dense, inconsistent hierarchy.
- Runtime dependencies: Tailwind CDN, Google Fonts (Inter, Material Symbols), remote placeholder images.
- Names, schools, amounts, IDs are invented.
- Some Stitch screens contain demo shortcuts (quick-jump buttons) that exist for prototyping only.

## 9. Suggested plan for Claude Code

1. Scaffold **Vite + React + Tailwind** (or the team's stack); put the tokens above in the Tailwind config; load Inter.
2. Build shared layout: `Sidebar`, `Header`, `StatCard`, `Card`, `DataTable`, `Badge`, `Modal`, `RingChart`, `BarChart` (inline SVG, no heavy chart lib needed).
3. Implement the **Admin Portal dashboard** (section 6) first and compare it with `dashboard_v6_burgundy.png` at 1600 × 1000.
4. Add routes in this order: Students → Fee Types → FAS Applications (with the AI risk badge and review modal) → Budgets & Stats → Top-Up (rule builder) → Simulation.
5. Then the Parent portal: Overview → Payments (split settlement) → FAS family application.
6. Keep all mock data under `src/data/` so it can be replaced by the simulated APIs later.
7. After each screen: run it, screenshot it, check text contrast and that nothing clips.

## 10. Working preferences

- Short replies; show results as running pages / screenshots, not long explanations.
- The user prefers normal files over online docs or artifacts.
- Ask before big structural choices only if they can't be undone easily; otherwise decide and say what you chose.
- Don't add gradients. Don't make it "too red".
