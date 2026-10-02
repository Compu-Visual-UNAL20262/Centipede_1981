// Bullet.js

class Bullet {
  /**
   * Creates a new bullet projectile that travels upward.
   * @param {number} x - Initial horizontal position (center).
   * @param {number} y - Initial vertical position (top of player).
   * @param {p5.Image} sprite - Pre-extracted sprite image for the bullet.
   */
  constructor(x, y, sprite) {
    this.x = x;
    this.y = y;
    this.speed = BULLET_SPEED;
    this.isActive = true;
    this.sprite = sprite;
  }

  /**
   * Advances the bullet upward by its speed each frame.
   * Deactivates when it exits the top edge of the canvas.
   */
  move() {
    this.y += this.speed;

    if (this.y < 0) {
      this.isActive = false;
    }
  }

  /**
   * Draws the bullet sprite at its current position.
   * Uses Math.floor() on coordinates to avoid sub-pixel texture bleeding.
   */
  render() {
    if (!this.isActive) return;

    image(
      this.sprite,
      Math.floor(this.x),
      Math.floor(this.y),
      TILE_SIZE,
      TILE_SIZE
    );
  }

  /**
   * Returns whether the bullet is still active.
   * @returns {boolean}
   */
  getIsActive() {
    return this.isActive;
  }

  /**
   * Deactivates the bullet (e.g., upon collision).
   */
  deactivate() {
    this.isActive = false;
  }

  /**
   * Returns the current horizontal position.
   * @returns {number}
   */
  getX() {
    return this.x;
  }

  /**
   * Returns the current vertical position.
   * @returns {number}
   */
  getY() {
    return this.y;
  }
}
