# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A **creative design deliverable**, not a software project. The artifact is a projected booth backdrop for team **43146K KRAKEN** (Barbe High School, Lake Charles, LA) at the VEX Robotics World Championship *Pushback* season. Concept: *"PUSHBACK: A Kraken's Warning"* — fierce + festive (Louisiana Mardi Gras) + cinematic.

Two deliverables live at the repo root:

- `backdrop-mockup.html` — a single self-contained HTML/CSS/SVG file that approximates the final design in the browser. This is the **composition reference**, not the shipped art.
- `ai-prompt.md` — Midjourney and Adobe Firefly / DALL-E prompts that produce the final 3000×3000 PNG, plus post-generation compositing steps.

The mockup embeds two PNG assets by relative path: `Kraken 43146K Logo.png` (hero) and `VEX Worlds Logo copy.png` (border corner). Both must stay in the repo root for the HTML to render.

## Preview / "build" / "test"

There is no build, no lint, no tests. To review the mockup:

```bash
open backdrop-mockup.html   # macOS
```

Verification is visual against the checklist in `docs/superpowers/plans/2026-04-15-kraken-booth-backdrop.md` (Task 9, Step 2). Every element in that checklist must be visible.

## Architecture — why the HTML is the way it is

The mockup is structured to mirror the **spec layout exactly**, so edits to either should track each other:

- **Three stacked zones** inside a 900×900 `.canvas` (preview size; final output is 3000×3000): `.zone-top` (20%), `.zone-center` (55%), `.zone-bottom` (25%). The percentages come straight from the spec — do not redistribute them.
- **Z-index layering** goes: background gradient (canvas `::before`) → tentacles SVG → zone content → hero logo → wave blend (`.zone-center::after`) → Mardi Gras border frame (`.border-frame`, z-index 10, pointer-events none). The border always wins; the hero logo always reads above tentacles.
- **Color palette is a single source of truth** in `:root` CSS variables (`--void`, `--deep`, `--royal`, `--gold`, `--green`, `--teal`, `--red`, `--white`). The same hex codes appear in `ai-prompt.md` and in the spec's palette table. If you change a color, change all three.
- **Tentacles are one SVG** sibling of the zones, not per-zone, so their Bezier curves can fan from behind the logo into all four corners without clipping at zone boundaries.
- **Arched team name** uses SVG `textPath` on a circular-arc `<path>`; the gold glow is an `feGaussianBlur` + `feMerge` filter, with a deep-purple offset copy for drop-shadow depth.

## Canonical strings and assets — do not paraphrase

These are locked by the spec and are read from 30 feet away by judges. Don't "improve" them:

- Team name: **`43146K KRAKEN`** (arched, flanked by `⚜` fleur-de-lis)
- Tagline line 1 (smaller): **`THEY SAID PUSHBACK.`**
- Tagline line 2 (larger, teal glow): **`THE KRAKEN SAID NO.`**
- School credit: **`BARBE HIGH SCHOOL · LAKE CHARLES, LA`**
- Hero asset: `Kraken 43146K Logo.png` at ~60% canvas width, centered. Never upscale past native resolution without a proper upscaler — it projects at 8×8 ft.
- Border asset: `VEX Worlds Logo copy.png`, bottom-right, inside the border frame, ~8% canvas width.

Output constraints from the spec (`docs/superpowers/specs/2026-04-15-kraken-booth-backdrop-design.md`):

- Square 1:1, 3000×3000 px minimum, RGB (projector output, **not** CMYK), PNG.

## Working with the plan

`docs/superpowers/plans/2026-04-15-kraken-booth-backdrop.md` is a task-by-task reconstruction of the mockup with verify-and-commit steps. All file references are relative to the repo root (e.g., `./backdrop-mockup.html`, `./ai-prompt.md`).
