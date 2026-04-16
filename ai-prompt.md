> **Note:** The primary booth deliverable is now `backdrop-final.html` — an animated, GPU-rendered HTML projection. The prompts below remain available for derivative print and social-media artwork. See `docs/superpowers/specs/2026-04-16-kraken-backdrop-animated-design.md`.

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
