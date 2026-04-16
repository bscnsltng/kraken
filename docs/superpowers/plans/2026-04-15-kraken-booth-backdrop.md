# Kraken Booth Backdrop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a browser-previewable HTML mockup of the "PUSHBACK: A Kraken's Warning" booth backdrop and a ready-to-paste AI image generation prompt for the final production-quality PNG.

**Architecture:** A single self-contained HTML file (`backdrop-mockup.html`) uses CSS layers, SVG decorations, and embedded PNG assets to faithfully approximate the three-zone layout, color palette, border treatment, and typography. A companion markdown file (`ai-prompt.md`) contains the Midjourney/Firefly prompt derived directly from the spec.

**Tech Stack:** HTML5, CSS3 (gradients, box-shadow, text-shadow, clip-path, CSS transforms for arc text), inline SVG (lightning bolts, fleur-de-lis, scroll-work border), embedded PNG assets referenced by relative path.

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `backdrop-mockup.html` | Create | Full browser-viewable design mockup |
| `ai-prompt.md` | Create | Midjourney / Adobe Firefly generation prompt |

Both files live at the repo root (same directory as the logo PNGs so relative paths work).

---

## Task 1: Scaffold the HTML file with color palette and zone structure

**Files:**
- Create: `./backdrop-mockup.html`

- [ ] **Step 1: Create the base HTML file with CSS variables and three-zone skeleton**

Create `backdrop-mockup.html` with this exact content:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>43146K KRAKEN — Booth Backdrop Preview</title>
  <style>
    /* ── RESET ── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    /* ── COLOR PALETTE ── */
    :root {
      --void:    #080010;
      --deep:    #1A0033;
      --royal:   #6B0AC9;
      --gold:    #FFD700;
      --green:   #00A550;
      --teal:    #00E5CC;
      --red:     #CC0000;
      --white:   #E8E8FF;
      --border-w: 48px;
    }

    /* ── CANVAS: square, max 900px for screen preview ── */
    body {
      background: #111;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      font-family: 'Georgia', serif;
    }

    .canvas {
      position: relative;
      width: 900px;
      height: 900px;
      overflow: hidden;
      background: var(--void);
    }

    /* ── THREE ZONES ── */
    .zone-top    { position: absolute; top: 0;    left: 0; right: 0; height: 20%; }
    .zone-center { position: absolute; top: 20%;  left: 0; right: 0; height: 55%; }
    .zone-bottom { position: absolute; top: 75%;  left: 0; right: 0; height: 25%; }
  </style>
</head>
<body>
  <div class="canvas">
    <div class="zone-top"><!-- TOP: storm sky + team name --></div>
    <div class="zone-center"><!-- CENTER: hero logo + glow + tentacles --></div>
    <div class="zone-bottom"><!-- BOTTOM: robots + tagline + school text --></div>
    <!-- BORDER overlays on top of all zones -->
  </div>
</body>
</html>
```

- [ ] **Step 2: Open in browser and verify**

Open `backdrop-mockup.html` in any browser. Expected: black 900×900 square centered on a dark page. Three zones exist but are invisible (no content yet).

- [ ] **Step 3: Commit**

```bash
cd "$(git rev-parse --show-toplevel)"
git add backdrop-mockup.html
git commit -m "feat: scaffold backdrop mockup with color palette and zone structure"
```

---

## Task 2: Background — deep ocean / storm sky gradient

**Files:**
- Modify: `./backdrop-mockup.html`

- [ ] **Step 1: Add the full-canvas background gradient and storm clouds**

Inside `<style>`, after `.zone-bottom { ... }`, add:

```css
/* ── BACKGROUND GRADIENT (full canvas) ── */
.canvas::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 50% 30%, #2a005a 0%, transparent 70%),
    radial-gradient(ellipse 60% 40% at 20% 10%, #1a0044 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 80% 10%, #1a0044 0%, transparent 60%),
    linear-gradient(180deg, #080018 0%, #1A0033 35%, #0d0025 65%, #080010 100%);
  z-index: 0;
}

/* ── STORM CLOUDS (top zone) ── */
.zone-top {
  background:
    radial-gradient(ellipse 40% 70% at 25% 50%, rgba(42,0,90,0.8) 0%, transparent 70%),
    radial-gradient(ellipse 40% 70% at 75% 50%, rgba(42,0,90,0.8) 0%, transparent 70%),
    radial-gradient(ellipse 60% 80% at 50% 30%, rgba(30,0,60,0.6) 0%, transparent 80%);
  z-index: 1;
}

/* ── OCEAN SURFACE (center/bottom boundary) ── */
.ocean-surface {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 30%;
  background: linear-gradient(180deg,
    transparent 0%,
    rgba(10, 0, 30, 0.6) 40%,
    rgba(6, 0, 20, 0.9) 100%
  );
  z-index: 1;
}
```

In the HTML, add `<div class="ocean-surface"></div>` as the last child inside `.zone-center`.

- [ ] **Step 2: Open in browser and verify**

Expected: Rich deep purple-black gradient from top to bottom, with darker cloud-like shapes in the top zone. Subtle ocean surface darkening at the bottom of the center zone.

- [ ] **Step 3: Commit**

```bash
git add backdrop-mockup.html
git commit -m "feat: add deep ocean background gradient and storm sky"
```

---

## Task 3: Lightning veins in top zone

**Files:**
- Modify: `./backdrop-mockup.html`

- [ ] **Step 1: Add SVG lightning bolts to the top zone**

Replace the top zone HTML comment with:

```html
<div class="zone-top">
  <svg class="lightning" viewBox="0 0 900 180" xmlns="http://www.w3.org/2000/svg">
    <!-- Left lightning branch -->
    <polyline points="180,0 155,45 175,45 140,110 160,110 120,180"
      stroke="#FFD700" stroke-width="1.5" fill="none" opacity="0.6"/>
    <polyline points="155,45 130,80"
      stroke="#FFD700" stroke-width="1" fill="none" opacity="0.4"/>
    <!-- Right lightning branch -->
    <polyline points="720,0 745,50 725,50 760,115 740,115 780,180"
      stroke="#FFD700" stroke-width="1.5" fill="none" opacity="0.6"/>
    <polyline points="745,50 770,85"
      stroke="#FFD700" stroke-width="1" fill="none" opacity="0.4"/>
    <!-- Center subtle veins -->
    <polyline points="420,0 430,30 415,30 435,70"
      stroke="#E8E8FF" stroke-width="0.8" fill="none" opacity="0.3"/>
    <polyline points="480,0 470,25 485,25 460,65"
      stroke="#E8E8FF" stroke-width="0.8" fill="none" opacity="0.3"/>
  </svg>
</div>
```

Add this CSS:

```css
.lightning {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
}
```

- [ ] **Step 2: Open in browser and verify**

Expected: Faint gold/white lightning bolt shapes branching down from the top of the canvas on both sides, plus subtle center veins.

- [ ] **Step 3: Commit**

```bash
git add backdrop-mockup.html
git commit -m "feat: add SVG lightning veins to storm sky"
```

---

## Task 4: Hero logo — centered with glow halo

**Files:**
- Modify: `./backdrop-mockup.html`

- [ ] **Step 1: Place the Kraken logo with teal glow halo**

Replace the center zone HTML comment with:

```html
<div class="zone-center">
  <div class="hero-glow"></div>
  <img class="hero-logo" src="Kraken 43146K Logo.png" alt="43146K KRAKEN logo">
  <div class="ocean-surface"></div>
</div>
```

Add this CSS:

```css
/* ── HERO LOGO ── */
.zone-center {
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.hero-glow {
  position: absolute;
  width: 65%;
  height: 80%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: radial-gradient(ellipse 60% 60% at 50% 45%,
    rgba(0, 229, 204, 0.18) 0%,
    rgba(107, 10, 201, 0.22) 40%,
    transparent 75%
  );
  z-index: 1;
  pointer-events: none;
}

.hero-logo {
  position: relative;
  width: 60%;
  height: auto;
  z-index: 3;
  filter:
    drop-shadow(0 0 32px rgba(0, 229, 204, 0.5))
    drop-shadow(0 0 80px rgba(107, 10, 201, 0.4))
    drop-shadow(0 8px 24px rgba(0,0,0,0.8));
}
```

- [ ] **Step 2: Open in browser and verify**

Expected: The Kraken pirate-octopus logo centered in the middle zone, surrounded by a soft teal/purple radial glow. Logo has drop-shadow depth. If the image shows broken (path issue), verify `backdrop-mockup.html` and `Kraken 43146K Logo.png` are in the same directory.

- [ ] **Step 3: Commit**

```bash
git add backdrop-mockup.html
git commit -m "feat: place hero logo with teal bioluminescent glow halo"
```

---

## Task 5: Extended tentacles reaching into corners

**Files:**
- Modify: `./backdrop-mockup.html`

- [ ] **Step 1: Add SVG tentacle extensions that reach from behind the logo into the four corners**

Add this SVG as the first child of `.canvas`, before all zones:

```html
<!-- TENTACLES: behind logo, in front of background -->
<svg class="tentacles" viewBox="0 0 900 900" xmlns="http://www.w3.org/2000/svg">
  <!-- Upper-left tentacle -->
  <path d="M 390,310 C 300,250 180,180 60,80"
    stroke="#6B0AC9" stroke-width="22" fill="none" stroke-linecap="round"
    opacity="0.75"/>
  <path d="M 390,310 C 300,250 180,180 60,80"
    stroke="#00E5CC" stroke-width="4" fill="none" stroke-linecap="round"
    opacity="0.4"/>
  <!-- Upper-right tentacle -->
  <path d="M 510,310 C 600,250 720,180 840,80"
    stroke="#6B0AC9" stroke-width="22" fill="none" stroke-linecap="round"
    opacity="0.75"/>
  <path d="M 510,310 C 600,250 720,180 840,80"
    stroke="#00E5CC" stroke-width="4" fill="none" stroke-linecap="round"
    opacity="0.4"/>
  <!-- Lower-left tentacle (curves down toward robots) -->
  <path d="M 380,560 C 280,620 160,680 50,780"
    stroke="#6B0AC9" stroke-width="18" fill="none" stroke-linecap="round"
    opacity="0.7"/>
  <path d="M 380,560 C 280,620 160,680 50,780"
    stroke="#00E5CC" stroke-width="3" fill="none" stroke-linecap="round"
    opacity="0.35"/>
  <!-- Lower-right tentacle (curves down toward robots) -->
  <path d="M 520,560 C 620,620 740,680 850,780"
    stroke="#6B0AC9" stroke-width="18" fill="none" stroke-linecap="round"
    opacity="0.7"/>
  <path d="M 520,560 C 620,620 740,680 850,780"
    stroke="#00E5CC" stroke-width="3" fill="none" stroke-linecap="round"
    opacity="0.35"/>
  <!-- Side tentacles -->
  <path d="M 360,430 C 200,410 100,430 20,450"
    stroke="#6B0AC9" stroke-width="14" fill="none" stroke-linecap="round"
    opacity="0.6"/>
  <path d="M 540,430 C 700,410 800,430 880,450"
    stroke="#6B0AC9" stroke-width="14" fill="none" stroke-linecap="round"
    opacity="0.6"/>
</svg>
```

Add this CSS:

```css
.tentacles {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}
```

- [ ] **Step 2: Open in browser and verify**

Expected: Purple tentacle arms with teal edge glow extending from behind the logo into the four corners and sides. The logo should still be clearly visible on top of the tentacles.

- [ ] **Step 3: Commit**

```bash
git add backdrop-mockup.html
git commit -m "feat: add extending tentacles from logo into canvas corners"
```

---

## Task 6: Top zone — arched team name + fleur-de-lis

**Files:**
- Modify: `./backdrop-mockup.html`

- [ ] **Step 1: Add the arched team name using SVG textPath**

Replace the top zone div with:

```html
<div class="zone-top">
  <svg class="lightning" viewBox="0 0 900 180" xmlns="http://www.w3.org/2000/svg">
    <!-- Lightning (from Task 3) -->
    <polyline points="180,0 155,45 175,45 140,110 160,110 120,180"
      stroke="#FFD700" stroke-width="1.5" fill="none" opacity="0.6"/>
    <polyline points="155,45 130,80"
      stroke="#FFD700" stroke-width="1" fill="none" opacity="0.4"/>
    <polyline points="720,0 745,50 725,50 760,115 740,115 780,180"
      stroke="#FFD700" stroke-width="1.5" fill="none" opacity="0.6"/>
    <polyline points="745,50 770,85"
      stroke="#FFD700" stroke-width="1" fill="none" opacity="0.4"/>
    <polyline points="420,0 430,30 415,30 435,70"
      stroke="#E8E8FF" stroke-width="0.8" fill="none" opacity="0.3"/>
    <polyline points="480,0 470,25 485,25 460,65"
      stroke="#E8E8FF" stroke-width="0.8" fill="none" opacity="0.3"/>

    <!-- Arc path for team name -->
    <defs>
      <path id="nameArc" d="M 120,155 A 360,360 0 0,1 780,155"/>
    </defs>

    <!-- Team name text on arc -->
    <text font-family="Georgia, 'Times New Roman', serif"
          font-size="52" font-weight="bold" letter-spacing="6"
          fill="#FFD700">
      <textPath href="#nameArc" startOffset="50%" text-anchor="middle">
        ⚜ 43146K KRAKEN ⚜
      </textPath>
    </text>

    <!-- Gold text shadow effect (offset copy) -->
    <text font-family="Georgia, 'Times New Roman', serif"
          font-size="52" font-weight="bold" letter-spacing="6"
          fill="#2a005a" opacity="0.6"
          transform="translate(2,3)">
      <textPath href="#nameArc" startOffset="50%" text-anchor="middle">
        ⚜ 43146K KRAKEN ⚜
      </textPath>
    </text>
    <!-- Foreground gold text -->
    <text font-family="Georgia, 'Times New Roman', serif"
          font-size="52" font-weight="bold" letter-spacing="6"
          fill="#FFD700"
          filter="url(#goldGlow)">
      <textPath href="#nameArc" startOffset="50%" text-anchor="middle">
        ⚜ 43146K KRAKEN ⚜
      </textPath>
    </text>

    <defs>
      <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
  </svg>
</div>
```

- [ ] **Step 2: Open in browser and verify**

Expected: Gold arched text "⚜ 43146K KRAKEN ⚜" curving upward across the top zone with a subtle glow and drop shadow.

- [ ] **Step 3: Commit**

```bash
git add backdrop-mockup.html
git commit -m "feat: add arched team name with SVG textPath and gold glow"
```

---

## Task 7: Bottom zone — robots, tagline, school text

**Files:**
- Modify: `./backdrop-mockup.html`

- [ ] **Step 1: Replace the bottom zone comment with content**

Replace the bottom zone HTML comment with:

```html
<div class="zone-bottom">
  <!-- Robot silhouettes flung left and right -->
  <svg class="robots" viewBox="0 0 900 225" xmlns="http://www.w3.org/2000/svg">
    <!-- Left robot (being flung leftward) -->
    <g transform="translate(140,60) rotate(-25)">
      <rect x="-18" y="-22" width="36" height="28" rx="4"
        fill="#2a005a" stroke="#6B0AC9" stroke-width="2"/>
      <rect x="-12" y="6" width="24" height="20" rx="3"
        fill="#1a0033" stroke="#6B0AC9" stroke-width="1.5"/>
      <rect x="-20" y="8" width="8" height="14" rx="2"
        fill="#1a0033" stroke="#6B0AC9" stroke-width="1.5"/>
      <rect x="12" y="8" width="8" height="14" rx="2"
        fill="#1a0033" stroke="#6B0AC9" stroke-width="1.5"/>
      <rect x="-8" y="26" width="7" height="16" rx="2"
        fill="#1a0033" stroke="#6B0AC9" stroke-width="1.5"/>
      <rect x="1" y="26" width="7" height="16" rx="2"
        fill="#1a0033" stroke="#6B0AC9" stroke-width="1.5"/>
      <circle cx="-6" cy="-10" r="4" fill="#00E5CC" opacity="0.8"/>
      <circle cx="6" cy="-10" r="4" fill="#00E5CC" opacity="0.8"/>
    </g>
    <!-- Right robot (being flung rightward) -->
    <g transform="translate(760,60) rotate(25)">
      <rect x="-18" y="-22" width="36" height="28" rx="4"
        fill="#2a005a" stroke="#6B0AC9" stroke-width="2"/>
      <rect x="-12" y="6" width="24" height="20" rx="3"
        fill="#1a0033" stroke="#6B0AC9" stroke-width="1.5"/>
      <rect x="-20" y="8" width="8" height="14" rx="2"
        fill="#1a0033" stroke="#6B0AC9" stroke-width="1.5"/>
      <rect x="12" y="8" width="8" height="14" rx="2"
        fill="#1a0033" stroke="#6B0AC9" stroke-width="1.5"/>
      <rect x="-8" y="26" width="7" height="16" rx="2"
        fill="#1a0033" stroke="#6B0AC9" stroke-width="1.5"/>
      <rect x="1" y="26" width="7" height="16" rx="2"
        fill="#1a0033" stroke="#6B0AC9" stroke-width="1.5"/>
      <circle cx="-6" cy="-10" r="4" fill="#00E5CC" opacity="0.8"/>
      <circle cx="6" cy="-10" r="4" fill="#00E5CC" opacity="0.8"/>
    </g>
    <!-- Motion lines for left robot -->
    <line x1="180" y1="55" x2="240" y2="62" stroke="#6B0AC9" stroke-width="1.5" opacity="0.5"/>
    <line x1="178" y1="65" x2="238" y2="68" stroke="#6B0AC9" stroke-width="1" opacity="0.4"/>
    <!-- Motion lines for right robot -->
    <line x1="720" y1="55" x2="660" y2="62" stroke="#6B0AC9" stroke-width="1.5" opacity="0.5"/>
    <line x1="722" y1="65" x2="662" y2="68" stroke="#6B0AC9" stroke-width="1" opacity="0.4"/>
  </svg>

  <!-- Tagline -->
  <div class="tagline">
    <div class="tagline-line1">THEY SAID PUSHBACK.</div>
    <div class="tagline-line2">THE KRAKEN SAID NO.</div>
  </div>

  <!-- School / city credit -->
  <div class="school-text">BARBE HIGH SCHOOL &nbsp;·&nbsp; LAKE CHARLES, LA</div>
</div>
```

Add this CSS:

```css
/* ── BOTTOM ZONE ── */
.zone-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 56px;
  z-index: 3;
}

.robots {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.tagline {
  text-align: center;
  line-height: 1.1;
  margin-bottom: 10px;
}

.tagline-line1 {
  font-family: Georgia, serif;
  font-size: 22px;
  font-weight: bold;
  letter-spacing: 3px;
  color: #FFD700;
  text-transform: uppercase;
  text-shadow: 0 0 12px rgba(255,215,0,0.5), 2px 2px 4px #080010;
}

.tagline-line2 {
  font-family: Georgia, serif;
  font-size: 34px;
  font-weight: bold;
  letter-spacing: 4px;
  color: #FFD700;
  text-transform: uppercase;
  text-shadow:
    0 0 20px rgba(0, 229, 204, 0.7),
    0 0 40px rgba(0, 229, 204, 0.3),
    2px 2px 6px #080010;
}

.school-text {
  font-family: Georgia, serif;
  font-size: 13px;
  letter-spacing: 4px;
  color: #FFD700;
  text-transform: uppercase;
  opacity: 0.85;
  text-shadow: 1px 1px 3px #080010;
}
```

- [ ] **Step 2: Open in browser and verify**

Expected: Two small purple robot silhouettes at tilt angles in the bottom zone with motion lines, followed by the two-line tagline (line 2 noticeably larger with teal glow), and school credit text at the bottom.

- [ ] **Step 3: Commit**

```bash
git add backdrop-mockup.html
git commit -m "feat: add bottom zone — robots, tagline, school text"
```

---

## Task 8: Mardi Gras border frame + VEX logo

**Files:**
- Modify: `./backdrop-mockup.html`

- [ ] **Step 1: Add the ornate border frame and VEX logo**

Add this HTML as the last child of `.canvas` (after the zones):

```html
<!-- MARDI GRAS BORDER FRAME -->
<div class="border-frame">
  <!-- SVG scroll-work border -->
  <svg class="border-svg" viewBox="0 0 900 900" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Bead pattern -->
      <pattern id="beads-h" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
        <circle cx="6"  cy="12" r="5" fill="#FFD700" opacity="0.9"/>
        <circle cx="18" cy="12" r="5" fill="#00E5CC" opacity="0.9"/>
      </pattern>
      <pattern id="beads-v" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
        <circle cx="12" cy="6"  r="5" fill="#00A550" opacity="0.9"/>
        <circle cx="12" cy="18" r="5" fill="#FFD700" opacity="0.9"/>
      </pattern>
    </defs>

    <!-- Outer border lines -->
    <rect x="2" y="2" width="896" height="896" rx="4"
      fill="none" stroke="#FFD700" stroke-width="3" opacity="0.8"/>
    <rect x="8" y="8" width="884" height="884" rx="3"
      fill="none" stroke="#6B0AC9" stroke-width="2" opacity="0.6"/>

    <!-- Bead strands — top -->
    <rect x="48" y="14" width="804" height="12" fill="url(#beads-h)" rx="6" opacity="0.85"/>
    <!-- Bead strands — bottom -->
    <rect x="48" y="874" width="804" height="12" fill="url(#beads-h)" rx="6" opacity="0.85"/>
    <!-- Bead strands — left -->
    <rect x="14" y="48" width="12" height="804" fill="url(#beads-v)" rx="6" opacity="0.85"/>
    <!-- Bead strands — right -->
    <rect x="874" y="48" width="12" height="804" fill="url(#beads-v)" rx="6" opacity="0.85"/>

    <!-- Corner masks (Mardi Gras mask emoji approximation via text) -->
    <text x="16" y="44"  font-size="28" text-anchor="middle" fill="#FFD700">🎭</text>
    <text x="884" y="44" font-size="28" text-anchor="middle" fill="#FFD700">🎭</text>
    <text x="16" y="892" font-size="28" text-anchor="middle" fill="#FFD700">🎭</text>
    <text x="884" y="892" font-size="28" text-anchor="middle" fill="#FFD700">🎭</text>

    <!-- Scroll-work flourishes — top center -->
    <path d="M 390,28 Q 420,8 450,18 Q 480,8 510,28"
      fill="none" stroke="#FFD700" stroke-width="2" opacity="0.7"/>
    <path d="M 405,24 Q 420,14 435,22 Q 450,14 465,24"
      fill="none" stroke="#FFD700" stroke-width="1.5" opacity="0.5"/>

    <!-- Scroll-work flourishes — bottom center -->
    <path d="M 390,872 Q 420,892 450,882 Q 480,892 510,872"
      fill="none" stroke="#FFD700" stroke-width="2" opacity="0.7"/>

    <!-- Inner border gold line -->
    <rect x="44" y="44" width="812" height="812" rx="2"
      fill="none" stroke="#FFD700" stroke-width="1" opacity="0.4"/>
  </svg>

  <!-- VEX logo — bottom right inside border -->
  <img class="vex-logo" src="VEX Worlds Logo copy.png" alt="VEX Robotics">
</div>
```

Add this CSS:

```css
/* ── BORDER FRAME ── */
.border-frame {
  position: absolute;
  inset: 0;
  z-index: 10;
  pointer-events: none;
}

.border-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.vex-logo {
  position: absolute;
  bottom: 18px;
  right: 18px;
  width: 90px;
  height: auto;
  opacity: 0.85;
  filter: drop-shadow(0 0 6px rgba(0,0,0,0.8));
  pointer-events: none;
}
```

- [ ] **Step 2: Open in browser and verify**

Expected: Gold/teal bead strands run along all four edges, gold mask emojis at corners, scroll-work flourishes at top and bottom centers, double-line gold/purple frame, and the VEX Robotics logo in the bottom-right corner.

- [ ] **Step 3: Commit**

```bash
git add backdrop-mockup.html
git commit -m "feat: add Mardi Gras border frame with beads, masks, scroll-work, and VEX logo"
```

---

## Task 9: Polish — wave blend, z-index cleanup, preview label

**Files:**
- Modify: `./backdrop-mockup.html`

- [ ] **Step 1: Add wave blend at the logo base and a preview banner**

Add this CSS to the `<style>` block:

```css
/* ── WAVE BLEND from logo base ── */
.zone-center::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 35%;
  background: linear-gradient(180deg,
    transparent 0%,
    rgba(0, 10, 40, 0.55) 50%,
    rgba(4, 0, 20, 0.85) 100%
  );
  z-index: 4;
  pointer-events: none;
}

/* ── PREVIEW LABEL (outside canvas) ── */
.preview-label {
  color: #666;
  font-family: monospace;
  font-size: 13px;
  text-align: center;
  margin-top: 16px;
  letter-spacing: 2px;
}
```

Add this HTML after the `.canvas` div (outside it, before `</body>`):

```html
<p class="preview-label">43146K KRAKEN — BOOTH BACKDROP MOCKUP — 900×900px preview (final output: 3000×3000px PNG)</p>
```

- [ ] **Step 2: Final browser review — check all elements**

Open `backdrop-mockup.html` and verify all of the following are visible:
- Deep purple-black ocean background with storm clouds
- Gold lightning veins top-left and top-right
- Arched gold "⚜ 43146K KRAKEN ⚜" text across the top
- Kraken pirate-octopus hero logo centered with teal glow halo
- Purple tentacles with teal edge extending to all four corners
- Wave blend blending logo base into ocean
- Two robot silhouettes in the bottom zone, tilted and with motion lines
- "THEY SAID PUSHBACK." (smaller) + "THE KRAKEN SAID NO." (larger, teal glow)
- "BARBE HIGH SCHOOL · LAKE CHARLES, LA" in small gold caps
- Gold bead strands on all four edges
- Mask emojis at corners
- VEX Robotics logo bottom-right
- Preview label below canvas

- [ ] **Step 3: Commit**

```bash
git add backdrop-mockup.html
git commit -m "feat: polish wave blend and add preview label — mockup complete"
```

---

## Task 10: AI image generation prompt

**Files:**
- Create: `./ai-prompt.md`

- [ ] **Step 1: Create the AI prompt file**

Create `ai-prompt.md` with the following content:

```markdown
# 43146K KRAKEN — AI Image Generation Prompts

Use these prompts to generate the final production-quality backdrop image.
The HTML mockup (`backdrop-mockup.html`) shows the target layout — use it as
a composition reference when inpainting or compositing the logo on top.

---

## Midjourney Prompt (paste into /imagine)

```
cinematic movie poster, dark deep-sea background, giant purple Kraken octopus
with pirate tricorn hat emerging from violent ocean surface, eight massive tentacles
radiating outward toward all corners of frame, bioluminescent teal glow along
tentacle edges, two glowing red eyes, deep purple and jet black ocean depths,
Mardi Gras parade float baroque ornate gold border frame with purple scroll-work
and bead strands, gold metallic arched title text at top, two small robot
silhouettes being flung by tentacles in lower corners, dramatic rim lighting from
below in teal, Louisiana Mardi Gras palette: purple gold green teal,
square composition 1:1, ultra detailed, dramatic lighting, 8k --ar 1:1 --style raw
--stylize 750 --v 6.1
```

---

## Adobe Firefly / DALL-E Prompt

```
A square cinematic movie poster design for a robotics competition team called
"43146K KRAKEN" from Lake Charles, Louisiana. The background is deep void purple
and jet black ocean depths. At the center, a large purple pirate octopus mascot
(wearing a tricorn pirate hat) emerges dramatically from a churning ocean surface,
tentacles extending toward all four corners of the image with bioluminescent teal
glowing edges. The octopus has menacing red glowing eyes. In the lower portion,
two tiny VEX robotics competition robots are being flung outward by the tentacles.
The entire image is framed by an ornate Mardi Gras parade float border of gold and
purple baroque scroll-work with embedded Mardi Gras beads in teal, green, and gold.
Gold metallic arched text "43146K KRAKEN" curves across the top. At the bottom,
gold text reads "THEY SAID PUSHBACK. THE KRAKEN SAID NO." Color palette:
#1A0033, #6B0AC9, #FFD700, #00A550, #00E5CC, #CC0000. 3000x3000 pixels, RGB.
```

---

## Post-Generation Compositing Steps

After generating the background image with either tool above:

1. Open the generated image in Photoshop / Canva / GIMP
2. Place `Kraken 43146K Logo.png` centered at ~60% canvas width
3. Set layer blend mode to **Multiply** or **Normal** with background erased (PNG transparency)
4. Add outer glow: teal (`#00E5CC`), spread 20px, size 80px
5. Place `VEX Worlds Logo copy.png` bottom-right, inside the border, at ~8% canvas width
6. Export as PNG, RGB, 3000×3000px minimum
7. Test projection at full scale before the event
```

- [ ] **Step 2: Open and review the prompt file**

Open `ai-prompt.md` and verify both prompts are complete, the compositing steps reference the correct filenames (`Kraken 43146K Logo.png`, `VEX Worlds Logo copy.png`), and no placeholders remain.

- [ ] **Step 3: Commit**

```bash
git add ai-prompt.md
git commit -m "feat: add Midjourney and Firefly AI generation prompts with compositing steps"
```

---

## Self-Review Checklist

### Spec coverage

| Spec requirement | Covered by task |
|---|---|
| 8×8 ft square canvas | Task 1 (900×900px preview note), Task 10 (3000px output) |
| Static PNG output | Task 10 (compositing step 6) |
| Three-zone layout | Tasks 1–8 |
| Top zone: storm sky, lightning, arched team name, fleur-de-lis | Tasks 2, 3, 6 |
| Center zone: hero logo, teal glow, tentacles to corners, waves | Tasks 4, 5, 9 |
| Bottom zone: robots flung, tagline, school text | Task 7 |
| Mardi Gras border: scroll-work, beads, masks, VEX logo | Task 8 |
| Color palette all 8 colors | Task 1 (CSS variables used throughout) |
| Typography: arched gold team name, two-line tagline, school credit | Tasks 6, 7 |
| Source assets: both PNGs embedded | Tasks 4, 8 |
| AI generation prompt | Task 10 |
| RGB color space | Task 10 |

All spec requirements are covered. No gaps found.
