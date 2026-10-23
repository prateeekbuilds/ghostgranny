/**
 * input.js
 * Keyboard controller and player movement handler.
 * Controls: WASD / Arrow keys for 8-direction movement, E for interaction, Q for hiding, ESC for dialog dismissal.
 */

const KEYS = {};

window.addEventListener('keydown', e => {
  KEYS[e.key] = true;

  // Interaction Key (E)
  if ((e.key === 'e' || e.key === 'E') && G.phase === 'game') {
    if (G.isHiding) {
      unhide();
    } else {
      doInteract();
    }
  }

  // Hide Key (Q)
  if ((e.key === 'q' || e.key === 'Q') && G.phase === 'game') {
    if (G.isHiding) {
      unhide();
    } else if (nearItem && HIDE_SPOTS.includes(nearItem.id)) {
      doInteract();
    } else {
      // Auto-target nearest hiding spot within radius
      const bestH = ITEMS.filter(i => HIDE_SPOTS.includes(i.id)).sort((a, b) => {
        const pa = itemPos(a), pb = itemPos(b);
        const da = (player.x - pa.wx) ** 2 + (player.y - pa.wy) ** 2;
        const db = (player.x - pb.wx) ** 2 + (player.y - pb.wy) ** 2;
        return da - db;
      })[0];

      if (bestH) {
        const p = itemPos(bestH);
        const d = Math.sqrt((player.x - p.wx) ** 2 + (player.y - p.wy) ** 2);
        if (d < 80) {
          nearItem = bestH;
          doInteract();
        } else {
          toast('Too far from a hiding spot!');
        }
      }
    }
  }

  // Dismiss popup (Escape)
  if (e.key === 'Escape') {
    const popup = document.getElementById('popup');
    if (popup) popup.classList.remove('on');
  }
});

window.addEventListener('keyup', e => {
  KEYS[e.key] = false;
});

/**
 * Updates player velocity, direction, collision, animation frames, and noise generation
 */
function updatePlayer() {
  if (G.isHiding) {
    player.walk = false;
    return;
  }

  let dx = 0, dy = 0;
  if (KEYS['w'] || KEYS['W'] || KEYS['ArrowUp']) {
    dy = -1;
    player.facing = 'up';
  }
  if (KEYS['s'] || KEYS['S'] || KEYS['ArrowDown']) {
    dy = 1;
    player.facing = 'down';
  }
  if (KEYS['a'] || KEYS['A'] || KEYS['ArrowLeft']) {
    dx = -1;
    player.facing = 'left';
  }
  if (KEYS['d'] || KEYS['D'] || KEYS['ArrowRight']) {
    dx = 1;
    player.facing = 'right';
  }

  // Diagonal velocity normalization
  if (dx && dy) {
    dx *= 0.707;
    dy *= 0.707;
  }

  if (dx || dy) {
    const spd = player.spd;
    const nx = player.x + dx * spd;
    const ny = player.y + dy * spd;

    // Axis-independent collision resolution allows sliding along walls
    if (canWalk(nx, player.y)) player.x = nx;
    if (canWalk(player.x, ny)) player.y = ny;

    player.walk = true;
    player.wt++;
    if (player.wt > 7) {
      player.wt = 0;
      player.wf++;
    }

    // Alert Granny if moving within her acoustic threshold
    const gd = Math.sqrt((player.x - granny.x) ** 2 + (player.y - granny.y) ** 2);
    if (gd < granny.hearingRange + 40 && granny.state === 'patrol') {
      granny.state = 'alert';
      granny.alertTimer = 60;
      granny.tx = player.x;
      granny.ty = player.y;
    }
  } else {
    player.walk = false;
    player.wf = 0;
  }
}
