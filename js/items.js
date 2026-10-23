/**
 * items.js
 * World interactables, puzzles, keys, hiding spots, and inventory interactions.
 */

const ITEMS = [
  // ── Player Bedroom ──
  {
    id: 'bed_hide',
    tx: 1, ty: 3,
    emoji: '🛏',
    label: 'Bed (Hide)',
    type: 'hide',
    hint: '[Q] Hide under bed'
  },
  {
    id: 'wardrobe1',
    tx: 4, ty: 1,
    emoji: '🪞',
    label: 'Wardrobe',
    type: 'hide',
    hint: '[Q] Hide in wardrobe'
  },
  {
    id: 'note1',
    tx: 3, ty: 3,
    emoji: '📄',
    label: 'Note',
    type: 'pickup',
    item: 'note1',
    hint: '[E] Read note',
    msg: "On the floor beside the bed:\n\n'If you're reading this, you're trapped too.\nThe keys are hidden all over the house.\nBRONZE KEY — downstairs, she keeps it on the kitchen shelf.\nSILVER KEY — in the study, inside the old radio.\nGOLD KEY — granny's bedroom (God help you).\nMASTER KEY — behind the painting in the living room.\n\nDon't make noise. She hears EVERYTHING.'"
  },

  // ── Hallway ──
  {
    id: 'exit_door',
    tx: 10, ty: 7,
    emoji: '🚪',
    label: 'FRONT DOOR (Exit)',
    type: 'exit',
    hint: '[E] Escape!',
    col: '#40aa40'
  },
  {
    id: 'phone',
    tx: 3, ty: 7,
    emoji: '☎',
    label: 'Old Telephone',
    type: 'interact',
    hint: '[E] Use phone',
    msg: "Dead line. Just static.\nThen — breathing.\nThen her voice:\n'...I see you...'"
  },
  {
    id: 'painting',
    tx: 17, ty: 7,
    emoji: '🖼',
    label: 'Old Painting',
    type: 'interact',
    hint: '[E] Inspect painting',
    msg: "A portrait of a woman. Young, beautiful.\nSomething is off about the eyes.\nThey're following you.\n\nWait — there's something behind it...",
    secret: 'master_key'
  },
  {
    id: 'grandfather_clock',
    tx: 7, ty: 6,
    emoji: '🕰',
    label: 'Grandfather Clock',
    type: 'interact',
    hint: '[E] Inspect clock',
    msg: "The clock ticks. Perfectly. Every second.\nThe pendulum swings left... right...\n3:17. Always 3:17.\nThe second hand is missing."
  },

  // ── Study ──
  {
    id: 'radio',
    tx: 9, ty: 1,
    emoji: '📻',
    label: 'Old Radio',
    type: 'interact',
    hint: '[E] Use radio',
    secret: 'silver_key',
    msg: "The radio crackles to life.\nStatic. Then a child's voice:\n'Ring around the roses...'\nYou reach behind it.\nYour fingers close around something metal.\nA key."
  },
  {
    id: 'desk',
    tx: 8, ty: 3,
    emoji: '🪑',
    label: 'Old Desk',
    type: 'interact',
    hint: '[E] Examine desk',
    msg: "Stacks of newspapers. All the same date.\nAll reporting the same disappearance.\n'LOCAL MAN VANISHES FROM RURAL HOME'\nYour name is in the article."
  },
  {
    id: 'bookshelf',
    tx: 7, ty: 4,
    emoji: '📚',
    label: 'Bookshelf',
    type: 'interact',
    hint: '[E] Browse books',
    msg: "The books are all the same title:\n'HOW TO KEEP THEM HERE'\nEach copy has different handwriting.\nDifferent names written on the inside covers.\nYours is there too."
  },

  // ── Granny's Bedroom ──
  {
    id: 'granny_bed',
    tx: 14, ty: 1,
    emoji: '🛏',
    label: "Granny's Bed",
    type: 'interact',
    hint: '[E] Search bed',
    msg: "Rumpled sheets. Cold.\nA smell like old roses and something else.\nUnder the pillow: a photograph.\nYou. At home. Before this.\nShe was watching you."
  },
  {
    id: 'granny_trunk',
    tx: 18, ty: 3,
    emoji: '🧳',
    label: "Old Trunk",
    type: 'interact',
    hint: '[E] Open trunk',
    secret: 'gold_key',
    msg: "The trunk creaks open.\nDolls. Dozens of them. All staring up.\nOne of them moves.\nNested at the bottom — a golden key."
  },
  {
    id: 'mirror_g',
    tx: 20, ty: 2,
    emoji: '🪞',
    label: 'Cracked Mirror',
    type: 'interact',
    hint: '[E] Look in mirror',
    msg: "Cracks spider across your reflection.\nFor a moment, someone else stares back.\nAn old woman. Right behind you.\nYou spin — nothing there."
  },

  // ── Living Room ──
  {
    id: 'sofa',
    tx: 2, ty: 11,
    emoji: '🛋',
    label: 'Old Sofa',
    type: 'hide',
    hint: '[Q] Hide behind sofa'
  },
  {
    id: 'rocking',
    tx: 4, ty: 10,
    emoji: '🪑',
    label: 'Rocking Chair',
    type: 'interact',
    hint: '[E] Touch chair',
    msg: "The chair rocks on its own.\nCreaking. Steady. Rhythmic.\nAnd stops — the moment you touch it."
  },
  {
    id: 'fireplace',
    tx: 1, ty: 12,
    emoji: '🔥',
    label: 'Fireplace',
    type: 'interact',
    hint: '[E] Check fireplace',
    msg: "A fire burns low. In the embers:\nBurnt photographs.\nAll faces scratched out.\nExcept one. The newest one.\nYours."
  },
  {
    id: 'jar',
    tx: 3, ty: 14,
    emoji: '🫙',
    label: 'Jar on Shelf',
    type: 'interact',
    hint: '[E] Examine jar',
    msg: "The jar is filled with teeth.\nAll different sizes. All human.\nA handwritten label: 'THOSE WHO TRIED'.\nYou put it down quickly."
  },

  // ── Kitchen ──
  {
    id: 'shelf_bronze',
    tx: 8, ty: 10,
    emoji: '🗑',
    label: 'Kitchen Shelf',
    type: 'interact',
    hint: '[E] Search shelf',
    secret: 'bronze_key',
    msg: "Old tin cans. Rusted. Labels peeling.\nBehind them — shoved all the way back —\na small bronze key on a length of twine."
  },
  {
    id: 'stove',
    tx: 9, ty: 13,
    emoji: '🍳',
    label: 'Old Stove',
    type: 'interact',
    hint: '[E] Check stove',
    msg: "Something bubbles in a pot.\nYou lift the lid.\nBones. Thin, small bones.\nYou put the lid back. Fast."
  },
  {
    id: 'fridge',
    tx: 10, ty: 11,
    emoji: '🧊',
    label: 'Old Refrigerator',
    type: 'interact',
    hint: '[E] Open fridge',
    msg: "Inside: nothing but an old milk bottle.\nThe expiry date: your birthday.\nThis year."
  },

  // ── Bathroom ──
  {
    id: 'medicine',
    tx: 13, ty: 11,
    emoji: '💊',
    label: 'Medicine Cabinet',
    type: 'pickup',
    item: 'painkillers',
    hint: '[E] Take pills',
    msg: "Painkillers. Dusty but usable.\nThey'll restore your health if things get bad."
  },
  {
    id: 'bathtub',
    tx: 14, ty: 13,
    emoji: '🛁',
    label: 'Bathtub',
    type: 'interact',
    hint: '[E] Look in tub',
    msg: "Filled with dark water.\nSomething shifts beneath the surface.\nYou back away."
  },
  {
    id: 'toilet_note',
    tx: 15, ty: 11,
    emoji: '📄',
    label: 'Scrawled Note',
    type: 'pickup',
    item: 'note2',
    hint: '[E] Read note',
    msg: "Written in something red on the cistern lid:\n'SHE SLEEPS 9AM-12PM. THAT'S YOUR WINDOW.\nSHE'S DEAF IN HER LEFT EAR.\nAPPROACH FROM THE LEFT.\nGOOD LUCK. YOU'LL NEED IT.\n— Someone who didn't make it'"
  },

  // ── Storage Room ──
  {
    id: 'planks',
    tx: 18, ty: 12,
    emoji: '🪵',
    label: 'Old Planks',
    type: 'interact',
    hint: '[E] Move planks',
    msg: "Heavy planks stacked against the wall.\nBehind them — a small crawl space.\nToo small for granny.\nJust big enough for you."
  },
  {
    id: 'toolbox',
    tx: 19, ty: 10,
    emoji: '🔧',
    label: 'Toolbox',
    type: 'pickup',
    item: 'wrench',
    hint: '[E] Take wrench',
    msg: "A heavy wrench. It won't hurt granny.\nBut drop it and she'll hear."
  },
  {
    id: 'chest',
    tx: 17, ty: 13,
    emoji: '📦',
    label: 'Old Chest',
    type: 'interact',
    hint: '[E] Open chest',
    msg: "A child's drawings inside.\nCrayon. Stick figures.\nA house. A woman. A child.\nUnder the child, written in adult hand:\n'MY LITTLE ONE. STAY FOREVER.'"
  },
];

/**
 * Calculates world coordinates for an item
 */
function itemPos(item) {
  return { wx: (item.tx + 0.5) * T, wy: (item.ty + 0.5) * T };
}

let nearItem = null;

/**
 * Checks for nearby items within interaction range
 */
function checkNearItems() {
  const px = player.x, py = player.y;
  let best = null, bestD = Infinity;

  ITEMS.forEach(item => {
    if (G.itemsDone[item.id] && item.type === 'pickup') return;
    const p = itemPos(item);
    const d = Math.sqrt((px - p.wx) ** 2 + (py - p.wy) ** 2);
    if (d < 60 && d < bestD) {
      bestD = d;
      best = item;
    }
  });

  nearItem = best;

  const prmt = document.getElementById('prmt');
  if (best) {
    const p = itemPos(best);
    prmt.style.left = (p.wx - G.cam.x - 20) + 'px';
    prmt.style.top = (p.wy - G.cam.y - 52) + 'px';
    prmt.textContent = best.hint || `[E] ${best.label}`;
    prmt.classList.add('on');
  } else {
    prmt.classList.remove('on');
  }
}

/**
 * Executes interaction logic based on nearby item
 */
function doInteract() {
  if (!nearItem) return;
  const item = nearItem;

  // HIDE SPOT
  if (item.type === 'hide' || HIDE_SPOTS.includes(item.id)) {
    if (!G.isHiding) {
      G.isHiding = true;
      G.hiddenAt = item.id;
      document.getElementById('hidingMsg').style.display = 'block';
      document.getElementById('grannySense').style.display = 'none';
      toast('You hide. Hold still. Hold your breath...');
      granny.state = 'search';
      granny.searchTimer = 200;
    }
    return;
  }

  // UNHIDE
  if (G.isHiding) {
    unhide();
    return;
  }

  // EXIT DOOR
  if (item.type === 'exit') {
    if (G.exitUnlocked) {
      triggerWin();
    } else {
      showPopup(
        'NARRATOR',
        "The front door is chained.\nYou need all 4 keys to unlock the master chain.\nFind them.",
        3000
      );
    }
    return;
  }

  // PICKUP
  if (item.type === 'pickup' && !G.itemsDone[item.id]) {
    G.itemsDone[item.id] = true;
    G.inventory.push({ id: item.item, label: item.label, emoji: item.emoji });
    toast(`Picked up: ${item.label}`);
    if (item.msg) showPopup('NARRATOR', item.msg, 6000);
    beep(660, 0.12);
    spawnP(player.x - G.cam.x, player.y - G.cam.y, '#a0c0ff', 10);
    updateInventoryUI();
    return;
  }

  // SECRET ITEMS (Keys etc.)
  if (item.secret && !G.itemsDone[item.id + '_secret']) {
    G.itemsDone[item.id + '_secret'] = true;
    const keyName = item.secret;
    G.keys.push(keyName);
    G.keysFound++;
    if (item.msg) showPopup('NARRATOR', item.msg, 6000);
    beep(880, 0.15);
    beep(1100, 0.1);
    toast(`🔑 Found: ${keyName.toUpperCase()} KEY`);
    spawnP(player.x - G.cam.x, player.y - G.cam.y, keyColor(keyName), 15);
    checkUnlocks();
    updateInventoryUI();
    return;
  }

  if (item.id === 'painting' && !G.itemsDone['painting_searched'] && G.keys.includes('master_key')) {
    G.itemsDone['painting_searched'] = true;
    return;
  }

  // GENERAL INTERACT
  if (item.msg) {
    showPopup('NARRATOR', item.msg, 5000);
    // Random chance granny hears
    if (Math.random() < 0.25 && granny.state === 'patrol') {
      granny.state = 'alert';
      granny.alertTimer = 120;
      granny.tx = player.x;
      granny.ty = player.y;
      setTimeout(() => toast('⚠ Did that make a sound?'), 800);
    }
  }
}

/**
 * Player exits hiding spot
 */
function unhide() {
  G.isHiding = false;
  G.hiddenAt = null;
  document.getElementById('hidingMsg').style.display = 'none';
  toast('You slip out of hiding...');
}

/**
 * Returns theme color for each key
 */
function keyColor(k) {
  const m = {
    bronze: '#cd7f32',
    silver: '#c0c0c0',
    gold: '#ffd700',
    master: '#e8c080',
    master_key: '#e8c080',
  };
  return m[k] || '#c8a040';
}

/**
 * Verifies key unlocks for doors and the exit gate
 */
function checkUnlocks() {
  Object.entries(DOOR_KEYS).forEach(([k, keyNeeded]) => {
    if (G.keys.includes(keyNeeded) && doorState[k] && doorState[k].locked) {
      doorState[k].locked = false;
    }
  });

  // Exit unlocks when all 4 keys found
  if (
    G.keys.includes('bronze') &&
    G.keys.includes('silver') &&
    G.keys.includes('gold') &&
    G.keys.includes('master_key')
  ) {
    G.exitUnlocked = true;
    showPopup(
      'NARRATOR',
      "All 4 keys found!\nYou hear the front door chain rattling.\nIT'S UNLOCKED.\n\nGET OUT. NOW.",
      5000
    );
    tone(120, 3, 0.1);
    tone(160, 3, 0.08);
    toast('🚪 FRONT DOOR UNLOCKED — ESCAPE!');
    const escStatus = document.getElementById('escStatus');
    if (escStatus) {
      escStatus.textContent = '🚪 Escape: UNLOCKED!';
      escStatus.style.color = '#40cc40';
    }
  }

  const keyStatus = document.getElementById('keyStatus');
  if (keyStatus) {
    keyStatus.textContent = `🔑 Keys: ${G.keysFound}/4`;
  }
  updateInventoryUI();
}
