// Placeholder polaroids. One per episode, eventually 100.
// Replace an entry's `art` with { img: 'photos/ep-002.jpg' } once a guest is recorded.

function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const svg = (id, defs, body) =>
  `<svg viewBox="0 0 46 62" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>${defs}<filter id="${id}-b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.4"/></filter></defs>${body}</svg>`;

const lin = (id, stops, x2 = 0, y2 = 1) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops
    .map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`)
    .join('')}</linearGradient>`;

// ------------------------------------------------------------------ scenes
const scenes = {
  portrait(id) {
    return svg(id,
      lin(`${id}-g`, [[0, '#9fc9e8'], [1, '#e4f1fa']]) +
      `<radialGradient id="${id}-l" cx=".3" cy=".25" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`,
      `<rect width="46" height="62" fill="url(#${id}-g)"/>
       <rect width="46" height="62" fill="url(#${id}-l)"/>
       <circle cx="23" cy="25" r="8.6" fill="#1f3f66"/>
       <path d="M6 62 C7 44 15 38.5 23 38.5 S39 44 40 62 Z" fill="#1f3f66"/>
       <path d="M17 36 Q23 40 29 36 L28 39.5 Q23 42 18 39.5Z" fill="#2c5384"/>`);
  },

  sky(id, r) {
    let clouds = '';
    for (let i = 0; i < 4; i++) {
      const x = 4 + r() * 38, y = 12 + r() * 40, s = 0.7 + r() * 0.9;
      clouds += `<g filter="url(#${id}-b)" opacity="${0.75 + r() * 0.25}" transform="translate(${x} ${y}) scale(${s})">
        <ellipse cx="0" cy="0" rx="9" ry="3.6" fill="#fff"/><ellipse cx="-3" cy="-2.6" rx="5" ry="3.8" fill="#fff"/><ellipse cx="3.5" cy="-2" rx="4.2" ry="3.2" fill="#fff"/></g>`;
    }
    return svg(id, lin(`${id}-g`, [[0, '#3c7fc0'], [0.65, '#9ccbec'], [1, '#e4f2fb']]),
      `<rect width="46" height="62" fill="url(#${id}-g)"/>${clouds}`);
  },

  sea(id, r) {
    let glints = '';
    for (let i = 0; i < 14; i++) {
      const y = 40 + r() * 20, w = 1 + r() * 4 * (1 - (y - 40) / 30);
      glints += `<rect x="${23 - w / 2 + (r() - 0.5) * 8 * ((y - 38) / 10)}" y="${y.toFixed(2)}" width="${w.toFixed(2)}" height=".45" fill="#eaf5fc" opacity="${0.4 + r() * 0.5}"/>`;
    }
    return svg(id,
      lin(`${id}-s`, [[0, '#7fb4e2'], [1, '#e6f2fa']]) + lin(`${id}-w`, [[0, '#2b6198'], [1, '#12355c']]),
      `<rect width="46" height="40" fill="url(#${id}-s)"/>
       <circle cx="23" cy="36" r="6" fill="#fdf7e8" filter="url(#${id}-b)" opacity=".85"/>
       <circle cx="23" cy="36" r="4.2" fill="#fffdf6"/>
       <rect y="39" width="46" height="23" fill="url(#${id}-w)"/>${glints}`);
  },

  moon(id, r) {
    let stars = '';
    for (let i = 0; i < 40; i++) stars += `<circle cx="${(r() * 46).toFixed(1)}" cy="${(r() * 62).toFixed(1)}" r="${(0.15 + r() * 0.35).toFixed(2)}" fill="#eaf4fb" opacity="${0.3 + r() * 0.7}"/>`;
    return svg(id, lin(`${id}-g`, [[0, '#0b1f3a'], [1, '#24548a']]),
      `<rect width="46" height="62" fill="url(#${id}-g)"/>${stars}
       <circle cx="30" cy="18" r="9" fill="#dcecf8" filter="url(#${id}-b)" opacity=".5"/>
       <circle cx="30" cy="18" r="6" fill="#eef6fc"/>
       <circle cx="32.5" cy="16.5" r="5.6" fill="#163a66"/>
       <path d="M0 54 Q12 49 22 53 T46 51 V62 H0Z" fill="#0b1c33"/>`);
  },

  mountains(id, r) {
    const ridge = (base, amp, fill) => {
      let d = `M0 62 L0 ${base}`;
      for (let x = 0; x <= 46; x += 4) d += ` L${x} ${(base - r() * amp).toFixed(1)}`;
      return `<path d="${d} L46 62Z" fill="${fill}"/>`;
    };
    return svg(id, lin(`${id}-g`, [[0, '#d9ebf8'], [1, '#a7cdea']]),
      `<rect width="46" height="62" fill="url(#${id}-g)"/>
       <circle cx="14" cy="20" r="4.5" fill="#f7fbfe"/>
       ${ridge(36, 12, '#8fb8dc')}${ridge(44, 10, '#5d8fbf')}${ridge(52, 8, '#2f5f92')}${ridge(58, 4, '#1b3e66')}`);
  },

  bridge(id) {
    return svg(id,
      lin(`${id}-g`, [[0, '#bcd5e8'], [1, '#eaf2f8']]) + lin(`${id}-f`, [[0, '#fff'], [0.5, '#fff'], [1, '#fff']], 1, 0),
      `<rect width="46" height="62" fill="url(#${id}-g)"/>
       <rect x="10" y="14" width="2.4" height="34" fill="#2b4f75"/><rect x="33.6" y="14" width="2.4" height="34" fill="#2b4f75"/>
       <rect x="9.4" y="20" width="3.6" height=".9" fill="#2b4f75"/><rect x="33" y="20" width="3.6" height=".9" fill="#2b4f75"/>
       <path d="M-6 38 Q11 14 11.2 14 Q23 34 34.8 14 Q35 14 52 38" fill="none" stroke="#2b4f75" stroke-width=".55"/>
       <rect y="38" width="46" height="1.3" fill="#2b4f75"/>
       <rect y="44" width="46" height="18" fill="#6e93b5"/>
       <rect y="26" width="46" height="22" fill="#f4f8fb" opacity=".55" filter="url(#${id}-b)"/>`);
  },

  bokeh(id, r) {
    let dots = '';
    const cols = ['#7fb6e0', '#cfe6f5', '#3b7fb8', '#a9d3ef', '#f3e9d2'];
    for (let i = 0; i < 18; i++) dots += `<circle cx="${(r() * 46).toFixed(1)}" cy="${(r() * 62).toFixed(1)}" r="${(2 + r() * 6).toFixed(1)}" fill="${cols[(r() * cols.length) | 0]}" opacity="${(0.2 + r() * 0.5).toFixed(2)}" filter="url(#${id}-b)"/>`;
    return svg(id, lin(`${id}-g`, [[0, '#0f2b49'], [1, '#1d4a78']]),
      `<rect width="46" height="62" fill="url(#${id}-g)"/>${dots}`);
  },

  palms(id) {
    const palm = (x, h, lean) => {
      const top = [x + lean, 62 - h];
      let fronds = '';
      for (let a = -150; a <= -30; a += 24) {
        const rad = (a * Math.PI) / 180, L = 7 + Math.random() * 2;
        const ex = top[0] + Math.cos(rad) * L, ey = top[1] + Math.sin(rad) * L * 0.6 + 3;
        fronds += `<path d="M${top[0]} ${top[1]} Q${(top[0] + ex) / 2} ${top[1] - 2.5} ${ex.toFixed(1)} ${ey.toFixed(1)}" stroke="#0e2340" stroke-width="1.1" fill="none" stroke-linecap="round"/>`;
      }
      return `<path d="M${x} 62 Q${x + lean * 0.2} ${62 - h / 2} ${top[0]} ${top[1]}" stroke="#0e2340" stroke-width="1.1" fill="none"/>${fronds}`;
    };
    return svg(id, lin(`${id}-g`, [[0, '#1b3f6b'], [0.55, '#6fa3d4'], [1, '#e2eff8']]),
      `<rect width="46" height="62" fill="url(#${id}-g)"/>
       <circle cx="23" cy="50" r="7" fill="#f6f1e2" opacity=".9"/>
       ${palm(12, 34, -3)}${palm(33, 42, 4)}${palm(38, 26, 2)}
       <rect y="58" width="46" height="4" fill="#0e2340"/>`);
  },

  coffee(id) {
    return svg(id,
      lin(`${id}-t`, [[0, '#d7e8f4'], [1, '#bcd6ea']]) +
      `<radialGradient id="${id}-c" cx=".45" cy=".45" r=".6"><stop offset="0" stop-color="#9a6b4c"/><stop offset="1" stop-color="#5b3a26"/></radialGradient>`,
      `<rect width="46" height="62" fill="url(#${id}-t)"/>
       <path d="M0 10 L46 18 M0 30 L46 38 M0 50 L46 58" stroke="#a9c7de" stroke-width=".4"/>
       <ellipse cx="24" cy="34" rx="16" ry="16" fill="#1f3f66" opacity=".18" filter="url(#${id}-b)"/>
       <circle cx="23" cy="32" r="15" fill="#f6fafd"/>
       <circle cx="23" cy="32" r="10.5" fill="#3d77ad"/>
       <circle cx="23" cy="32" r="9" fill="url(#${id}-c)"/>
       <path d="M23 36.5 C18 32 19 27.5 23 30 C27 27.5 28 32 23 36.5Z" fill="#f3e6d6" opacity=".9"/>
       <path d="M36 28 q6 4 0 8" stroke="#3d77ad" stroke-width="2.2" fill="none" stroke-linecap="round"/>`);
  },

  window(id) {
    return svg(id, lin(`${id}-g`, [[0, '#b7d3e9'], [1, '#dbeaf5']], 1, 1),
      `<rect width="46" height="62" fill="url(#${id}-g)"/>
       <g opacity=".75" filter="url(#${id}-b)">
         <path d="M8 6 L22 6 L30 40 L16 40Z" fill="#f7fbfe"/>
         <path d="M25 6 L39 6 L47 40 L33 40Z" fill="#f7fbfe"/>
       </g>
       <path d="M10 62 Q12 48 14 44 M14 44 q-6 -3 -8 -9 M14 44 q4 -6 10 -7 M13 50 q-5 -1 -8 -5" stroke="#5a86b0" stroke-width="1" fill="none" stroke-linecap="round" opacity=".7"/>
       <rect y="54" width="46" height="8" fill="#9dbfdb"/>`);
  },
};

// ------------------------------------------------------------------ poems (placeholders)
const poems = [
  ['tell me', 'the part', 'you left out'],
  ['a hundred strangers,', 'one question,', 'many coffees'],
  ['who were you', 'before', 'the pitch deck?'],
  ['every face', 'a door', 'left ajar'],
  ['the light on', 'university ave', 'at five pm'],
  ['say it slowly.', 'we have', 'all afternoon'],
];

// ------------------------------------------------------------------ the wall
const FRAMES = ['#cfe6f3', '#b8dbef', '#deeef8', '#a9d2ec', '#c4e1f2', '#e6f2f9'];

const plan = [
  ['portrait', 1], ['sky', 2], ['poem', 0], ['sea', 3], ['mountains', 4], ['poem', 1],
  ['moon', 5], ['bridge', 6], ['poem', 2], ['bokeh', 7], ['palms', 8], ['poem', 3],
  ['coffee', 9], ['window', 10], ['poem', 4], ['sky', 11], ['sea', 12], ['poem', 5],
];

export function episodes() {
  const r = rng(20261106);
  return plan.map(([kind, seed], i) => ({
    no: i + 1,
    kind,
    seed,
    frame: FRAMES[i % FRAMES.length],
    tilt: +((r() * 2 - 1) * 6.5).toFixed(2) || 2,
    y: +((r() * 2 - 1) * 16).toFixed(1),
    tape: +((r() * 2 - 1) * 7).toFixed(1),
  }));
}

let uid = 0;
export function cardHTML(ep, { undeveloped = false } = {}) {
  const id = `a${uid++}`;
  const inner = ep.kind === 'poem'
    ? `<div class="poem">${poems[ep.seed].map((l) => `<span>${l}</span>`).join('')}</div>`
    : scenes[ep.kind](id, rng(ep.seed * 7919));
  const label = `no. ${String(ep.no).padStart(3, '0')}`;
  return `<div class="card${undeveloped ? ' undeveloped' : ''}" style="--frame:${ep.frame};--tape:${ep.tape}deg">
    <div class="tape"></div>
    <div class="photo">${inner}<div class="develop"></div></div>
    <div class="caption">${label}</div>
  </div>`;
}
