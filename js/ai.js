/**
 * ai.js
 * Granny AI Finite State Machine (FSM): Hearing, Vision, Patrol, Search, Chase, and Capture mechanics.
 */

/**
 * Updates Granny's state machine, sensory perception, and navigation
 */
function updateGranny(tick) {
  if (G.isHiding) {
    granny.state = 'patrol';
    return;
  }

  const pdx = player.x - granny.x;
  const pdy = player.y - granny.y;
  const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
  const playerMoving = player.walk;

  // Hearing: running and footstep sounds expand Granny's detection radius
  const hearDist = granny.hearingRange + (playerMoving ? 60 : 0);
  const seeDist = granny.visionRange;

  const hears = pdist < hearDist && playerMoving;
  const sees = pdist < seeDist;

  // Difficulty scaling: Granny gets faster and more alert with each passing day
  granny.spd = granny.baseSpd + (G.day - 1) * 0.15;

  // FSM State transitions
  switch (granny.state) {
    case 'patrol':
      // Wander around house rooms
      granny.wt--;
      if (granny.wt <= 0) {
        granny.wt = 120 + Math.random() * 180;
        // Select random walkable destination
        for (let i = 0; i < 20; i++) {
          const rx = (1 + Math.floor(Math.random() * (MAP_W - 2))) * T + T / 2;
          const ry = (1 + Math.floor(Math.random() * (MAP_H - 2))) * T + T / 2;
          if (canGrannyWalk(rx, ry, 16)) {
            granny.tx = rx;
            granny.ty = ry;
            break;
          }
        }
      }
      moveGranny(granny.tx, granny.ty, granny.spd * 0.7, tick);
      if (hears || sees) {
        granny.state = 'alert';
        granny.alertTimer = 90;
        document.getElementById('grannySense').style.display = 'block';
      }
      break;

    case 'alert':
      granny.alertTimer--;
      granny.tx = player.x;
      granny.ty = player.y;
      moveGranny(granny.tx, granny.ty, granny.spd * 0.9, tick);
      if (sees || hears) {
        granny.state = 'chase';
      }
      if (granny.alertTimer <= 0 && !hears && !sees) {
        granny.state = 'search';
        granny.searchTimer = 200;
      }
      break;

    case 'chase':
      granny.tx = player.x;
      granny.ty = player.y;
      moveGranny(granny.tx, granny.ty, granny.spd, tick);
      document.getElementById('grannySense').style.display = 'block';
      document.getElementById('fearTint').style.background = `rgba(80,0,0,${Math.min(
        0.35,
        pdist < 100 ? 0.35 : (200 - pdist) / 600
      )})`;

      if (!hears && !sees) {
        granny.state = 'search';
        granny.searchTimer = 300;
      }

      // Proximity capture check
      if (pdist < 36) {
        grannyCapture();
      }
      break;

    case 'search':
      granny.searchTimer--;
      if (granny.searchTimer <= 0) {
        granny.state = 'patrol';
        document.getElementById('grannySense').style.display = 'none';
        document.getElementById('fearTint').style.background = 'rgba(0,0,0,0)';
      }
      moveGranny(granny.tx, granny.ty, granny.spd * 0.8, tick);
      if (hears || sees) {
        granny.state = 'chase';
      }
      break;

    case 'sleep':
      document.getElementById('grannySense').style.display = 'none';
      break;
  }

  // Animation cycle
  granny.wft++;
  if (granny.wft > 10) {
    granny.wft = 0;
    granny.wf++;
  }

  // Sprite orientation
  const dx = granny.tx - granny.x;
  const dy = granny.ty - granny.y;
  if (Math.abs(dx) > Math.abs(dy)) {
    granny.facing = dx > 0 ? 'right' : 'left';
  } else {
    granny.facing = dy > 0 ? 'down' : 'up';
  }
}

/**
 * Moves Granny towards coordinate (tx, ty) while respecting walls and doorways
 */
function moveGranny(tx, ty, spd, tick) {
  const dx = tx - granny.x;
  const dy = ty - granny.y;
  const d = Math.sqrt(dx * dx + dy * dy);
  if (d < 10) {
    granny.walk = false;
    return;
  }
  granny.walk = true;
  const nx = granny.x + (dx / d) * spd;
  const ny = granny.y + (dy / d) * spd;
  if (canGrannyWalk(nx, granny.y, 16)) granny.x = nx;
  if (canGrannyWalk(granny.x, ny, 16)) granny.y = ny;
}

/**
 * Handles Granny catching the player: damage, day progression, and jumpscare
 */
function grannyCapture() {
  G.hp = Math.max(0, G.hp - 35);
  G.day = Math.min(5, G.day + 1);
  G.sanity = Math.max(0, G.sanity - 20);

  const hpBar = document.getElementById('hpBar');
  const stBar = document.getElementById('stBar');
  const dayBadge = document.getElementById('dayBadge');

  if (hpBar) hpBar.style.width = G.hp + '%';
  if (stBar) stBar.style.width = G.sanity + '%';
  if (dayBadge) dayBadge.textContent = `DAY ${G.day}`;

  // Reset positions
  player.x = 2.5 * T;
  player.y = 3 * T;
  granny.x = 15 * T;
  granny.y = 2 * T;
  granny.state = 'patrol';

  document.getElementById('grannySense').style.display = 'none';
  document.getElementById('fearTint').style.background = 'rgba(0,0,0,0)';

  grannyGrowl();
  shakeScreen(14, 40);
  flashAlert();

  showPopup(
    'GRANNY',
    'GRANNY: "I TOLD YOU TO STAY IN YOUR ROOM!"\n\nShe drags you back. You black out.\nWhen you come to, a day has passed.\nYou\'re back in the bedroom.\nYou have less time now.',
    5000
  );

  if (G.hp <= 0 || G.day > 5) {
    setTimeout(triggerDeath, 2000);
  }
}
