// Placeholder polaroids. One per episode, eventually 100.
// Add a guest: put their photo in img/ and add { img: 'img/ep-002.jpg', frame: 'blue' } to `plan`.

function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ------------------------------------------------------------------ poems (placeholders)
const poems = [
  ['tell me', 'the part', 'you left out'],
  ['who were you', 'before', 'the pitch deck?'],
  ['a hundred', 'strangers,', 'one question'],
  ['say it slowly.', 'we have', 'all afternoon'],
];

// ------------------------------------------------------------------ the wall
// One polaroid per episode. no. 001 is the first guest; the rest are placeholders
// (photos from the Figma moodboard and short poems) until more episodes are recorded.
const plan = [
  { img: 'img/ep-001.jpg', frame: 'blue' },
  { img: 'img/p-sky.jpg', frame: 'pale' },
  { poem: 0, frame: 'blue' },
  { img: 'img/p-cake.jpg', frame: 'blue' },
  { img: 'img/p-flowers.jpg', frame: 'pale' },
  { poem: 1, frame: 'pale' },
  { img: 'img/p-berries.jpg', frame: 'blue' },
  { img: 'img/p-beach.jpg', frame: 'pale' },
  { poem: 2, frame: 'blue' },
  { img: 'img/p-friends.jpg', frame: 'blue' },
  { poem: 3, frame: 'pale' },
];

export function episodes() {
  const r = rng(20261106);
  return plan.map((p, i) => ({
    ...p,
    no: i + 1,
    tilt: +((r() * 2 - 1) * 6.5).toFixed(2) || 2,
    y: +((r() * 2 - 1) * 16).toFixed(1),
    tape: +((r() * 2 - 1) * 7).toFixed(1),
  }));
}

export function cardHTML(ep, { undeveloped = false } = {}) {
  const inner = ep.poem !== undefined
    ? `<div class="poem">${poems[ep.poem].map((l) => `<span>${l}</span>`).join('')}</div>`
    : `<img src="${ep.img}" alt="" draggable="false" />`;
  return `<div class="card${undeveloped ? ' undeveloped' : ''}" style="--frame:var(--frame-${ep.frame});--tape:${ep.tape}deg">
    <div class="tape"></div>
    <div class="photo">${inner}<div class="develop"></div></div>
  </div>`;
}
