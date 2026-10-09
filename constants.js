// constants.js
// ─── Shared Constants (Engine Base) ──────────────────────────────────
const TILE_SIZE = 16;
const COLS = 30;
const ROWS = 32;
const CANVAS_WIDTH = COLS * TILE_SIZE;
const CANVAS_HEIGHT = ROWS * TILE_SIZE;

// Top Y boundary for player movement (restricted to bottom area)
const PLAYER_AREA_Y = ROWS * 0.75 * TILE_SIZE;

// General collision radius for p5.dist() checks
const COLLISION_RADIUS = 8;

// Global visual scale factor for sprite sheet entities (maps native pixel art to canvas)
const SPRITE_SCALE = 2;

// ─── Player & Bullet Settings ────────────────────────────────────────
const PLAYER_SPEED = 4;
const SHOOT_COOLDOWN_FRAMES = 10;
const BULLET_SPEED = -8;

// ─── Player Sprite Coordinates (source rectangles in sprite sheet) ───
const PLAYER_SPRITES = {
  idle:     { x: 4,  y: 7,  w: 7, h: 10 },
  shooting: { x: 21, y: 9,  w: 7, h: 8  },
  bullet:   { x: 24, y: 2,  w: 1, h: 6  },
};

// ─── Player Death Animation Sprites (disappearance sequence) ────────
const PLAYER_DEATH_SPRITES = [
  { x: 34,  y: 0, w: 16, h: 8 },
  { x: 51,  y: 0, w: 16, h: 8 },
  { x: 68,  y: 0, w: 16, h: 8 },
  { x: 85,  y: 0, w: 16, h: 8 },
  { x: 103, y: 0, w: 14, h: 7 },
  { x: 121, y: 0, w: 12, h: 7 },
  { x: 140, y: 0, w: 8,  h: 6 },
  { x: 158, y: 3, w: 5,  h: 3 }
];
const PLAYER_DEATH_FRAME_DELAY = 6;

const MUSHROOM_SPRITES = {
  life_4: { x: 68,  y: 81,  w: 8, h: 8 },
  life_3: { x: 77, y: 81,  w: 8, h: 8 },
  life_2: { x: 86, y: 81,  w: 8, h: 8 },
  destroyed:{ x: 95, y: 81,  w: 8, h: 8 },
};

const CENTIPEDE_SPRITES = {
  centipedeHead: { x:4, y: 18, w: 7, h:8},
  centipedeBodyA: { x:4, y: 36, w: 7, h:8},
  centipedeBodyB: { x:38, y: 36, w: 7, h:8},
  centipedeBodyC: { x:72, y: 36, w: 7, h:8},
  centipedeBodyD: { x:106, y: 36, w: 7, h:8},
}

const PALETTE_OFFSETS = [
  { x: 0,   y: 0   }, // Nivel 1
  { x: 170, y: 0   }, // Nivel 2
  { x: 340, y: 0   }, // Nivel 3
  { x: 510, y: 0   }, // Nivel 4
  { x: 0,   y: 117 }, // Nivel 5
  { x: 170, y: 117 }, // Nivel 6
  { x: 340, y: 117 }, // Nivel 7
  { x: 510, y: 117 }, // Nivel 8
  { x: 0,   y: 234 }, // Nivel 9
  { x: 170, y: 234 }, // Nivel 10
  { x: 340, y: 234 }, // Nivel 11
  { x: 510, y: 234 }, // Nivel 12
  { x: 170,   y: 351 }, // Nivel 13
  { x: 340, y: 351 }  // Nivel 14
];

// ─── Dynamic Burst & Cooldown Settings ──────────────────────────────
const NORMAL_SHOOT_COOLDOWN = 24;
const RAPID_SHOOT_COOLDOWN = 4;
const BURST_BULLET_COUNT = 3;
const MIN_POST_BURST_COOLDOWN = 6;
const MAX_POST_BURST_COOLDOWN = 18;
const MIN_SCAN_DISTANCE = 0;
const MAX_SCAN_DISTANCE = CANVAS_HEIGHT;

// Centipede
const CENTIPEDE_LENGTH = 12;
const INITIAL_X_CENTIPEDE = 5;
const INITIAL_Y_CENTIPEDE = 2;
const MIN_CENTIPEDE_SPEED = 3;

// ─── Sound Settings & Audio Assets ───────────────────────────────────
const SOUND_PATHS = {
  dead: 'assets/Dead.wav',
  shoot: 'assets/Shoot.wav',
  spider: 'assets/Spider.wav',
  track: 'assets/Track.wav'
};

const SOUNDS = {
  dead: typeof Audio !== 'undefined' ? new Audio(SOUND_PATHS.dead) : null,
  shoot: typeof Audio !== 'undefined' ? new Audio(SOUND_PATHS.shoot) : null,
  spider: typeof Audio !== 'undefined' ? new Audio(SOUND_PATHS.spider) : null,
  track: typeof Audio !== 'undefined' ? new Audio(SOUND_PATHS.track) : null
};

/**
 * Utility function to play an audio effect safely with support for overlaps.
 * Uses cloneNode() to allow overlapping sound instances (e.g., rapid fire).
 * Catches and ignores autoplay restrictions gracefully.
 * @param {HTMLAudioElement|null} sound
 * @returns {HTMLAudioElement|null}
 */
function playSound(sound) {
  if (!sound) return null;
  try {
    if (typeof sound.cloneNode === 'function') {
      const clone = sound.cloneNode();
      const playPromise = clone.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {});
      }
      return clone;
    } else if (typeof sound.play === 'function') {
      sound.currentTime = 0;
      const playPromise = sound.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {});
      }
      return sound;
    }
  } catch (err) {
    // Gracefully ignore audio errors (e.g. headless/Node testing or browser policies)
  }
  return null;
}