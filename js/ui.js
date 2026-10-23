/**
 * ui.js
 * User interface controller: HUD stats, inventory slots, dialogue popups, toast notifications,
 * camera tracking, and game over / victory screens.
 */

/**
 * Updates the 6-slot inventory UI with collected keys and items
 */
function updateInventoryUI() {
  const keySlots = [
    { key: 'bronze', emoji: '🗝', col: '#cd7f32' },
    { key: 'silver', emoji: '🔑', col: '#c0c0c0' },
    { key: 'gold', emoji: '🗝', col: '#ffd700' },
    { key: 'master_key', emoji: '🔐', col: '#e8c080' },
  ];

  // First 4 slots reserved for keys
  keySlots.forEach((k, i) => {
    const slot = document.getElementById(`is${i}`);
    if (slot && G.keys.includes(k.key)) {
      slot.textContent = k.emoji;
      slot.classList.add('has');
      slot.style.borderColor = k.col;
      slot.innerHTML = `${k.emoji}<div class="itip">${k.key.toUpperCase()} KEY</div>`;
    }
  });

  // Remaining slots for pickup tools / items
  let si = 4;
  G.inventory.forEach(item => {
    if (si >= 6) return;
    const slot = document.getElementById(`is${si}`);
    if (slot) {
      slot.textContent = item.emoji;
      slot.classList.add('has');
      slot.innerHTML = `${item.emoji}<div class="itip">${item.label}</div>`;
    }
    si++;
  });
}

/**
 * Centers camera on the player clamped to map boundaries
 */
function updateCamera() {
  const mapPxW = MAP_W * T;
  const mapPxH = MAP_H * T;
  const tx = player.x - GW / 2;
  const ty = player.y - GH / 2;
  G.cam.x = Math.max(0, Math.min(mapPxW - GW, tx));
  G.cam.y = Math.max(0, Math.min(mapPxH - GH, ty));
}

/**
 * Triggers screenshake
 * @param {number} i Intensity
 * @param {number} t Duration (ticks)
 */
function shakeScreen(i, t) {
  G.shake.i = i;
  G.shake.t = t;
}

/**
 * Flashes red warning overlay
 */
function flashAlert() {
  const el = document.getElementById('alert');
  if (!el) return;
  el.style.background = 'rgba(139,0,0,0.5)';
  setTimeout(() => (el.style.background = 'rgba(139,0,0,0)'), 300);
}

let popTO = null;

/**
 * Shows narrative dialogue popup
 */
function showPopup(who, body, dur = 4000) {
  const pwho = document.getElementById('pwho');
  const pbody = document.getElementById('pbody');
  const p = document.getElementById('popup');
  if (!p || !pwho || !pbody) return;

  pwho.textContent = who;
  pbody.textContent = body;
  p.classList.add('on');

  clearTimeout(popTO);
  popTO = setTimeout(() => p.classList.remove('on'), dur);
}

let toastTO = null;

/**
 * Shows temporary toast notification banner
 */
function toast(txt) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = txt;
  el.className = '';
  void el.offsetWidth; // Force CSS reflow
  el.classList.add('on');

  clearTimeout(toastTO);
  toastTO = setTimeout(() => el.classList.remove('on'), 2600);
}

/**
 * Triggers Victory / Escape screen
 */
function triggerWin() {
  G.phase = 'win';
  G.escaped = true;
  const m = Math.floor(G.tick / 3600);
  const s = Math.floor(G.tick / 60) % 60;

  const endIcon = document.getElementById('endIcon');
  const endH = document.getElementById('endH');
  const endP = document.getElementById('endP');
  const endStats = document.getElementById('endStats');
  const end = document.getElementById('end');

  if (endIcon) endIcon.textContent = '🏃';
  if (endH) {
    endH.textContent = 'YOU ESCAPED!';
    endH.style.color = '#60cc60';
    endH.style.textShadow = '0 0 40px rgba(0,200,0,0.7)';
  }
  if (endP) {
    endP.textContent =
      "You burst out the front door.\nThe cold night air hits you.\nYou run. You don't look back.\nBehind you — a scream from inside the house.";
    endP.style.color = '#5a7a5a';
  }
  if (end) {
    end.style.background = 'radial-gradient(ellipse,#040c04,#000)';
    end.classList.add('on');
  }
  if (endStats) {
    endStats.textContent = `Day ${G.day} · Time: ${m}m ${s}s · HP: ${G.hp}%`;
    endStats.style.color = '#2a4a2a';
  }

  tone(160, 4, 0.08);
  tone(200, 4, 0.06);
}

/**
 * Triggers Game Over / Captured screen
 */
function triggerDeath() {
  G.phase = 'dead';

  const endIcon = document.getElementById('endIcon');
  const endH = document.getElementById('endH');
  const endP = document.getElementById('endP');
  const endStats = document.getElementById('endStats');
  const end = document.getElementById('end');

  if (endIcon) endIcon.textContent = '💀';
  if (endH) {
    endH.textContent = 'SHE GOT YOU';
    endH.style.color = '#cc2020';
    endH.style.textShadow = '0 0 40px rgba(200,0,0,0.7)';
  }
  if (endP) {
    endP.textContent =
      'Five days passed.\nYou never found a way out.\nGranny smiles.\n\n"Welcome to the family, dear."';
    endP.style.color = '#5a2a2a';
  }
  if (end) {
    end.style.background = 'radial-gradient(ellipse,#0c0202,#000)';
    end.classList.add('on');
  }
  if (endStats) {
    endStats.textContent = `Keys found: ${G.keysFound}/4`;
    endStats.style.color = '#3a1a1a';
  }

  noise(2, 0.2);
  tone(25, 5, 0.18);
}
