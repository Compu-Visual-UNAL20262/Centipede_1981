// Player.js

class Player {
  /**
   * Creates the player ship.
   * @param {number} x - Initial horizontal position.
   * @param {number} y - Initial vertical position.
   * @param {{ idle: p5.Image, shooting: p5.Image }} sprites
   *   Pre-extracted sprite images for idle and shooting states.
   */
  constructor(x, y, sprites) {
    this.x = x;
    this.y = y;
    this.speed = PLAYER_SPEED;
    this.shootCooldown = 0;
    this.sprites = sprites;
  }

  /**
   * Handles 4-directional movement, boundary clamping, and cooldown tick.
   */
  update() {
    // ── Movement ──────────────────────────────────────────────────────
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65 /* A */)) {
      this.x -= this.speed;
    }
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68 /* D */)) {
      this.x += this.speed;
    }
    if (keyIsDown(UP_ARROW) || keyIsDown(87 /* W */)) {
      this.y -= this.speed;
    }
    if (keyIsDown(DOWN_ARROW) || keyIsDown(83 /* S */)) {
      this.y += this.speed;
    }

    // ── Boundary constraints ─────────────────────────────────────────
    this.x = constrain(this.x, 0, CANVAS_WIDTH);
    this.y = constrain(this.y, PLAYER_AREA_Y, CANVAS_HEIGHT);

    // ── Cooldown tick ────────────────────────────────────────────────
    if (this.shootCooldown > 0) {
      this.shootCooldown--;
    }
  }

  /**
   * Fires a bullet if the cooldown has expired.
   * @param {p5.Image} bulletSprite - Pre-extracted sprite image for the bullet.
   */
  shoot(bulletSprite) {
    if (this.shootCooldown <= 0) {
      bullets.push(new Bullet(this.x, this.y, bulletSprite));
      this.shootCooldown = SHOOT_COOLDOWN_FRAMES;
    }
  }

  /**
   * Renders the player sprite.
   * Shows the shooting frame during the first quarter of the cooldown,
   * otherwise shows the idle frame.
   * Uses Math.floor() to pixel-snap and prevent sub-pixel texture bleeding.
   */
  render() {
    const justShot =
      this.shootCooldown > 0 &&
      this.shootCooldown >= SHOOT_COOLDOWN_FRAMES - Math.floor(SHOOT_COOLDOWN_FRAMES / 4);

    const currentSprite = justShot ? this.sprites.shooting : this.sprites.idle;

    image(
      currentSprite,
      Math.floor(this.x),
      Math.floor(this.y),
      TILE_SIZE,
      TILE_SIZE
    );
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
   * Returns the current movement speed.
   * @returns {number}
   */
  getSpeed() {
    return this.speed;
  }

  /**
   * Returns the remaining shooting cooldown frames.
   * @returns {number}
   */
  getShootCooldown() {
    return this.shootCooldown;
  }
}
