# Tell Me Everything — design guide

Read this before changing anything visual. It records the design decisions made with the show's host and the reasons behind them, so the site keeps one consistent feel as it grows from 1 episode to 100.

## The idea in one line

**A paper wall that slowly fills with polaroids, one per conversation.** Each episode is a photo stuck to the wall. Over time the wall becomes the archive of the show.

The show interviews 100 people in Silicon Valley. The tone is the opposite of a pitch deck: honest, unpolished, warm, a little nostalgic. One of the quotes on the wall says it best: *"let it be unpolished and messy and true."* If a change makes the site feel more like a startup landing page (gradients, glassy cards, bold sans-serif headlines, feature grids, stock icons), it is going the wrong way.

## Source of truth

- Figma file **"tell-me-everything"** (owner: raindong77). Frame `12:37` is the title on the paper wall; frame `12:13` is the polaroid banner (frame colors, layout feel); `16:2` is episode 001's photo.
- When this guide and the Figma file disagree, ask the host. When the host's latest message disagrees with either, the host wins.

## Look

### Wall
- Real cold-press paper texture (`img/wall.jpg`, cut from the Figma frame and mirrored into a seamless tile). Off-white `--wall: #f6f3ee`.
- Only a whisper of vignette. No gradients, no colored backgrounds, no patterns.

### Type
| Role | Font | Use |
|---|---|---|
| Title + polaroid quotes + buttons + form text | **Special Elite** (`--type`) | Distressed typewriter. The voice of the site. |
| Small labels, tagline | **Space Mono** (`--mono`) | Uppercase, letter-spaced ~0.12–0.14em, small (11–14px). Quiet and technical, like a label maker. |

- Ink color `--ink: #2e2e2e` (soft black, never pure `#000`).
- The title is **"Tell me / everything"** on two lines, sentence case. Don't change the words or casing.
- Lowercase is the default for quotes on polaroids ("go create a life / you can't wait / to wake up to").
- No other fonts. No bold weights.

### Color
- Neutrals: paper `#f6f3ee`, ink `#2e2e2e`, note paper `#fbfaf7`.
- Accent: **blue only**, taken from the polaroid frames: `--frame-blue: #2d86c9` (saturated) and `--frame-pale: #a9d1e2` (pale). The camera is a light sky blue to match.
- Photos supply all other color. Don't add new accent hues (no orange CTAs, no purple).

### Polaroids
- Classic Polaroid 600 proportions: card `88 × 107`, square photo, thin sides, deep bottom "chin" (`--card-h = --card-w × 107/88`).
- Two frame styles, alternated: `blue` and `pale`, both with a faint printed grain.
- Each card has a small strip of translucent washi tape on top. They are *stuck to the wall*.
- Every card sits at its own slight tilt (±6.5°) and vertical offset (±16px). Never line them up perfectly.
- No captions or episode numbers on the cards for now (the Figma reference has none).
- Quote cards: lined notepaper inside the photo area, typewriter text, 3–4 short lowercase lines.

### Camera
- An original instant camera drawn in inline SVG (Instax-mini-like shape: big lens, flash panel, viewfinder, top print slot). Light blue.
- **No brand names or logos** on it (no "Fujifilm", no "instax").

## Motion

Everything should feel **smooth, subtle and physical**: paper, gravity, a hand pressing a photo to a wall. Nothing bouncy, nothing flashy, no spinning, no confetti.

- Easing tokens: `--ease-out: cubic-bezier(.16,1,.3,1)` for things arriving/settling; `--ease-soft: cubic-bezier(.4,.1,.2,1)` for things moving across the screen.
- Typical durations: hovers 0.5–0.9s; layout moves 1.4–1.6s; nothing under 0.3s except the shutter press.

### The opening sequence (keep this order)
1. **Title is handwritten** letter by letter: outline drawn first, then ink fills in. The pen pauses between words and lines. The host specifically wants it *handwritten out*, not typed or faded.
2. **Tagline types out** beneath it in Space Mono, with a blinking block caret that disappears afterwards.
3. **Camera rises from the bottom** (from below, never dropping from the top).
4. **Hint appears**: pulsing rings on the shutter button plus a small tapping hand. No text like "click here".
5. **Click → shutter + flash → print ejects from the top slot**, starts dark and develops over ~3–4s.
6. **The print flies onto the wall**, the rest of the polaroids are pressed on around it nearest-first, and the wall starts drifting **right to left** in an endless loop.
7. The "Be a guest / nominate someone" button fades in only after the wall is up, so it never competes with the camera moment.

### The wall
- Auto-drifts slowly (~34px/s), right to left, looping seamlessly.
- **Hover a polaroid**: it straightens to 0°, lifts slightly, scales ~1.06, shadow deepens; the whole wall slows to ~12% speed while someone looks.
- Visitors can move it themselves: scroll wheel/trackpad (either axis), drag/swipe with momentum, arrow keys (one card per press). Movement glides; it never jumps.

### Sound
- Realistic instant-camera sounds, synthesized in `sound.js`: shutter, flash recharge whine, eject motor with gear teeth and film friction, a soft tap when a print lands. Keep sounds real and quiet. No UI beeps or music.

### Accessibility
- Respect `prefers-reduced-motion` (skip the writing animation, stop the auto-drift).
- Keyboard: camera is a real `<button>`; the form is a native `<dialog>`; visible dashed focus outlines.

## Content rules

- **Episode 001 (Mandy) is always first**: it's the print the camera produces.
- Photos are the host's own (`img/ph-*.jpg`). Crop square, keep faces in frame.
- **Don't put similar photos next to each other** (for example the two ocean shots). Alternate photos and quote cards.
- Copy is plain and warm. Short sentences. No hype words ("revolutionary", "unlock", "supercharge"), no emoji.
- Current quotes on the wall (host-approved):
  - "go create a life you can't wait to wake up to"
  - "let it be unpolished and messy and true"
  - "i feel like i can go higher, farther, stronger, and happier"
  - "tell me the part you left out"
- Tagline: "100 people in Silicon Valley. The stories behind the titles."

## Adding an episode

1. Square-crop the guest photo (~640px), save as `img/ep-0NN.jpg`.
2. Add `{ img: 'img/ep-0NN.jpg', frame: 'blue' | 'pale' }` to `plan` in `cards.js`, alternating frame styles and keeping similar photos apart.
3. As real episodes replace them, the placeholder photos and quotes can be retired, but keep a few quote cards for rhythm.

## Don'ts (quick list)

- No new fonts, bold weights, or accent colors.
- No gradients, glassmorphism, rounded "SaaS" cards, or drop-shadow-heavy UI.
- No brand logos on the camera.
- No text instructions where a visual hint works.
- No perfectly aligned grids of polaroids.
- No autoplaying sound (browsers block it anyway; sound starts on the first click).
- Don't add a framework or build step for its own sake. It's a static site on purpose.
