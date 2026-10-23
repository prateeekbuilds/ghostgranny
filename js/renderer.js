/**
 * renderer.js
 * Canvas 2D graphics engine: procedural floor tiles, animated sprites,
 * dynamic radial torch lighting, sanity fear shaders, and minimap HUD.
 */

let gc = null;
let ctx = null;

function initCanvas() {
  gc = document.getElementById('gc');
  if (gc) {
    ctx = gc.getContext('2d');
  }
}

/**
 * Utility: Converts hex color and opacity into rgba string
 */
function hexA(h, a) {
  const r = parseInt(h.slice(1, 3), 16);
  const g = parseInt(h.slice(3, 5), 16);
  const b = parseInt(h.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

/**
 * Returns room properties corresponding to world coordinate
 */
function getRoomFloor(wx, wy) {
  const tx = Math.floor(wx / T), ty = Math.floor(wy / T);
  for (const [id, r] of Object.entries(ROOMS)) {
    if (ty >= r.rows[0] && ty <= r.rows[1] && tx >= r.cols[0] && tx <= r.cols[1]) {
      return r;
    }
  }
  return { floor: 'concrete', name: '' };
}

/**
 * Procedural floor texture painter
 */
function drawFloorTile(sx, sy, type, tx, ty, tick) {
  switch (type) {
    case 'wood_worn': {
      const s = 0.82 + 0.12 * (tx % 2 === ty % 2 ? 1 : 0);
      ctx.fillStyle = `rgb(${Math.floor(105 * s)},${Math.floor(68 * s)},${Math.floor(38 * s)})`;
      ctx.fillRect(sx, sy, T, T);
      ctx.strokeStyle = 'rgba(60,35,15,0.18)';
      ctx.lineWidth = 1;
      for (let g = 0; g < T; g += 14) {
        ctx.beginPath();
        ctx.moveTo(sx + g, sy);
        ctx.lineTo(sx + g, sy + T);
        ctx.stroke();
      }
      break;
    }
    case 'carpet_green': {
      ctx.fillStyle = `rgb(${30 + ((tx + ty) % 3) * 4},${55 + ((tx * ty) % 4) * 3},${30 + (tx % 3) * 2})`;
      ctx.fillRect(sx, sy, T, T);
      ctx.strokeStyle = 'rgba(20,40,20,0.2)';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(sx, sy, T, T);
      break;
    }
    case 'carpet_red': {
      const n = Math.sin(tx * 3.1 + ty * 2.7) * 0.08;
      ctx.fillStyle = `rgb(${Math.floor(70 + n * 20)},${Math.floor(20 + n * 5)},${Math.floor(20 + n * 5)})`;
      ctx.fillRect(sx, sy, T, T);
      if ((tx + ty) % 4 === 0) {
        ctx.fillStyle = 'rgba(100,30,30,0.3)';
        ctx.fillRect(sx + 4, sy + 4, T - 8, T - 8);
      }
      break;
    }
    case 'carpet_old': {
      ctx.fillStyle = `rgb(${60 + ((tx + ty) % 3) * 5},${48 + (tx % 4) * 3},${30 + (ty % 3) * 4})`;
      ctx.fillRect(sx, sy, T, T);
      ctx.strokeStyle = 'rgba(40,28,15,0.2)';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(sx, sy, T, T);
      break;
    }
    case 'tile': {
      const alt = (tx + ty) % 2 === 0;
      ctx.fillStyle = alt ? 'rgb(60,55,48)' : 'rgb(52,47,40)';
      ctx.fillRect(sx, sy, T, T);
      ctx.strokeStyle = 'rgba(30,25,18,0.4)';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(sx, sy, T, T);
      break;
    }
    case 'tile_kitchen': {
      const alt = (tx + ty) % 2 === 0;
      ctx.fillStyle = alt ? 'rgb(72,65,55)' : 'rgb(58,52,44)';
      ctx.fillRect(sx, sy, T, T);
      ctx.strokeStyle = 'rgba(40,32,22,0.5)';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(sx, sy, T, T);
      break;
    }
    case 'tile_bath': {
      const alt = (tx + ty) % 2 === 0;
      ctx.fillStyle = alt ? 'rgb(62,68,72)' : 'rgb(52,58,62)';
      ctx.fillRect(sx, sy, T, T);
      ctx.strokeStyle = 'rgba(30,35,40,0.4)';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(sx, sy, T, T);
      break;
    }
    case 'concrete': {
      const n = Math.sin(tx * 5.3 + ty * 7.1) * 0.1;
      ctx.fillStyle = `rgb(${Math.floor(38 + n * 15)},${Math.floor(34 + n * 12)},${Math.floor(28 + n * 10)})`;
      ctx.fillRect(sx, sy, T, T);
      break;
    }
  }
}

/**
 * Draws the environment grid tiles (floors, walls, doors, windows)
 */
function drawMap(camX, camY, tick) {
  const startTX = Math.max(0, Math.floor(camX / T) - 1);
  const startTY = Math.max(0, Math.floor(camY / T) - 1);
  const endTX = Math.min(MAP_W - 1, startTX + Math.ceil(GW / T) + 2);
  const endTY = Math.min(MAP_H - 1, startTY + Math.ceil(GH / T) + 2);

  for (let ty2 = startTY; ty2 <= endTY; ty2++) {
    for (let tx2 = startTX; tx2 <= endTX; tx2++) {
      const sx = tx2 * T - camX, sy = ty2 * T - camY;
      const tile = tileAt(tx2, ty2);

      if (tile === 0) {
        // Floor tile
        const room = getRoomFloor(tx2 * T + T / 2, ty2 * T + T / 2);
        drawFloorTile(sx, sy, room.floor || 'concrete', tx2, ty2, tick);

        // Subtle ambient room label
        if (room.name && tx2 % 5 === 2 && ty2 % 4 === 1) {
          ctx.fillStyle = 'rgba(80,60,30,0.18)';
          ctx.font = '9px Special Elite';
          ctx.fillText(room.name, sx + 2, sy + 12);
        }
      } else if (tile === 1) {
        // Solid wall
        const isEdge = ty2 === 0 || ty2 === MAP_H - 1 || tx2 === 0 || tx2 === MAP_W - 1;
        const wallBase = isEdge ? 18 : 22;
        const n = Math.sin(tx2 * 4.2 + ty2 * 3.7) * 0.15;
        ctx.fillStyle = `rgb(${Math.floor(wallBase + n * 8)},${Math.floor(wallBase * 0.85 + n * 6)},${Math.floor(wallBase * 0.7 + n * 4)})`;
        ctx.fillRect(sx, sy, T, T);

        // Brick mortar lines
        const bh = 16, bw = T;
        const rowOff = ((Math.floor((ty2 * T) / bh) % 2) * bw) / 2;
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1;
        for (let by = sy; by < sy + T; by += bh) {
          ctx.beginPath();
          ctx.moveTo(sx, by);
          ctx.lineTo(sx + T, by);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(sx + (rowOff % bw), sy);
        ctx.lineTo(sx + (rowOff % bw), sy + T);
        ctx.stroke();

        // Top depth edge highlight
        ctx.fillStyle = 'rgba(60,45,30,0.4)';
        ctx.fillRect(sx, sy, T, 3);
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(sx, sy + T - 3, T, 3);
      } else if (tile === 2) {
        // Door
        const dk = doorState[`${ty2},${tx2}`];
        const room = getRoomFloor(tx2 * T + T / 2, ty2 * T + T / 2);
        drawFloorTile(sx, sy, room.floor || 'tile', tx2, ty2, tick);

        const isLocked = dk && dk.locked;
        const doorCol = isLocked ? '#2a1808' : '#3a2010';
        const frameCol = isLocked ? '#1a0a04' : '#2a1508';
        ctx.fillStyle = doorCol;
        ctx.fillRect(sx + 4, sy, T - 8, T);
        ctx.strokeStyle = frameCol;
        ctx.lineWidth = 2;
        ctx.strokeRect(sx + 4, sy, T - 8, T);

        // Door knob & keyhole
        if (!isLocked) {
          ctx.fillStyle = '#c8a040';
          ctx.beginPath();
          ctx.arc(sx + T - 12, sy + T / 2, 4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = '#606060';
          ctx.beginPath();
          ctx.arc(sx + T / 2, sy + T / 2, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#1a1008';
          ctx.fillRect(sx + T / 2 - 3, sy + T / 2 + 2, 6, 5);

          const kc = { bronze: '#cd7f32', silver: '#a8a8a8', gold: '#ffd700', master: '#e8c080' };
          const col = kc[dk.key] || '#606060';
          ctx.strokeStyle = col;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(sx + 6, sy + 2, T - 12, T - 4);
        }
      } else if (tile === 3) {
        // Window
        ctx.fillStyle = 'rgb(25,35,45)';
        ctx.fillRect(sx, sy, T, T);
        const grd = ctx.createLinearGradient(sx, sy, sx + T, sy + T);
        grd.addColorStop(0, 'rgba(60,90,120,0.3)');
        grd.addColorStop(1, 'rgba(20,40,60,0.1)');
        ctx.fillStyle = grd;
        ctx.fillRect(sx, sy, T, T);
        ctx.strokeStyle = 'rgba(40,60,80,0.6)';
        ctx.lineWidth = 3;
        ctx.strokeRect(sx + 3, sy + 3, T - 6, T - 6);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(sx + T / 2, sy + 3);
        ctx.lineTo(sx + T / 2, sy + T - 3);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(sx + 3, sy + T / 2);
        ctx.lineTo(sx + T - 3, sy + T / 2);
        ctx.stroke();

        // Rain streak effect
        if (tick % 3 === 0) {
          ctx.strokeStyle = 'rgba(80,120,160,0.25)';
          ctx.lineWidth = 1;
          for (let r2 = 0; r2 < 4; r2++) {
            const rx = sx + 6 + ((tick * 2 + r2 * 11) % (T - 12));
            const ry = sy + 4 + ((tick * 3 + r2 * 7) % (T - 8));
            ctx.beginPath();
            ctx.moveTo(rx, ry);
            ctx.lineTo(rx - 2, ry + 5);
            ctx.stroke();
          }
        }
        // Moonlight glow pulsation
        const p = 0.04 + 0.02 * Math.sin(tick * 0.02);
        ctx.fillStyle = `rgba(80,120,180,${p})`;
        ctx.fillRect(sx, sy, T, T);
      }
    }
  }

  // Wall drop shadows
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  for (let ty2 = startTY; ty2 <= endTY; ty2++) {
    for (let tx2 = startTX; tx2 <= endTX; tx2++) {
      const sx = tx2 * T - camX, sy = ty2 * T - camY;
      if (tileAt(tx2, ty2) === 1 && tileAt(tx2, ty2 + 1) === 0) {
        ctx.fillRect(sx, sy + T - 5, T, 5);
      }
    }
  }
}

/**
 * Draws interactive items, doors, and collectibles
 */
function drawItems(camX, camY, tick) {
  ITEMS.forEach(item => {
    if (G.itemsDone[item.id] && item.type === 'pickup') return;
    const p = itemPos(item);
    const sx = p.wx - camX, sy = p.wy - camY;
    if (sx < -60 || sx > GW + 60 || sy < -60 || sy > GH + 60) return;

    const bob = Math.sin(tick * 0.07 + item.tx * 0.5) * 2.5;

    // Item glow aura
    if (['pickup', 'exit'].includes(item.type) || item.secret) {
      const gc2 = item.type === 'exit' ? '#40cc40' : item.secret ? '#c8a040' : '#a0c0ff';
      const grd = ctx.createRadialGradient(sx, sy + bob, 0, sx, sy + bob, 32);
      grd.addColorStop(0, hexA(gc2, 0.25 + 0.1 * Math.sin(tick * 0.1)));
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(sx, sy + bob, 32, 0, Math.PI * 2);
      ctx.fill();
    }

    // Exit Door special graphics
    if (item.id === 'exit_door') {
      const unlocked = G.exitUnlocked;
      ctx.fillStyle = unlocked ? 'rgba(0,80,0,0.8)' : 'rgba(40,20,8,0.9)';
      ctx.fillRect(sx - T * 0.55, sy - T * 0.5, T * 1.1, T);
      ctx.strokeStyle = unlocked ? 'rgba(0,200,0,0.8)' : 'rgba(80,50,20,0.6)';
      ctx.lineWidth = 2;
      ctx.strokeRect(sx - T * 0.55 + 2, sy - T * 0.5 + 2, T * 1.1 - 4, T - 4);
      if (unlocked) {
        ctx.fillStyle = '#40cc40';
        ctx.font = '22px serif';
        ctx.fillText('🚪', sx - 11, sy + 8);
        ctx.fillStyle = 'rgba(0,255,0,0.6)';
        ctx.font = '10px Special Elite';
        ctx.textAlign = 'center';
        ctx.fillText('ESCAPE!', sx, sy + T * 0.5 - 4);
        ctx.textAlign = 'left';
      } else {
        ctx.fillStyle = '#806040';
        ctx.font = '20px serif';
        ctx.fillText('🔒', sx - 10, sy + 7);
      }
      return;
    }

    // Secret Painting
    if (item.id === 'painting' && !G.itemsDone['painting_searched']) {
      ctx.fillStyle = 'rgba(60,40,20,0.9)';
      ctx.fillRect(sx - T * 0.5, sy - T * 0.4, T, T * 0.8);
      ctx.strokeStyle = 'rgba(100,70,30,0.7)';
      ctx.lineWidth = 3;
      ctx.strokeRect(sx - T * 0.5 + 3, sy - T * 0.4 + 3, T - 6, T * 0.8 - 6);
      ctx.font = `${T * 0.5}px serif`;
      ctx.fillText('🖼', sx - T * 0.25, sy + T * 0.15 + bob);
      return;
    }

    // Default emoji render
    ctx.font = `${T * 0.52}px serif`;
    ctx.fillText(item.emoji, sx - T * 0.26, sy + T * 0.24 + bob);

    // Sparkle for hidden key objects
    if (item.type === 'interact' && item.secret && !G.itemsDone[item.id]) {
      const pulse = Math.sin(tick * 0.1) * 0.5 + 0.5;
      ctx.fillStyle = `rgba(200,160,60,${0.4 + 0.3 * pulse})`;
      ctx.font = '10px serif';
      ctx.fillText('✨', sx + T * 0.1, sy - T * 0.25 + bob);
    }
  });
}

/**
 * Draws the player character sprite
 */
function drawPlayer(x, y, facing, walk, wf, scared, hiding) {
  if (hiding) return;

  const ls = walk ? Math.sin(wf * 0.45) * 9 : 0;
  const as = walk ? Math.sin(wf * 0.45) * 7 : 0;

  ctx.save();
  ctx.translate(x, y);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.beginPath();
  ctx.ellipse(0, 22, 11, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shoes
  ctx.fillStyle = '#1a1008';
  if (facing === 'down' || facing === 'up') {
    ctx.fillRect(-9 + ls * 0.5, 19, 8, 5);
    ctx.fillRect(1 - ls * 0.5, 19, 8, 5);
  } else {
    ctx.fillRect(-4, 19, 11, 5);
  }

  // Legs
  ctx.fillStyle = '#2a3560';
  if (facing === 'down' || facing === 'up') {
    ctx.fillRect(-8 + ls * 0.5, 8, 7, 13);
    ctx.fillRect(1 - ls * 0.5, 8, 7, 13);
  } else {
    ctx.fillRect(-4, 8, 10, 13);
  }

  // Torso
  ctx.fillStyle = '#4a4060';
  ctx.fillRect(-10, -5, 20, 14);
  ctx.fillStyle = '#3a3050';
  ctx.fillRect(-10, -5, 20, 5);

  // Arms
  ctx.fillStyle = '#4a4060';
  if (facing === 'down' || facing === 'up') {
    ctx.fillRect(-17, -3 + as, 7, 12);
    ctx.fillRect(10, -3 - as, 7, 12);
    ctx.fillStyle = '#d4b090';
    ctx.fillRect(-18, 8 + as, 8, 6);
    ctx.fillRect(10, 8 - as, 8, 6);
  } else if (facing === 'left') {
    ctx.fillRect(9, -3, 7, 12);
    ctx.fillStyle = '#d4b090';
    ctx.fillRect(10, 8, 8, 6);
  } else {
    ctx.fillRect(-16, -3, 7, 12);
    ctx.fillStyle = '#d4b090';
    ctx.fillRect(-17, 8, 8, 6);
  }

  // Neck
  ctx.fillStyle = '#d4b090';
  ctx.fillRect(-4, -9, 8, 6);

  // Head
  ctx.fillStyle = '#d4b090';
  ctx.beginPath();
  ctx.roundRect(-11, -27, 22, 20, 5);
  ctx.fill();

  // Hair
  ctx.fillStyle = '#1e1008';
  ctx.beginPath();
  ctx.roundRect(-12, -28, 24, 11, 4);
  ctx.fill();
  ctx.fillRect(-12, -22, 5, 8);

  // Face
  if (facing !== 'up') {
    ctx.fillStyle = '#1a1008';
    ctx.beginPath();
    ctx.arc(-4, -18, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(5, -18, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(-3, -19, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(6, -19, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Eyebrows
    ctx.strokeStyle = '#2a1808';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    if (scared) {
      ctx.beginPath();
      ctx.moveTo(-7, -24);
      ctx.lineTo(-2, -26);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(2, -26);
      ctx.lineTo(7, -24);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(-7, -23);
      ctx.lineTo(-2, -22);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(2, -22);
      ctx.lineTo(7, -23);
      ctx.stroke();
    }

    // Mouth
    ctx.strokeStyle = '#7a4a3a';
    ctx.lineWidth = 1.5;
    if (scared) {
      ctx.beginPath();
      ctx.arc(0, -12, 4, 0.2, Math.PI - 0.2);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(-3, -12);
      ctx.quadraticCurveTo(1, -10, 4, -12);
      ctx.stroke();
    }

    // Cheeks
    if (!scared) {
      ctx.fillStyle = 'rgba(210,130,100,0.2)';
      ctx.beginPath();
      ctx.ellipse(-6, -15, 4, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(7, -15, 4, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/**
 * Draws the Granny enemy sprite
 */
function drawGranny(x, y, facing, walk, wf, state, tick) {
  ctx.save();
  ctx.translate(x, y);

  const ls = walk ? Math.sin(wf * 0.3) * 6 : 0;

  // Chase aura
  if (state === 'chase') {
    const grd = ctx.createRadialGradient(0, 10, 0, 0, 10, 50);
    grd.addColorStop(0, 'rgba(139,0,0,0.25)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(0, 10, 50, 0, Math.PI * 2);
    ctx.fill();
  }

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(0, 24, 12, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Dress
  ctx.fillStyle = '#2a2820';
  ctx.fillRect(-13, -5, 26, 28);
  // Apron
  ctx.fillStyle = '#3a3530';
  ctx.fillRect(-8, -3, 16, 22);

  // Legs
  ctx.fillStyle = '#1e1c18';
  ctx.fillRect(-10 + ls * 0.4, 20, 9, 8);
  ctx.fillRect(1 - ls * 0.4, 20, 9, 8);

  // Arms
  ctx.fillStyle = '#2a2820';
  ctx.fillRect(-18, 0, 7, 18);
  ctx.fillRect(11, 0, 7, 18);

  // Hands
  ctx.fillStyle = '#c0a890';
  if (state === 'chase') {
    ctx.fillStyle = '#d4b890';
    ctx.fillRect(-20, 12, 9, 7);
    ctx.fillRect(11, 12, 9, 7);
    for (let f = 0; f < 4; f++) {
      ctx.fillStyle = '#c0a880';
      ctx.fillRect(-22 + f * 2, 18, 2, 5);
      ctx.fillRect(13 + f * 2, 18, 2, 5);
    }
  } else {
    // Cane
    ctx.fillStyle = '#5a3a18';
    ctx.fillRect(12, 5, 3, 22);
    ctx.fillStyle = '#c0a880';
    ctx.fillRect(12, 25, 10, 3);
    ctx.fillStyle = '#c0a890';
    ctx.fillRect(11, 12, 8, 6);
  }

  // Neck
  ctx.fillStyle = '#c0a890';
  ctx.fillRect(-4, -10, 8, 7);

  // Head
  ctx.fillStyle = '#c8b098';
  ctx.beginPath();
  ctx.roundRect(-11, -30, 22, 22, 4);
  ctx.fill();

  // Hair & Bun
  ctx.fillStyle = '#d8d4cc';
  ctx.beginPath();
  ctx.arc(0, -28, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e8e4dc';
  ctx.beginPath();
  ctx.arc(-2, -32, 7, 0, Math.PI * 2);
  ctx.fill();

  // Wispy hair strands
  ctx.strokeStyle = '#c8c4bc';
  ctx.lineWidth = 1;
  for (let s = 0; s < 5; s++) {
    ctx.beginPath();
    ctx.moveTo(-10 + s * 5, -28);
    ctx.quadraticCurveTo(-8 + s * 5, -36, -6 + s * 4, -34);
    ctx.stroke();
  }

  // Face
  if (facing !== 'up') {
    // Wrinkles
    ctx.strokeStyle = 'rgba(120,90,60,0.4)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-8, -22);
    ctx.quadraticCurveTo(-4, -20, -2, -22);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(2, -22);
    ctx.quadraticCurveTo(5, -20, 8, -22);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-9, -18);
    ctx.quadraticCurveTo(0, -15, 9, -18);
    ctx.stroke();

    // Eyes
    if (state === 'chase') {
      ctx.fillStyle = '#cc0000';
      ctx.shadowColor = '#ff0000';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(-4, -20, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(5, -20, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#1a0000';
      ctx.beginPath();
      ctx.arc(-4, -20, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(5, -20, 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#2a1808';
      const eyeH = state === 'alert' ? 3 : 2;
      ctx.fillRect(-7, -22, 6, eyeH * 2);
      ctx.fillRect(2, -22, 6, eyeH * 2);
    }

    // Nose
    ctx.fillStyle = '#b09070';
    ctx.beginPath();
    ctx.arc(0, -16, 3, 0, Math.PI * 2);
    ctx.fill();

    // Mouth
    ctx.strokeStyle = '#7a5040';
    ctx.lineWidth = 1.5;
    if (state === 'chase') {
      ctx.beginPath();
      ctx.arc(0, -10, 5, 0.1, Math.PI - 0.1);
      ctx.fillStyle = '#1a0808';
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(-6, -11);
      ctx.quadraticCurveTo(0, -10, 6, -11);
      ctx.stroke();
    }

    // Wire-rimmed glasses
    ctx.strokeStyle = '#3a2810';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(-4, -20, 5.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(5, -20, 5.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0.5, -20);
    ctx.lineTo(1, -20);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-12, -20);
    ctx.lineTo(-10, -20);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(10, -20);
    ctx.lineTo(12, -20);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Mini-portrait on top-left HUD
 */
function drawHudFace() {
  const c = document.getElementById('hface');
  if (!c) return;
  const cx = c.getContext('2d');
  cx.clearRect(0, 0, 36, 36);
  cx.save();
  cx.beginPath();
  cx.arc(18, 18, 16, 0, Math.PI * 2);
  cx.clip();
  cx.fillStyle = '#0a0806';
  cx.fillRect(0, 0, 36, 36);

  cx.translate(18, 34);
  const ls2 = player.walk ? Math.sin(player.wf * 0.45) * 5 : 0;
  cx.fillStyle = '#2a3560';
  cx.fillRect(-5 + ls2 * 0.3, 3, 4, 7);
  cx.fillRect(-1 - ls2 * 0.3, 3, 4, 7);
  cx.fillStyle = '#4a4060';
  cx.fillRect(-7, -5, 14, 9);
  cx.fillStyle = '#d4b090';
  cx.beginPath();
  cx.roundRect(-7, -16, 14, 13, 3);
  cx.fill();
  cx.fillStyle = '#1e1008';
  cx.beginPath();
  cx.roundRect(-8, -17, 16, 7, 3);
  cx.fill();
  cx.fillStyle = '#1a1008';
  cx.beginPath();
  cx.arc(-2, -11, 2, 0, Math.PI * 2);
  cx.fill();
  cx.beginPath();
  cx.arc(4, -11, 2, 0, Math.PI * 2);
  cx.fill();
  cx.restore();
}

/**
 * Real-time minimap with Granny tracking and player orientation
 */
function drawMinimap() {
  const mc = document.getElementById('mmc');
  if (!mc) return;
  const mctx = mc.getContext('2d');
  mctx.clearRect(0, 0, 130, 110);
  mctx.fillStyle = '#040201';
  mctx.fillRect(0, 0, 130, 110);
  const sx = 130 / MAP_W, sy = 110 / MAP_H;

  for (let ty2 = 0; ty2 < MAP_H; ty2++) {
    for (let tx2 = 0; tx2 < MAP_W; tx2++) {
      const tile = tileAt(tx2, ty2);
      const mx = tx2 * sx, my = ty2 * sy;
      if (tile === 0) {
        mctx.fillStyle = 'rgba(50,38,22,0.8)';
        mctx.fillRect(mx, my, sx, sy);
      } else if (tile === 1) {
        mctx.fillStyle = 'rgba(20,15,8,0.9)';
        mctx.fillRect(mx, my, sx, sy);
      } else if (tile === 2) {
        const dk = doorState[`${ty2},${tx2}`];
        mctx.fillStyle = dk && dk.locked ? 'rgba(80,40,10,0.9)' : 'rgba(60,80,40,0.7)';
        mctx.fillRect(mx, my, sx, sy);
      } else if (tile === 3) {
        mctx.fillStyle = 'rgba(30,45,60,0.8)';
        mctx.fillRect(mx, my, sx, sy);
      }
    }
  }

  // Key item pings on minimap
  ITEMS.filter(i => i.secret && !G.itemsDone[i.id + '_secret']).forEach(i => {
    mctx.fillStyle = keyColor(i.secret);
    mctx.beginPath();
    mctx.arc((i.tx + 0.5) * sx, (i.ty + 0.5) * sy, 2.5, 0, Math.PI * 2);
    mctx.fill();
  });

  // Granny icon
  const gx = (granny.x / (MAP_W * T)) * 130;
  const gy = (granny.y / (MAP_H * T)) * 110;
  mctx.fillStyle = granny.state === 'chase' ? 'rgba(255,0,0,0.9)' : 'rgba(180,80,80,0.6)';
  mctx.beginPath();
  mctx.arc(gx, gy, 3.5, 0, Math.PI * 2);
  mctx.fill();

  // Player icon & line of sight arrow
  const ppx = (player.x / (MAP_W * T)) * 130;
  const ppy = (player.y / (MAP_H * T)) * 110;
  mctx.fillStyle = '#ffffff';
  mctx.beginPath();
  mctx.arc(ppx, ppy, 3, 0, Math.PI * 2);
  mctx.fill();

  const da =
    player.facing === 'up'
      ? -Math.PI / 2
      : player.facing === 'down'
      ? Math.PI / 2
      : player.facing === 'left'
      ? Math.PI
      : 0;
  mctx.strokeStyle = 'rgba(255,255,255,0.5)';
  mctx.lineWidth = 1;
  mctx.beginPath();
  mctx.moveTo(ppx, ppy);
  mctx.lineTo(ppx + Math.cos(da) * 6, ppy + Math.sin(da) * 6);
  mctx.stroke();

  // Exit Door Indicator
  mctx.fillStyle = G.exitUnlocked ? '#40cc40' : '#cc4040';
  mctx.fillRect(9 * sx, 7 * sy - 2, sx * 1.5, 4);
}
