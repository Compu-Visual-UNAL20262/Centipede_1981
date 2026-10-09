// Bullet.js

class Bullet {
  /**
   * Creates a new bullet projectile that travels upward.
   * @param {number} x - Initial horizontal position.
   * @param {number} y - Initial vertical position.
   * @param {p5.Image} sprite - Pre-extracted sprite image for the bullet.
   */
  constructor(x, y, sprite) {
    this.x = x;
    this.y = y;
    this.width = PLAYER_SPRITES.bullet.w * SPRITE_SCALE;
    this.height = PLAYER_SPRITES.bullet.h * SPRITE_SCALE;
    this.speed = BULLET_SPEED;
    this.isActive = true;
    this.sprite = sprite;

    this.playShootSound();
  }

  /**
   * Plays the bullet shoot sound effect (Shoot.wav).
   */
  playShootSound() {
    if (typeof playSound === 'function' && typeof SOUNDS !== 'undefined') {
      playSound(SOUNDS.shoot);
    } else if (typeof SOUNDS !== 'undefined' && SOUNDS.shoot) {
      try {
        const clone = SOUNDS.shoot.cloneNode();
        clone.play().catch(() => {});
      } catch (e) {
        SOUNDS.shoot.currentTime = 0;
        SOUNDS.shoot.play().catch(() => {});
      }
    }
  }

  /**
   * Advances the bullet upward by its speed each frame.
   * Deactivates when it completely exits the top edge of the canvas.
   */
  move() {
    this.y += this.speed;

    if (this.y + this.height < 0) {
      this.isActive = false;
    }
  }

  /**
   * Draws the bullet sprite at its current position using its scaled dimensions.
   * Uses Math.floor() on coordinates to avoid sub-pixel texture bleeding.
   */
  render() {
    if (!this.isActive) return;

    image(
      this.sprite,
      Math.floor(this.x),
      Math.floor(this.y),
      this.width,
      this.height
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

  /**
   * Returns the rendered width of the bullet.
   * @returns {number}
   */
  getWidth() {
    return this.width;
  }

  /**
   * Returns the rendered height of the bullet.
   * @returns {number}
   */
  getHeight() {
    return this.height;
  }
}
