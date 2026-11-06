# Tell Me Everything

Landing page for **Tell Me Everything**, a podcast interviewing 100 people in Silicon Valley. One polaroid per episode.

## What happens
1. The title writes itself onto a plaster wall.
2. A light-blue instant camera rises from the bottom; a tapping hand points at the shutter.
3. Click the camera: shutter, flash, motor whir, and a print ejects from the top slot and develops.
4. The print flies onto the wall and the other polaroids get taped up around it, then they all drift right to left in an endless loop. Hover a polaroid and it straightens up; the wall slows down while you look.

## Files
- `index.html`: markup and the camera (inline SVG)
- `styles.css`: the wall texture (coded with SVG noise and lighting), polaroids, motion
- `main.js`: title writing, the shooting sequence, and the carousel
- `sound.js`: camera sounds synthesized live with the Web Audio API (no audio files)
- `cards.js`: the episode list. Swap in real photos as guests are recorded.

## Run locally
No build step. Serve the folder:

```bash
python3 -m http.server 8000
```

## Customize
- **Font**: change `--hand` in `styles.css` and the Google Fonts `<link>` in `index.html` (currently Caveat).
- **Episodes**: edit `plan` in `cards.js`.
