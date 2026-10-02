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

// ─── Player & Bullet Settings ────────────────────────────────────────
const PLAYER_SPEED = 4;
const SHOOT_COOLDOWN_FRAMES = 10;
const BULLET_SPEED = -8;
