/**
 * state.js
 * Centralized state management for Game, Player, Granny, Doors, and Particle physics.
 */

// Door state registry (key: 'row,col')
const doorState = {};
Object.keys(DOOR_KEYS).forEach(k => {
  doorState[k] = { locked: true, key: DOOR_KEYS[k] };
});
// Initial unlocked starting doors
doorState['5,2'].locked = false;
doorState['9,2'].locked = false;

// Global Game State
const G = {
  phase: 'title',   // 'title' | 'game' | 'win' | 'dead'
  tick: 0,
  day: 1,
  dayTick: 0,
  hp: 100,
  sanity: 100,
  keys: [],         // Array of collected key identifiers
  inventory: [],    // Collected inventory items
  itemsDone: {},    // Registry of collected/triggered items
  hiddenAt: null,   // Current hiding spot item ID
  isHiding: false,
  keysFound: 0,
  exitUnlocked: false,
  cam: { x: 0, y: 0 },
  shake: { t: 0, i: 0 },
  grannySees: false,
  grannyCooldown: 0,
  escaped: false,
};

// Player Entity State
const player = {
  x: 2.5 * T,
  y: 3 * T,
  spd: 2.8,
  facing: 'down',
  walk: false,
  wf: 0,
  wt: 0,
};

// Granny Entity State
const granny = {
  x: 15 * T,
  y: 2 * T,
  tx: 15 * T,
  ty: 2 * T,
  spd: 1.2,
  baseSpd: 1.2,
  state: 'patrol',  // 'patrol' | 'alert' | 'chase' | 'search' | 'sleep'
  wt: 0,
  facing: 'down',
  wf: 0,
  wft: 0,
  hearingRange: 180,
  visionRange: 120,
  angered: 0,       // Consecutive catches
  sleeping: false,
  alertTimer: 0,
  searchTimer: 0,
  lastHeard: null,
  path: [],
};

// Particle System State
let particles = [];

/**
 * Spawns burst particles at a specific canvas coordinate
 */
function spawnP(x, y, col, n = 8) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = 1 + Math.random() * 3;
    particles.push({
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      life: 1,
      col,
      r: 2 + Math.random() * 3,
    });
  }
}

/**
 * Updates physics for all active particles
 */
function updateP() {
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.9;
    p.vy *= 0.9;
    p.life -= 0.03;
  });
  particles = particles.filter(p => p.life > 0);
}

/**
 * Draws particles relative to camera offset
 */
function drawP(camX, camY) {
  particles.forEach(p => {
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.col;
    ctx.beginPath();
    ctx.arc(p.x - camX, p.y - camY, p.r * p.life, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

/**
 * Checks whether an entity with radius r can walk to world position (wx, wy)
 */
function canWalk(wx, wy, r = 14) {
  const corners = [
    [wx - r, wy - r], [wx + r, wy - r],
    [wx - r, wy + r], [wx + r, wy + r],
    [wx, wy - r],     [wx, wy + r],
    [wx - r, wy],     [wx + r, wy],
  ];
  for (const [cx, cy] of corners) {
    const tx = Math.floor(cx / T), ty = Math.floor(cy / T);
    const tile = tileAt(tx, ty);
    if (tile === 1 || tile === 3) return false;
    if (tile === 2) {
      const dk = doorState[`${ty},${tx}`];
      if (dk && dk.locked) return false;
    }
  }
  return true;
}

/**
 * Checks whether Granny with radius r can walk to world position (wx, wy)
 */
function canGrannyWalk(wx, wy, r = 16) {
  const corners = [
    [wx - r, wy - r], [wx + r, wy - r],
    [wx - r, wy + r], [wx + r, wy + r],
  ];
  for (const [cx, cy] of corners) {
    const tx = Math.floor(cx / T), ty = Math.floor(cy / T);
    const tile = tileAt(tx, ty);
    if (tile === 1 || tile === 3) return false;
    if (tile === 2) {
      const dk = doorState[`${ty},${tx}`];
      if (dk && dk.locked && dk.key === 'gold') return false;
    }
  }
  return true;
}
