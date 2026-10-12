# MOE Education Account & FAS - Base UI design

Status: draft for review. Source: `HANDOFF.md`, `CLAUDE.md`, `reference/dashboard_v6_burgundy.*`.

## 1. Understanding (please correct)

- **Goal:** a component-based, extendable base UI for a 10-developer team to build the 3-sprint demo on. Final demo needs working end-to-end flows on mock data, not only mockups.
- **Users:** MOE HQ user, School user (Admin Portal); Parent via mock SingPass (e-Service Portal).
- **Success:** the Admin dashboard matches `dashboard_v6_burgundy.png` at 1600x1000; every other screen reuses the same shared components; all data lives in `src/data/` and can be swapped for simulated APIs.
- **Assumed (not stated):** TypeScript is acceptable; light mode only for now (handoff defines no dark tokens); desktop-first with a usable layout down to 768px.

## 2. Skills applied

| Skill | Used for |
|---|---|
| brainstorming | this spec and the approval gate |
| frontend-ui-engineering | composition over config, state/empty/error handling, a11y, breakpoints |
| ui-ux-pro-max | style = **Minimalism & Swiss**, density 7 / motion 3 / variance 3 (dashboard); table + chip-reflow rules. Its generated palette (dark slate, Fira) is **rejected**: handoff tokens win |
| taste-skill | anti-slop checks only. It declares dashboards out of scope, so landing-page rules (hero, eyebrows, marquee) do not apply. Inter is kept because the handoff mandates it |
| incremental-implementation / test-driven-development / verification-before-completion | build order and "run it, screenshot it" gate per screen |

## 3. Stack (decided)

| Concern | Choice | Why |
|---|---|---|
| Build | Vite + React 18 + TypeScript | handoff; types document the mock API shapes |
| Styling | Tailwind v4 (`@tailwindcss/vite`), tokens in `@theme` from `design/palette.md` | handoff; no CDN |
| Font | `@fontsource-variable/inter`, self-hosted | no runtime Google Fonts |
| Icons | `@phosphor-icons/react`, one family, one stroke weight | no Material CDN; no hand-drawn SVG |
| Charts | inline SVG (`RingChart`, `BarChart`) | handoff; no chart lib |
| Routing | `react-router` | deep links per screen |
| Modals | native `<dialog>` | built-in focus trap and Esc |
| State | local state + one `SessionContext` (role) | simplest that works |
| Tests | Vitest for pure logic in `src/lib` (risk tier, budget %, split settlement) | one runnable check per logic path |

No Motion/GSAP: motion dial is 3 (hover/focus transitions, 150-200ms, `prefers-reduced-motion` respected).

## 4. Structure

```
src/
  components/ui/      Card, Badge, Button, DataTable, Modal, StatCard, RingChart, BarChart, Field
  components/layout/  AppShell, Sidebar, Header
  features/
    auth/             SignIn (mock SingPass + staff tabs)
    admin/            dashboard, students, fee-types, fas-applications, budgets, top-up, simulation
    eservice/         overview, payments, fas-family-application
  data/               mock data only (one file per domain) + types.ts
  lib/                pure logic (+ tests)
  routes.tsx          role -> route + nav config
```

Rules: no feature imports from another feature; shared UI only via `components/`; no raw hex in components, tokens only.

## 5. Design contract

- Red + white; burgundy `#8A2538` primary, alert red only for alerts; no gradients; flat cards, 1px `#ECE6E6` borders, no shadows; 8px spacing scale; one radius rule (cards 16, controls 10, pills full, sidebar 24).
- Status never by color alone: every status badge carries text (and icon where space allows).
- Sidebar: 84px rounded icon rail as in the target, icons with `aria-label` + tooltip, a toggle pins it open to 232px labelled (fixes the Stitch clipping). Nav items differ by role (HQ / School / Parent).
- Every screen ships loading skeleton, empty state, and error state where data can be absent.
- Tables: sortable, keyboard-reachable actions, overflow-x wrapper below 768px.
- Contrast: body 4.5:1 minimum (secondary text `#5E5658` for small sizes); visible focus ring on every control.

## 6. Delivery phases (each ends with run + screenshot + contrast/clip check)

1. **Foundation:** scaffold, tokens, shared components, AppShell.
2. **Sign-in + Admin dashboard** (visual target) with role switch.
3. **Admin routes:** Students, Fee Types, FAS Applications (AI risk badge + review modal with mandatory override justification), Budgets & Stats, Top-Up rule builder, Simulation (read-only banner, marked assumption).
4. **e-Service:** Overview, Payments (split settlement, marked assumption), FAS family application.

Open rules from the handoff (MOEFAS vs SBFAS priority, budget exceeded, parent-editable fields, etc.) are implemented as clearly labelled mock assumptions, not decisions.

## 7. Out of scope now

Dark mode, backend, real auth, i18n, the Stitch screens' visual style (content/flow only), audit-log chain-hash and settings screens beyond placeholders.
