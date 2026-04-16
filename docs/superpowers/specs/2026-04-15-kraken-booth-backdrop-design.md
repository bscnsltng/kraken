# 43146K KRAKEN — VEX Worlds Booth Backdrop Design Spec
**Date:** 2026-04-15
**Team:** 43146K KRAKEN — Barbe High School, Lake Charles, LA
**Competition:** VEX Robotics World Championship — *Pushback* season
**Design Concept:** "PUSHBACK: A Kraken's Warning"

---

## Overview

A static projector-mapped backdrop displayed on an 8×8 ft flat surface behind the team's competition booth. The design fuses three moods into one cinematic image: **fierce** (the Kraken as apex predator), **festive** (Louisiana Mardi Gras parade energy), and **epic** (movie-poster cinematic scale). The team's existing Kraken mascot logo serves as the hero element, surrounded by an illustrated environment that extends and amplifies it.

---

## Canvas Specifications

| Property | Value |
|---|---|
| Dimensions | 8 ft × 8 ft (square) |
| Output format | Static image (PNG, high-resolution for projection) |
| Recommended resolution | 3000 × 3000 px minimum at 300 DPI |
| Color mode | RGB (projection) |
| Surface | Flat backdrop / curtain |

---

## Color Palette

| Role | Color | Hex |
|---|---|---|
| Background / ocean depths | Deep void purple | `#1A0033` |
| Kraken body / main | Royal purple | `#6B0AC9` |
| Team name / border / lightning | Mardi Gras gold | `#FFD700` |
| Bead accents / border highlights | Mardi Gras green | `#00A550` |
| Tentacle glow / tagline glow | Teal bioluminescent | `#00E5CC` |
| Kraken eyes | Blood red | `#CC0000` |
| Lightning / sea foam | Storm white | `#E8E8FF` |
| Deep ocean void | Jet black | `#080010` |

---

## Layout — Three Zones

```
┌─────────────────────────────────────────┐
│ ✦ MARDI GRAS BORDER (top) ✦             │
│  ⚜  43146K KRAKEN  ⚜                   │  TOP ZONE (20%)
│                                         │
│    ~ storm clouds, gold lightning ~     │
│                                         │
│      ┌──────────────────────┐           │
│  ~   │   KRAKEN LOGO (hero) │   ~       │  CENTER ZONE (55%)
│  ~   │   pirate hat glowing │   ~       │
│  ~   │   tentacles extend → │   ~       │
│      └──────────────────────┘           │
│  ~~ waves extending from logo base ~~   │
│                                         │
│  🤖←🦑         🦑→🤖                   │  BOTTOM ZONE (25%)
│  "THEY SAID PUSHBACK.                   │
│   THE KRAKEN SAID NO."                  │
│                                         │
│ BARBE HIGH SCHOOL · LAKE CHARLES, LA   │
│ ✦ MARDI GRAS BORDER (bottom) · [VEX]✦ │
└─────────────────────────────────────────┘
```

### Top Zone (top 20%)
- Dark stormy sky with deep purple storm clouds
- Subtle gold lightning veins branching across the sky
- Team name **"43146K KRAKEN"** arced in large gold metallic Trajan-style serif type, all caps
- Flanked by two fleur-de-lis icons in gold
- Mardi Gras decorative border runs along the top edge

### Center Zone (middle 55%)
- The **43146K Kraken mascot logo** (pirate octopus with tricorn hat bearing the "B" for Barbe) scaled to fill ~60% of the canvas, centered
- The logo's wave elements at the base extend outward seamlessly into a full churning ocean surface across the full canvas width
- Illustrated tentacles reach beyond the logo's frame into all four corners — the logo is a "window" into a larger creature
- The pirate hat receives a subtle golden rim-light from above (spotlight-on-champion effect)
- Teal bioluminescent glow radiates outward from behind the logo as a halo
- Ocean surface shows violent churn in deep purple-black water

### Bottom Zone (bottom 25%)
- VEX Pushback arena floor viewed at a low angle
- Two small stylized VEX robot silhouettes being flung outward — one left, one right — by tentacles reaching down from the center zone
- Scattered game field elements (push barriers) tossed aside
- Tagline centered in two lines:
  - Line 1 (smaller): *"THEY SAID PUSHBACK."* — gold metallic
  - Line 2 (larger/bolder): *"THE KRAKEN SAID NO."* — gold with teal glow
- Bottom text line: **BARBE HIGH SCHOOL · LAKE CHARLES, LA** — small gold caps

---

## Border Treatment

An ornate **Mardi Gras parade float frame** runs all four edges of the canvas:

- Carved baroque scroll-work in deep purple and gold
- Embedded Mardi Gras beads in teal, green, and gold woven through the scroll-work
- Mardi Gras masks at all four corners
- Subtle confetti and feather details scattered along the border
- **VEX Robotics logo** placed in the bottom-right corner within the border frame — official, readable, not competing with the hero

---

## Typography

| Element | Style | Color |
|---|---|---|
| "43146K KRAKEN" | Large all-caps cinematic serif (Trajan Pro or similar), arched | Gold metallic, deep purple drop shadow |
| "THEY SAID PUSHBACK." | Medium all-caps bold | Gold metallic |
| "THE KRAKEN SAID NO." | Large all-caps bold (larger than line above) | Gold metallic + teal glow |
| "BARBE HIGH SCHOOL · LAKE CHARLES, LA" | Small all-caps | Gold |

---

## Source Assets

| File | Usage |
|---|---|
| `Kraken 43146K Logo.png` | Hero centerpiece — scaled to ~60% canvas width, centered |
| `VEX Worlds Logo copy.png` | Bottom-right border corner placement |

---

## Visual Style Reference

**Tone:** Dark fantasy meets Mardi Gras baroque. *Pirates of the Caribbean* meets *Coco* — rich, saturated, dramatically lit from below by bioluminescence. The border feels like carved wood painted and gilded for a parade float.

**The 30-foot test:** Fierce and iconic from across the convention hall. The Kraken and team name readable at distance. Festive detail reveals itself up close. Photographs well for social media and judging documentation.

---

## Implementation Notes

- The backdrop will be output as a high-resolution PNG and projected via projector onto the flat 8×8 backdrop
- Design should be built at 3000×3000 px or higher to avoid pixelation at projection scale
- The Kraken logo PNG should be composited at full resolution — do not scale up the source logo beyond its native resolution without upscaling first
- RGB color space throughout (not CMYK) — this is for projection, not print
- The design can be created in tools such as Adobe Photoshop, Illustrator, Canva (Pro), or generated via AI image tools (Midjourney, Adobe Firefly) using this spec as a prompt guide

---

## Success Criteria

- Immediately identifiable as the KRAKEN team from 30+ feet away
- Reflects all three moods: fierce, festive, epic
- Incorporates the actual team mascot logo as the hero element
- References the *Pushback* game season
- Represents Barbe High School and Lake Charles, LA with pride
- Photographs well — wins the booth decoration competition again
