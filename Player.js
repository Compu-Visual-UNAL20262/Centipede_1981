// Player.js

class Player {
  /**
   * Initializes the Player ship at the bottom-center of the canvas within the valid player area.
   */
  constructor() {
    this.x = CANVAS_WIDTH / 2;
    this.y = CANVAS_HEIGHT - TILE_SIZE;
    this.speed = typeof PLAYER_SPEED !== 'undefined' ? PLAYER_SPEED : (TILE_SIZE / 4);
    this.shootCooldown = 0;
  }

  /**
   * Updates player movement, applies boundary constraints, and ticks down cooldown.
   */
  update() {
    // 4-directional movement via Arrow keys or WASD
    if (keyIsDown(LEFT_ARROW) || keyIsDown('A'.charCodeAt(0))) {
      this.x -= this.speed;
    }
    if (keyIsDown(RIGHT_ARROW) || keyIsDown('D'.charCodeAt(0))) {
      this.x += this.speed;
    }
    if (keyIsDown(UP_ARROW) || keyIsDown('W'.charCodeAt(0))) {
      this.y -= this.speed;
    }
    if (keyIsDown(DOWN_ARROW) || keyIsDown('S'.charCodeAt(0))) {
      this.y += this.speed;
    }

    // Horizontal boundary constraint: keep X between 0 and CANVAS_WIDTH
    this.x = constrain(this.x, 0, CANVAS_WIDTH);

    // Player area vertical constraint: keep Y between PLAYER_AREA_Y and the canvas bottom (CANVAS_HEIGHT)
    this.y = constrain(this.y, PLAYER_AREA_Y, CANVAS_HEIGHT);

    // Decrement shooting cooldown timer
    if (this.shootCooldown > 0) {
      this.shootCooldown--;
    }
  }

  /**
   * Renders the player ship using p5.js drawing primitives.
   */
  render() {
    push();
    fill(0, 255, 128); // Arcade neon green
    noStroke();

    // Draw an upward-facing triangular ship centered at (this.x, this.y)
    const halfSize = TILE_SIZE / 2;
    triangle(
      this.x, this.y - halfSize,
      this.x - halfSize, this.y + halfSize,
      this.x + halfSize, this.y + halfSize
    );
    pop();
  }

  /**
   * Spawns a bullet if cooldown has expired and registers it into the global `bullets` array.
   */
  shoot() {
    if (this.shootCooldown <= 0) {
      bullets.push(new Bullet(this.x, this.y));
      const cooldownDuration = typeof SHOOT_COOLDOWN_FRAMES !== 'undefined' ? SHOOT_COOLDOWN_FRAMES : 10;
      this.shootCooldown = cooldownDuration;
    }
  }

  /**
   * Returns current horizontal position.
   * @returns {number}
   */
  getX() {
    return this.x;
  }

  /**
   * Returns current vertical position.
   * @returns {number}
   */
  getY() {
    return this.y;
  }

  /**
   * Returns current movement speed.
   * @returns {number}
   */
  getSpeed() {
    return this.speed;
  }

  /**
   * Returns remaining shooting cooldown frames.
   * @returns {number}
   */
  getShootCooldown() {
    return this.shootCooldown;
  }
}
