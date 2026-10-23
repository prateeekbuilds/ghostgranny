/**
 * game.js
 * Main Game Loop, Day/Night progression cycles, Canvas Render Pipeline, and Game Lifecycle Initialization.
 */

let lastAtmos = 0;

/**
 * Core 60FPS Game Loop
 */
function gameLoop() {
  if (G.phase !== 'game') {
    requestAnimationFrame(gameLoop);
    return;
  }
  G.tick++;

  // ── Day Progression (2 minutes per in-game day) ──
  G.dayTick++;
  if (G.dayTick > 3600 * 2) {
    G.dayTick = 0;
    G.day = Math.min(5, G.day + 1);
    const dayBadge = document.getElementById('dayBadge');
    if (dayBadge) dayBadge.textContent = `DAY ${G.day}`;

    if (G.day > 5) {
      triggerDeath();
      return;
    }
    toast(`⚠ Day ${G.day} — Granny grows more alert.`);
    tone(30, 2, 0.12);
  }

  // ── Entity & Physics Updates ──
  updatePlayer();
  updateCamera();
  updateGranny(G.tick);
  updateP();
  checkNearItems();
  footstep();

  // ── Procedural Horror Atmosphere ──
  if (G.tick - lastAtmos > 280 && Math.random() < 0.005) {
    lastAtmos = G.tick;
    showPopup('NARRATOR', ATMOS[Math.floor(Math.random() * ATMOS.length)], 2500);
  }

  // ── Canvas Rendering Pipeline ──
  ctx.clearRect(0, 0, GW, GH);

  // Screenshake offset calculation
  let sx2 = 0, sy2 = 0;
  if (G.shake.t > 0) {
    G.shake.t--;
    const si = G.shake.i * (G.shake.t / 25);
    sx2 = (Math.random() - 0.5) * si;
    sy2 = (Math.random() - 0.5) * si;
    ctx.save();
    ctx.translate(sx2, sy2);
  }

  const camX = G.cam.x;
  const camY = G.cam.y;

  // Base darkness
  ctx.fillStyle = '#0a0805';
  ctx.fillRect(-10, -10, GW + 20, GH + 20);

  // World and Items
  drawMap(camX, camY, G.tick);
  drawItems(camX, camY, G.tick);

  // Granny sprite
  const gsx = granny.x - camX;
  const gsy = granny.y - camY;
  if (gsx > -60 && gsx < GW + 60 && gsy > -60 && gsy < GH + 60) {
    drawGranny(gsx, gsy, granny.facing, granny.walk, granny.wf, granny.state, G.tick);
  }

  // Granny Sound / Hearing Detection Aura
  if (granny.state === 'alert' || granny.state === 'chase') {
    const auraAlpha = granny.state === 'chase' ? 0.12 : 0.06;
    const aura = ctx.createRadialGradient(gsx, gsy, 30, gsx, gsy, granny.hearingRange);
    aura.addColorStop(0, `rgba(139,0,0,${auraAlpha})`);
    aura.addColorStop(1, 'rgba(139,0,0,0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(gsx, gsy, granny.hearingRange, 0, Math.PI * 2);
    ctx.fill();
  }

  // Player sprite
  const psx = player.x - camX;
  const psy = player.y - camY;
  drawPlayer(
    psx,
    psy,
    player.facing,
    player.walk,
    player.wf,
    granny.state === 'chase',
    G.isHiding
  );

  // Particles
  drawP(camX, camY);

  if (G.shake.t > 0 || sx2 !== 0) {
    ctx.restore();
  }

  // Limited Flashlight / Darkness Effect
  const light = ctx.createRadialGradient(psx, psy, 60, psx, psy, 340);
  light.addColorStop(0, 'rgba(0,0,0,0)');
  light.addColorStop(0.5, 'rgba(0,0,0,0.25)');
  light.addColorStop(1, 'rgba(0,0,0,0.85)');
  ctx.fillStyle = light;
  ctx.fillRect(0, 0, GW, GH);

  // Fear & Sanity Vignette
  if (G.sanity < 70) {
    const fd = (70 - G.sanity) / 70;
    const fLight = ctx.createRadialGradient(psx, psy, 40, psx, psy, 220 - fd * 80);
    fLight.addColorStop(0, 'rgba(0,0,0,0)');
    fLight.addColorStop(1, `rgba(0,0,0,${fd * 0.4})`);
    ctx.fillStyle = fLight;
    ctx.fillRect(0, 0, GW, GH);
  }

  // Minimap & HUD portrait
  drawHudFace();
  drawMinimap();

  requestAnimationFrame(gameLoop);
}

/**
 * Initializes and starts a new game session
 */
function startGame() {
  G.phase = 'game';
  G.tick = 0;
  G.day = 1;
  G.dayTick = 0;
  G.hp = 100;
  G.sanity = 100;
  G.keys = [];
  G.inventory = [];
  G.itemsDone = {};
  G.keysFound = 0;
  G.exitUnlocked = false;
  G.isHiding = false;
  G.hiddenAt = null;

  player.x = 2.5 * T;
  player.y = 3 * T;
  granny.x = 15 * T;
  granny.y = 2 * T;
  granny.tx = 15 * T;
  granny.ty = 2 * T;
  granny.state = 'patrol';
  granny.wt = 200;

  // Reset door states
  Object.keys(DOOR_KEYS).forEach(k => {
    doorState[k] = { locked: true, key: DOOR_KEYS[k] };
  });
  doorState['5,2'].locked = false;
  doorState['9,2'].locked = false;

  updateCamera();
  startAmb();
  tone(35, 6, 0.05);

  setTimeout(() => {
    showPopup(
      'NARRATOR',
      "You wake up in a cold room.\nYou don't know how you got here.\n\nThe door is locked from the outside.\nYou can hear someone humming downstairs.\n\nFind the 4 keys. Reach the front door.\nDon't let GRANNY find you.\n\n[ WASD = Move · E = Interact · Q = Hide ]",
      9000
    );
  }, 800);

  gameLoop();
}

// ── Lifecycle Bootstrap ──
window.addEventListener('DOMContentLoaded', () => {
  initCanvas();

  const startBtn = document.getElementById('startBtn');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      try {
        ac();
      } catch (e) {}
      const t = document.getElementById('title');
      if (t) {
        t.classList.add('out');
        setTimeout(() => (t.style.display = 'none'), 1600);
      }
      startGame();
    });
  }

  // Start background loop
  gameLoop();
});
