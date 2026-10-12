# How to move this into Claude Code

1. Unzip this folder somewhere, e.g. `C:\Users\<you>\dev\moe-ui`.
2. Open a terminal there and run `claude` (Claude Code reads `CLAUDE.md` automatically).
3. Paste this first prompt:

> Read CLAUDE.md and look at reference/dashboard_v6_burgundy.png and the screens in stitch-export/red/.
> The Stitch screens are bad visually, so use them only for content and flow. Rebuild the Admin Portal dashboard
> as a Vite + React + Tailwind app matching dashboard_v6_burgundy (red + white, burgundy primary, no gradients),
> with shared sidebar/header components and mock data in src/data. Run it and show me a screenshot before moving on.

To view the raw Stitch HTML files, just open them in a browser (they need internet for Tailwind and icons).
