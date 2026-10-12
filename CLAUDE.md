# MOE Education Account & FAS — base UI

Agile/Scrum practice project ("Agile final"). Simulated customer: Ministry of Education, Singapore.
Two portals on one database:
- **Admin Portal** — MOE HQ User, School User (Req 1–7)
- **e-Service Portal** — Parent, logs in with SingPass (Req 8–10)

All third-party systems (SingPass, income API, payment gateway, AI) are **simulated**. Use **mock data**.
This repo is the **base UI** the team builds on. Right now it is images / static mockups only — no backend.

## The 10 requirements (one line each)
1. Education Account auto-created at age 7, auto-closed at 16 (Singapore Citizens).
2. MOE HQ top-up: batch (rules by age, balance, schooling status) or specific accounts; regular or ad-hoc.
3. Maintain schools, levels/cohorts, classes, students, fee types and components; accounts can pay fees.
4. FAS: MOEFAS (auto-granted by criteria), SBFAS (school decides if MOEFAS not granted); configurable schemes/tiers; optional AI risk tier (Low/Medium/High).
5. Capture hardcopy FAS applications entered by School users.
6. Budget + statistics: HQ for MOEFAS, School for SBFAS.
7. Simulation: HQ can view the system as a School user / Parent.
8. Parent portal via SingPass: account, balance, transactions, edit basic details; optional AI assistant + auto-fill FAS form.
9. Parent views outstanding charges and pays via account balance or online payment.
10. Parent applies for FAS as a family unit.

Full brief and clarification log live in the claude.ai Project "Agile final".

## Design decisions (do not undo)
- **Red + white** are the two main colors. Small elements red, everything else white.
- **No gradients** (team feedback).
- Plain bright red was too harsh → primary is **burgundy `#8A2538`**; alerts use a brighter red.
- Flat cards, soft borders, generous whitespace. Inter font. Rounded sidebar.
- Tokens: `design/palette.md` and `design/tailwind-colors.red.js`.
- Brown, navy and forest colorways were tried — brown was rejected. Files in `reference/` only for comparison.

## What exists
| Path | What it is |
|---|---|
| `reference/dashboard_v6_burgundy.*` | **The preferred base dashboard** (hand-built HTML + PNG). Sidebar, header with Filter A–Z + bell + avatar, 4 stat circles (Total Student, Active Account, Total School, Pending FAS), Received FAS ring card, FAS by Tier, Payment History, Budget Usage, School Info, Total Top-Up Jan–Apr. |
| `reference/dashboard_v2_bright_red.*` | Brighter red variant (team liked the layout, wanted it softer). |
| `stitch-export/original/` | Raw HTML exported from Google Stitch: 4 screens (School Admin dashboard, Sign-in, Parent portal, MOE HQ dashboard). Tailwind via CDN, Material-style color tokens. |
| `stitch-export/red/` | Same 4 screens recolored to the red palette and with filler text trimmed. |
| `tools/build_stitch_red.py` | Script that produced `stitch-export/red/` from the original (palette swap + text trim). |

## Known problems
- The Stitch screens look generic and cluttered. The user said: **"the UI is really bad."** Treat them as a content/flow reference only (what each screen needs), not as the visual target.
- Stitch pages load Tailwind from a CDN and icons from Google Fonts at runtime; images in them are remote placeholders.
- Sidebar labels wrap/clip at 232px in several screens (e.g. "FAS Schemes & Budgets") — check once real icons load.
- School name, addresses, people, numbers are invented mock data.

## Suggested next step
Rebuild the UI as a proper component-based app so the team can extend it, using `dashboard_v6_burgundy` as the visual target:
1. Vite + React + Tailwind (or the team's stack), tokens from `design/tailwind-colors.red.js`.
2. Shared layout (sidebar, header) + the Admin Portal dashboard first, then the screens in `stitch-export/red/` as separate routes.
3. Mock data in one `data/` folder so it can later be swapped for the simulated APIs.
4. Keep it flat: no gradients, red used sparingly.

## Working preferences
- Keep replies short. Show results as real files / running pages, not long explanations.
- The user prefers normal file types over online docs/artifacts for documents.
