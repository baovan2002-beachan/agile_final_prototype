# MOE Education Account & FAS - base UI

Vite + React + TypeScript + Tailwind v4. Frontend only: all data is mock, all third-party systems are simulated.

## Run

```
npm install
npm run dev        # http://localhost:5173
npm test           # vitest (pure logic)
npm run build      # tsc -b + vite build
```

- **Role switch (dev only):** open `/?as=hq`, `/?as=school` or `/?as=parent` to skip the sign-in screen.
- **Demo accounts:** the mock parent and staff test accounts live in `src/data/users.ts` (the staff sign-in screen also lists the staff ones).
- **Folder map:** `src/components/ui` shared primitives; `src/components/layout` shell, sidebar, header; `src/features/admin|auth|eservice` screens per portal; `src/data` mock data and nav; `src/lib` pure logic with tests; `design/` tokens; `docs/superpowers` spec and plan.

## Status

| Portal | Built | Placeholder nav entries ("coming soon") |
|---|---|---|
| Sign-in | Parent (simulated SingPass) and staff email sign-in | - |
| MOE HQ | Overview dashboard, Schools registry with Simulation (view as School or Parent), Budget allocation (MOEFAS, also under FAS Schemes & Budgets), Students, Top-Up Management, Fee Types (national ceilings); the FAS review queue still opens at `/admin/fas` but is not in the HQ nav | Classes, Education Accounts, Audit Log, Settings |
| School | Overview dashboard, Students, Fee Types, FAS Applications (review queue with AI risk), Budgets & Stats (SBFAS) | Education Levels, Classes, Audit Log, Settings |
| Parent | Overview, Payments (account first, then gateway), Financial Aid (family FAS application) | Students, Transactions, Statements, Settings |

- **State is local.** Everything is mock data held in React state. The parent store (`src/data/parentStore.tsx`: invoices, Education Account balances, transactions, profile) is shared across the parent screens, so a payment on Payments shows on Overview, but it resets on reload. Nothing is saved.
- **Open questions** are marked `// ASSUMPTION:` in code and show an "Assumption" tag in the UI.

### Requirements not yet covered

- Req 5: hardcopy FAS application capture by School users.
- Req 1: Education Account lifecycle view (auto-create at 7, auto-close at 16).
- Req 4: scheme and tier rule builder, and the MOEFAS auto-grant log.
- Req 2: top-up to specific accounts (only rule-based batch top-up exists).
- Req 3: levels, classes and fee components maintenance.

---
