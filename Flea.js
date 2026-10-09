// Flea.js

class Flea {
  constructor(col, sprites) {
    this.col = typeof col === 'number' ? col : Math.floor(Math.random() * COLS);
    this.x = this.col * TILE_SIZE;
    this.y = -TILE_SIZE;
    this.row = Math.floor(this.y / TILE_SIZE);

    this.width = FLEA_SPRITES[0].w * SPRITE_SCALE;
    this.height = FLEA_SPRITES[0].h * SPRITE_SCALE;

    this.speed = FLEA_BASE_SPEED;
    this.health = FLEA_HEALTH;
    this.isActive = true;

    this.sprites = sprites || null;
    this.frameIndex = 0;
    this.animationTimer = 0;
    this.animationDelay = FLEA_ANIMATION_DELAY;

    this.lastDroppedRow = -1;
  }

  update(currentScore = 0) {
    if (!this.isActive) return;

    if (currentScore >= FLEA_SPEED_THRESHOLD_SCORE) {
      this.speed = FLEA_FAST_SPEED;
    } else {
      this.speed = FLEA_BASE_SPEED;
    }

    this.y += this.speed;
    this.row = Math.floor(this.y / TILE_SIZE);

    // Sequential animation cycle: 1 -> 2 -> 3 -> 4 -> 1
    this.animationTimer++;
    if (this.animationTimer >= this.animationDelay) {
      this.animationTimer = 0;
      this.frameIndex = (this.frameIndex + 1) % FLEA_SPRITES.length;
    }

    this.checkDropMushroom();

    if (this.y > CANVAS_HEIGHT) {
      this.isActive = false;
    }
  }

  checkDropMushroom() {
    // Only drop mushrooms within the playable playfield rows
    if (this.row >= 3 && this.row < ROWS - 1 && this.row !== this.lastDroppedRow) {
      this.lastDroppedRow = this.row;

      if (Math.random() < FLEA_DROP_MUSHROOM_CHANCE) {
        if (typeof gridManager !== 'undefined' && gridManager.hasMushroomAt) {
          if (!gridManager.hasMushroomAt(this.col, this.row)) {
            if (typeof mushrooms !== 'undefined' && Array.isArray(mushrooms)) {
              mushrooms.push(new Mushroom(this.col, this.row));
            }
          }
        }
      }
    }
  }

  takeDamage() {
    this.health--;
    if (this.health <= 0) {
      this.isActive = false;
      return true;
    }
    // Speeds up immediately upon taking first hit
    this.speed = FLEA_FAST_SPEED;
    return false;
  }

  render() {
    if (!this.isActive) return;

    let spriteImg = null;
    if (this.sprites && this.sprites[this.frameIndex]) {
      spriteImg = this.sprites[this.frameIndex];
    }

    if (spriteImg) {
      image(
        spriteImg,
        Math.floor(this.x),
        Math.floor(this.y),
        this.width,
        this.height
      );
    } else if (typeof spriteSheet !== 'undefined' && spriteSheet) {
      // Fallback: draw directly using current level palette coordinates
      const coord = FLEA_SPRITES[this.frameIndex];
      let pX = 0;
      let pY = 0;
      if (typeof currentLevel !== 'undefined' && typeof PALETTE_OFFSETS !== 'undefined') {
        const paletteIndex = (currentLevel - 1) % PALETTE_OFFSETS.length;
        const p = PALETTE_OFFSETS[paletteIndex];
        pX = p.x;
        pY = p.y;
      }
      image(
        spriteSheet,
        Math.floor(this.x),
        Math.floor(this.y),
        this.width,
        this.height,
        pX + coord.x,
        pY + coord.y,
        coord.w,
        coord.h
      );
    }
  }

  // Check if the bottom fifth of the board has few mushrooms to trigger spawn
  static shouldSpawn(threshold = 5) {
    if (typeof mushrooms === 'undefined' || !Array.isArray(mushrooms)) return false;

    const bottomFifthStartRow = Math.floor(ROWS * 0.8);
    let count = 0;

    for (let i = 0; i < mushrooms.length; i++) {
      const m = mushrooms[i];
      if (m && m.health > 0 && m.row >= bottomFifthStartRow) {
        count++;
      }
    }

    return count < threshold;
  }

  getX() { return this.x; }
  getY() { return this.y; }
  getWidth() { return this.width; }
  getHeight() { return this.height; }
}
