# Tell Me Everything — notes for AI coding agents

Landing page for a podcast interviewing 100 people in Silicon Valley, one polaroid per episode.
Plain static site: no framework, no build step, no dependencies. Open `index.html` through any static server.

## Run
```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Files
- `index.html` — markup: title, tagline, join button, wall, camera (inline SVG), sign-up dialog.
- `styles.css` — all styling. Design tokens are in `:root` (fonts `--type` Special Elite / `--mono` Space Mono, ink, frame blues, card size).
- `main.js` — the sequence: handwrite title → type tagline → camera rises → shoot → print ejects → flies onto the wall → carousel. Also wheel/drag/arrow navigation and the sign-up form. `SIGNUP_ENDPOINT` at the top sets where sign-ups are POSTed.
- `cards.js` — the episode list (`plan`) and placeholder poems. Add an episode: put a square-ish photo in `img/` and add `{ img: 'img/ep-002.jpg', frame: 'blue' | 'pale' }`. The first entry is the one the camera prints.
- `sound.js` — camera sounds synthesized with the Web Audio API (no audio files).
- `img/` — `wall.jpg` (paper texture from the Figma file), episode and placeholder photos.
- `tools/bundle.py` — inlines CSS/JS into one file for previews (e.g. a claude.ai artifact). Not needed for normal hosting.

## Conventions
- Keep it dependency-free and fast; animations should stay smooth and subtle.
- Visual source of truth: Figma file "tell-me-everything" (title frame 12:37, polaroid banner 12:13).
- Don't put two similar photos (e.g. two ocean shots) next to each other in `plan`.
- Respect `prefers-reduced-motion`.
