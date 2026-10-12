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

---

# How to move this into Claude Code

1. Unzip this folder somewhere, e.g. `C:\Users\<you>\dev\moe-ui`.
2. Open a terminal there and run `claude` (Claude Code reads `CLAUDE.md` automatically).
3. Paste this first prompt:

> Read CLAUDE.md and look at reference/dashboard_v6_burgundy.png and the screens in stitch-export/red/.
> The Stitch screens are bad visually, so use them only for content and flow. Rebuild the Admin Portal dashboard
> as a Vite + React + Tailwind app matching dashboard_v6_burgundy (red + white, burgundy primary, no gradients),
> with shared sidebar/header components and mock data in src/data. Run it and show me a screenshot before moving on.

To view the raw Stitch HTML files, just open them in a browser (they need internet for Tailwind and icons).
