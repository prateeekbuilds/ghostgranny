/**
 * constants.js
 * Core dimensions, grid definitions, world map, room zones, and static game data.
 */

// Canvas dimensions and Tile resolution
const GW = 960;
const GH = 640;
const T = 48; // Tile size in pixels

// House Map Dimensions
const MAP_W = 22;
const MAP_H = 16;

/**
 * World Tile Map
 * 0: Floor
 * 1: Solid Textured Wall
 * 2: Door (Locked / Unlocked)
 * 3: Window (Rain & Moonlight effect)
 */
// prettier-ignore
const BASE_MAP = [
// 0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17 18 19 20 21
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 1
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 2
  [3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], // 3
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 4
  [1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1], // 5 — hallway walls with doors
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 6
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 7 — HALLWAY
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 8
  [1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1], // 9 — hallway walls with doors
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], // 10
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], // 11
  [3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 3], // 12
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], // 13
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], // 14
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 15
];

// Key requirements for door coordinates 'row,col'
const DOOR_KEYS = {
  '5,2':  'bronze', // hallway -> player bedroom area
  '5,8':  'silver', // hallway -> study/den
  '5,13': 'bronze', // hallway -> kitchen side
  '5,19': 'gold',   // hallway -> granny's bedroom (locked!)
  '9,2':  'bronze', // downstairs left
  '9,8':  'silver', // downstairs middle-left
  '9,13': 'silver', // downstairs middle-right
  '9,19': 'gold',   // downstairs right -> storage
};

// Room definitions for floor themes and zone names
const ROOMS = {
  player_bedroom:  { name: "Your Bedroom",     rows: [1, 4],   cols: [1, 5],   floor: 'wood_worn' },
  study:           { name: "Study / Den",       rows: [1, 4],   cols: [7, 10],  floor: 'carpet_green' },
  granny_bedroom:  { name: "Granny's Bedroom",  rows: [1, 4],   cols: [12, 20], floor: 'carpet_red' },
  hallway:         { name: "Hallway",           rows: [6, 8],   cols: [1, 20],  floor: 'tile' },
  living:          { name: "Living Room",       rows: [10, 14], cols: [1, 5],   floor: 'carpet_old' },
  kitchen:         { name: "Kitchen",           rows: [10, 14], cols: [7, 10],  floor: 'tile_kitchen' },
  bathroom:        { name: "Bathroom",          rows: [10, 14], cols: [12, 15], floor: 'tile_bath' },
  storage:         { name: "Storage Room",      rows: [10, 14], cols: [17, 20], floor: 'concrete' },
};

// Designated hiding spots
const HIDE_SPOTS = ['bed_hide', 'wardrobe1', 'sofa'];

// Random psychological horror narrative atmospheric prompts
const ATMOS = [
  "Somewhere in the house, something creaks.",
  "A floorboard groans under unseen weight.",
  "You hear her shuffling. Close. Too close.",
  "The lights flicker for a moment.",
  "A door you didn't open swings shut.",
  "The sound of knitting needles clicking from somewhere.",
  "Granny hums to herself. An old lullaby.",
  "You hear her voice: 'Dinner time, dear...'",
  "The grandfather clock ticks louder.",
];

/**
 * Returns the tile id at grid coordinate (tx, ty)
 */
function tileAt(tx, ty) {
  if (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) return 1;
  return BASE_MAP[ty][tx];
}

/**
 * Checks if a tile is a door
 */
function isDoor(tx, ty) {
  return tileAt(tx, ty) === 2;
}

/**
 * Returns door state at grid coordinate
 */
function doorKey(tx, ty) {
  return doorState[`${ty},${tx}`];
}
