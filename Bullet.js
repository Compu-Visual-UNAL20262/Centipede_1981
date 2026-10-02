// Bullet.js

class Bullet {
  /**
   * Initializes a new Bullet instance.
   * @param {number} x - Initial horizontal position.
   * @param {number} y - Initial vertical position.
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = typeof BULLET_SPEED !== 'undefined' ? BULLET_SPEED : -(TILE_SIZE / 2);
    this.isActive = true;
  }

  /**
   * Updates the vertical position of the bullet by adding its speed.
   * Deactivates the bullet once it exits the top boundary of the canvas.
   */
  move() {
    this.y += this.speed;

    // Deactivate when leaving the top of the screen
    if (this.y < 0) {
      this.isActive = false;
    }
  }

  /**
   * Renders the bullet on the canvas using p5.js drawing primitives.
   */
  render() {
    if (!this.isActive) return;

    push();
    stroke(255, 255, 255);
    strokeWeight(2);
    // Draw a small vertical line representing the laser projectile
    const bulletLength = typeof TILE_SIZE !== 'undefined' ? (TILE_SIZE / 2) : 8;
    line(this.x, this.y, this.x, this.y - bulletLength);
    pop();
  }

  /**
   * Returns whether the bullet is currently active.
   * @returns {boolean}
   */
  getIsActive() {
    return this.isActive;
  }

  /**
   * Deactivates the bullet (e.g., upon collision with an enemy or obstacle).
   */
  deactivate() {
    this.isActive = false;
  }

  /**
   * Returns the current horizontal position of the bullet.
   * @returns {number}
   */
  getX() {
    return this.x;
  }

  /**
   * Returns the current vertical position of the bullet.
   * @returns {number}
   */
  getY() {
    return this.y;
  }
}
