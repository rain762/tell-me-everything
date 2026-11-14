import { CameraSound } from './sound.js';
import { episodes, cardHTML } from './cards.js';

const NS = 'http://www.w3.org/2000/svg';
const LINES = ['Tell me', 'everything'];
const TAGLINE = '100 people in Silicon Valley. The stories behind the titles.';

// Where sign-ups go on the live site. Paste a form endpoint here (for example a
// Formspree or Basin URL); it receives the form as JSON. Left empty, the page saves
// sign-ups to the artifact's database when it runs as a claude.ai artifact.
const SIGNUP_ENDPOINT = '';
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

const body = document.body;
const camera = document.getElementById('camera');
const print = document.getElementById('print');
const flashEl = document.getElementById('flash');
const flashGlow = document.getElementById('flash-glow');
const track = document.getElementById('track');
const sound = new CameraSound();
const eps = episodes();

const wait = (ms) => new Promise((r) => setTimeout(r, reduced ? Math.min(ms, 60) : ms));
let state = 'intro';

// ------------------------------------------------------------------ 1. handwrite the title
async function writeTitle() {
  const svg = document.getElementById('title-svg');
  try { await document.fonts.load('100px "Special Elite"'); } catch {}

  // lay out both lines centred, then split into letters that get written one by one
  const LEAD = 104;
  const measures = LINES.map((line, n) => {
    const t = document.createElementNS(NS, 'text');
    t.setAttribute('x', '0');
    t.setAttribute('y', String(100 + n * LEAD));
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('class', 'measure');
    t.textContent = line;
    svg.appendChild(t);
    return t;
  });
  const boxes = measures.map((t) => t.getBBox());
  const x0 = Math.min(...boxes.map((b) => b.x));
  const x1 = Math.max(...boxes.map((b) => b.x + b.width));
  const y0 = boxes[0].y;
  const y1 = boxes[boxes.length - 1].y + boxes[boxes.length - 1].height;
  const pad = 14;
  svg.setAttribute('viewBox', `${x0 - pad} ${y0 - pad} ${x1 - x0 + pad * 2} ${y1 - y0 + pad * 2}`);

  const STEP = 0.1;
  let k = 0;
  measures.forEach((m, n) => {
    const line = LINES[n];
    for (let i = 0; i < line.length; i++) {
      if (line[i] === ' ') { k += 2; continue; } // the pen lifts between words
      const p = m.getStartPositionOfChar(i);
      const t = document.createElementNS(NS, 'text');
      t.setAttribute('x', p.x);
      t.setAttribute('y', p.y);
      t.setAttribute('class', 'letter');
      t.style.setProperty('--d', `${(0.35 + k * STEP).toFixed(3)}s`);
      t.textContent = line[i];
      svg.appendChild(t);
      k++;
    }
    k += 2.5; // and moves down to the next line
  });
  measures.forEach((m) => m.remove());
  await wait((0.35 + k * STEP + 0.6) * 1000);
}

// ------------------------------------------------------------------ 2. camera rises, hint appears
async function presentCamera() {
  print.innerHTML = cardHTML(eps[0], { undeveloped: true });
  body.classList.replace('stage-intro', 'stage-ready');
  state = 'ready';
  await wait(1500);
  if (state === 'ready') body.classList.add('show-hint');
}

// ------------------------------------------------------------------ 3. shoot + print
function flash() {
  flashEl.animate(
    [{ opacity: 0 }, { opacity: 0.92, offset: 0.06 }, { opacity: 0 }],
    { duration: 820, easing: 'cubic-bezier(.2,.7,.3,1)' }
  );
  flashGlow.animate([{ opacity: 0 }, { opacity: 1, offset: 0.05 }, { opacity: 0 }], { duration: 600 });
}

function press() {
  camera.classList.add('press');
  setTimeout(() => camera.classList.remove('press'), 160);
}

async function shoot() {
  if (state === 'wall') { // the camera stays playful afterwards
    press(); sound.shutter(); sound.flash();
    setTimeout(flash, 40);
    return;
  }
  if (state !== 'ready') return;
  state = 'shooting';
  body.classList.remove('show-hint');
  body.classList.add('stage-shot');

  press();
  sound.shutter();
  sound.flash();
  setTimeout(flash, 40);
  buildWall(); // lay out the wall now, invisibly, so we know where the print will land

  await wait(420);
  sound.eject(1.55);
  print.classList.add('ejecting');
  await wait(1600);

  print.querySelector('.card').classList.add('developing');
  await wait(650);
  await flyToWall();
}

// ------------------------------------------------------------------ 4. the wall carousel
const carousel = {
  pending: 0,
  x: 0, speed: 0, target: 0, base: 34, W: 0, last: 0, running: false, slots: [],
};

function buildWall() {
  const vw = window.innerWidth;
  const one = eps.map((ep, i) =>
    `<div class="slot pending" data-i="${i}" style="--tilt:${ep.tilt}deg;--y:${ep.y}px">${cardHTML(ep)}</div>`
  ).join('');

  track.innerHTML = one + one;
  carousel.W = track.children[eps.length].offsetLeft - track.children[0].offsetLeft;
  const copies = Math.max(2, Math.ceil(vw / carousel.W) + 1);
  track.innerHTML = one.repeat(copies);
  carousel.slots = [...track.children];

  // put episode 001 at the centre of the screen
  const s0 = carousel.slots[0];
  const x0 = vw / 2 - (s0.offsetLeft + s0.offsetWidth / 2);
  carousel.x = x0 - Math.ceil(x0 / carousel.W) * carousel.W;
  applyX();
}

function applyX() {
  track.style.transform = `translate3d(${carousel.x.toFixed(2)}px,0,0)`;
}

function centreSlot() {
  const vw = window.innerWidth;
  let best = null, dist = Infinity;
  for (const s of carousel.slots) {
    if (s.dataset.i !== '0') continue;
    const d = Math.abs(s.offsetLeft + carousel.x + s.offsetWidth / 2 - vw / 2);
    if (d < dist) { dist = d; best = s; }
  }
  return best;
}

function tick(ts) {
  const dt = Math.min(0.05, (ts - (carousel.last || ts)) / 1000);
  carousel.last = ts;
  carousel.speed += (carousel.target - carousel.speed) * Math.min(1, dt * 2.2);
  // scroll / swipe / arrow keys queue up a distance that glides out smoothly
  const glide = carousel.pending * Math.min(1, dt * 7);
  carousel.pending -= glide;
  carousel.x -= carousel.speed * dt + glide;
  while (carousel.x <= -carousel.W) carousel.x += carousel.W;
  while (carousel.x > 0) carousel.x -= carousel.W;
  applyX();
  requestAnimationFrame(tick);
}

function startCarousel() {
  if (carousel.running) return;
  carousel.running = true;
  carousel.target = reduced ? 0 : carousel.base;
  requestAnimationFrame(tick);
}

// ease the whole wall down when someone is looking at a polaroid
track.addEventListener('pointerover', (e) => {
  if (e.target.closest('.slot')) carousel.target = carousel.base * 0.12;
});
track.addEventListener('pointerleave', () => {
  carousel.target = reduced ? 0 : carousel.base;
});

// ------------------------------------------------------------------ navigate the wall yourself
const MAX_QUEUE = () => window.innerWidth * 1.5;
function nudge(px) {
  if (state !== 'wall') return;
  carousel.pending = Math.max(-MAX_QUEUE(), Math.min(MAX_QUEUE(), carousel.pending + px));
}

// mouse wheel and trackpad: either scroll direction moves the wall sideways
const formOpen = () => document.getElementById('signup').open;
addEventListener('wheel', (e) => {
  if (state !== 'wall' || formOpen()) return;
  e.preventDefault();
  const unit = e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? window.innerWidth : 1;
  const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
  nudge(d * unit * 1.1);
}, { passive: false });

// arrow keys step one polaroid at a time
addEventListener('keydown', (e) => {
  if (state !== 'wall' || formOpen() || e.target.closest('input, textarea, button')) return;
  const step = carousel.slots[0] ? carousel.slots[1].offsetLeft - carousel.slots[0].offsetLeft : 250;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { nudge(step); e.preventDefault(); }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { nudge(-step); e.preventDefault(); }
});

// drag or swipe the wall, with a little momentum when you let go
const wallEl = document.getElementById('wall');
let drag = null;
wallEl.addEventListener('pointerdown', (e) => {
  if (state !== 'wall') return;
  drag = { x: e.clientX, t: performance.now(), v: 0, moved: 0 };
  carousel.pending = 0;
  wallEl.setPointerCapture(e.pointerId);
});
wallEl.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const now = performance.now();
  const dx = e.clientX - drag.x;
  carousel.x += dx;
  drag.v = dx / Math.max(1, now - drag.t); // px per ms
  drag.moved += Math.abs(dx);
  drag.x = e.clientX;
  drag.t = now;
  wallEl.classList.toggle('dragging', drag.moved > 4);
});
const endDrag = () => {
  if (!drag) return;
  nudge(-drag.v * 140);
  drag = null;
  wallEl.classList.remove('dragging');
};
wallEl.addEventListener('pointerup', endDrag);
wallEl.addEventListener('pointercancel', endDrag);

async function flyToWall() {
  const target = centreSlot();
  target.classList.add('hidden');
  target.classList.remove('pending');

  const card = print.querySelector('.card');
  const from = card.getBoundingClientRect();
  const to = target.getBoundingClientRect(); // slot is unrotated; tilt lives on the card
  const tilt = parseFloat(target.style.getPropertyValue('--tilt'));

  // lift the print out of the camera into a free-floating copy
  const devNow = getComputedStyle(card.querySelector('.develop')).opacity;
  const flyer = card.cloneNode(true);
  flyer.classList.add('flyer');
  const fdev = flyer.querySelector('.develop');
  fdev.style.transition = 'none';
  fdev.style.opacity = devNow;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    fdev.style.transition = 'opacity 2.6s cubic-bezier(.5,0,.3,1)';
    fdev.style.opacity = '0';
  }));
  Object.assign(flyer.style, {
    position: 'fixed', left: `${from.left}px`, top: `${from.top}px`, margin: 0, zIndex: 30,
  });
  body.appendChild(flyer);
  print.style.visibility = 'hidden';

  body.classList.remove('stage-shot');
  body.classList.add('stage-wall');
  state = 'wall';

  // the rest of the wall gets pressed on, nearest first
  const vw = window.innerWidth;
  const others = carousel.slots
    .filter((s) => s !== target)
    .map((s) => ({ s, d: Math.abs(s.getBoundingClientRect().left + s.offsetWidth / 2 - vw / 2) }))
    .filter(({ d }) => d < vw)
    .sort((a, b) => a.d - b.d);
  others.forEach(({ s }, n) => setTimeout(() => s.classList.remove('pending'), 700 + n * 90));
  carousel.slots.forEach((s) => s !== target && !others.find((o) => o.s === s) && s.classList.remove('pending'));

  const dx = to.left - from.left;
  const dy = to.top - from.top;
  const anim = flyer.animate(
    [
      { transform: 'translate(0,0) rotate(0deg) scale(1)', boxShadow: '0 2px 4px rgba(20,30,50,.15)' },
      { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 40}px) rotate(${tilt * 0.4 - 4}deg) scale(1.08)`, boxShadow: '0 40px 50px -16px rgba(20,30,50,.35)', offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) rotate(${tilt}deg) scale(1)`, boxShadow: '0 1px 1px rgba(20,30,50,.14), 0 10px 18px -8px rgba(20,30,50,.3)' },
    ],
    { duration: reduced ? 1 : 1500, easing: 'cubic-bezier(.45,.05,.2,1)', fill: 'forwards' }
  );
  await anim.finished;

  sound.stick();
  // carry the still-developing image over so the fade continues seamlessly
  const live = target.querySelector('.card');
  const dev = flyer.querySelector('.develop');
  const op = getComputedStyle(dev).opacity;
  const tdev = live.querySelector('.develop');
  tdev.style.opacity = op;
  tdev.style.transition = 'none';
  target.classList.remove('hidden');
  flyer.remove();
  requestAnimationFrame(() => {
    tdev.style.transition = 'opacity 2.2s cubic-bezier(.5,0,.3,1)';
    tdev.style.opacity = '0';
  });

  await wait(900);
  startCarousel();
}

// ------------------------------------------------------------------ sign up / nominate
const dialog = document.getElementById('signup');
const form = document.getElementById('signup-form');
const sent = document.getElementById('signup-sent');
const errorEl = document.getElementById('signup-error');

function showKind() {
  const nominate = form.kind.value === 'nominate';
  form.classList.toggle('nominate', nominate);
  form.theirName.required = nominate;
  form.theirContact.required = nominate;
}
form.addEventListener('change', (e) => { if (e.target.name === 'kind') showKind(); });

document.getElementById('join').addEventListener('click', () => {
  form.hidden = false;
  sent.hidden = true;
  errorEl.hidden = true;
  showKind();
  dialog.showModal();
  form.elements.name.focus();
});
dialog.querySelector('.close').addEventListener('click', () => dialog.close());
sent.querySelector('[data-close]').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); }); // click outside the note

async function saveSignup(entry) {
  if (SIGNUP_ENDPOINT) {
    const res = await fetch(SIGNUP_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error('endpoint');
    return;
  }
  // claude.ai artifact preview: one private row per visitor, readable only by the owner
  const [db, user] = window.claude?.use ? await Promise.all([window.claude.use('db'), window.claude.use('user')]) : [];
  const id = user ? await user.id() : null;
  if (!db || !id) throw new Error('unavailable');
  const ref = db.doc(`signups/${id}`);
  const snap = await ref.get();
  const entries = (snap.exists && Array.isArray(snap.data()?.entries)) ? snap.data().entries : [];
  await ref.set({ entries: [...entries, entry].slice(-50) });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.hidden = true;
  if (!form.checkValidity()) {
    const bad = form.querySelector(':invalid');
    errorEl.textContent = bad.type === 'email' && bad.value
      ? 'That email address looks incomplete. Check it and send again.'
      : `Fill in "${form.querySelector(`label[for="${bad.id}"]`).textContent.toLowerCase()}", then send again.`;
    errorEl.hidden = false;
    bad.focus();
    return;
  }
  const f = Object.fromEntries(new FormData(form));
  const entry = f.kind === 'nominate'
    ? { kind: 'nominate', name: f.name, email: f.email, theirName: f.theirName, theirContact: f.theirContact, why: f.why || '' }
    : { kind: 'guest', name: f.name, email: f.email, role: f.role || '', story: f.story || '' };
  entry.at = new Date().toISOString();

  const btn = form.querySelector('.send');
  btn.disabled = true;
  btn.textContent = 'Sending…';
  try {
    await saveSignup(entry);
    form.reset();
    form.hidden = true;
    sent.hidden = false;
  } catch (err) {
    errorEl.textContent = err.message === 'unavailable'
      ? 'Sign-ups are not connected on this preview yet. Your answers are still here.'
      : 'That did not go through. Check your connection and send again; your answers are still here.';
    errorEl.hidden = false;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Send';
  }
});

// ------------------------------------------------------------------ boot
camera.addEventListener('click', shoot);

addEventListener('resize', () => {
  if (state !== 'wall') return;
  const keep = carousel.x;
  buildWall();
  carousel.slots.forEach((s) => s.classList.remove('pending'));
  carousel.x = keep % carousel.W;
  applyX();
});

async function typeTagline() {
  const el = document.getElementById('tagline');
  const text = document.createElement('span');
  const caret = document.createElement('span');
  caret.className = 'caret';
  text.setAttribute('aria-hidden', 'true');
  el.append(text, caret);
  for (const ch of TAGLINE) {
    text.textContent += ch;
    await wait(ch === ' ' ? 55 : ch === '.' ? 260 : 34 + Math.random() * 30);
  }
  el.classList.add('done');
  setTimeout(() => caret.remove(), 2600);
}

(async () => {
  await writeTitle();
  typeTagline();
  await presentCamera();
})();
