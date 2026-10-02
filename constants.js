// constants.js
// ─── Shared Constants (Engine Base) ──────────────────────────────────
const TILE_SIZE = 16;
const COLS = 30;
const ROWS = 40;
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
