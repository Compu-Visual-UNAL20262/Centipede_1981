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
    this.width = PLAYER_SPRITES.idle.w * SPRITE_SCALE;
    this.height = PLAYER_SPRITES.idle.h * SPRITE_SCALE;
    this.speed = PLAYER_SPEED;
    this.shootCooldown = 0;
    this.burstBulletsRemaining = 0;
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

    // ── Boundary constraints (using entity dimensions) ────────────────
    this.x = constrain(this.x, 0, CANVAS_WIDTH - this.width);
    this.y = constrain(this.y, PLAYER_AREA_Y, CANVAS_HEIGHT - this.height);

    // ── Cooldown tick ────────────────────────────────────────────────
    if (this.shootCooldown > 0) {
      this.shootCooldown--;
    }
  }

  /**
   * Scans global mushrooms and centipedeSegments arrays to find the closest entity
   * located directly above the player in the same column (X range).
   * @returns {number} The vertical distance (Y) to the closest entity above, or Infinity if none.
   */
  getClosestEntityDistanceY() {
    let minDistance = Infinity;

    const scanEntities = (entityList) => {
      if (!entityList || !Array.isArray(entityList)) return;

      for (let i = 0; i < entityList.length; i++) {
        const entity = entityList[i];
        if (!entity) continue;
        if (entity.isActive === false || entity.isDestroyed === true || entity.alive === false) continue;

        const entX = typeof entity.getX === 'function' ? entity.getX() : entity.x;
        const entY = typeof entity.getY === 'function' ? entity.getY() : entity.y;
        if (typeof entX !== 'number' || typeof entY !== 'number') continue;

        const entWidth = typeof entity.getWidth === 'function' ? entity.getWidth() : (entity.width || entity.w || TILE_SIZE);

        const inSameColumn = (entX < this.x + this.width) && (entX + entWidth > this.x);
        const isAbove = entY < this.y;

        if (inSameColumn && isAbove) {
          const distanceY = this.y - entY;
          if (distanceY < minDistance) {
            minDistance = distanceY;
          }
        }
      }
    };

    if (typeof mushrooms !== 'undefined') {
      scanEntities(mushrooms);
    }
    if (typeof centipedeSegments !== 'undefined') {
      scanEntities(centipedeSegments);
    }

    return minDistance;
  }

  /**
   * Calculates a dynamic post-burst cooldown proportional to target distance.
   * Shorter distances return values near MIN_POST_BURST_COOLDOWN,
   * while longer distances return values near MAX_POST_BURST_COOLDOWN.
   * @param {number} distance - Vertical distance in pixels to the closest entity above.
   * @returns {number} Dynamic cooldown in frames.
   */
  calculateDynamicCooldown(distance) {
    if (!Number.isFinite(distance)) {
      return MAX_POST_BURST_COOLDOWN;
    }
    const clampedDistance = constrain(distance, MIN_SCAN_DISTANCE, MAX_SCAN_DISTANCE);
    const dynamicCooldown = map(
      clampedDistance,
      MIN_SCAN_DISTANCE,
      MAX_SCAN_DISTANCE,
      MIN_POST_BURST_COOLDOWN,
      MAX_POST_BURST_COOLDOWN,
      true
    );
    return Math.round(dynamicCooldown);
  }

  /**
   * Fires a bullet if the cooldown has expired.
   * Uses proximity scanning to dynamically adjust cooldowns and fire bursts.
   * Centered horizontally relative to the player's current width.
   * @param {p5.Image} bulletSprite - Pre-extracted sprite image for the bullet.
   */
  shoot(bulletSprite) {
    if (this.shootCooldown <= 0) {
      const bulletWidth = PLAYER_SPRITES.bullet.w * SPRITE_SCALE;
      const spawnX = this.x + Math.floor(this.width / 2) - Math.floor(bulletWidth / 2);
      const spawnY = this.y;

      bullets.push(new Bullet(spawnX, spawnY, bulletSprite));

      const closestDistance = this.getClosestEntityDistanceY();
      const hasTargetAbove = Number.isFinite(closestDistance);

      if (this.burstBulletsRemaining > 0) {
        this.burstBulletsRemaining--;
        if (this.burstBulletsRemaining === 0) {
          this.shootCooldown = this.calculateDynamicCooldown(closestDistance);
        } else {
          this.shootCooldown = RAPID_SHOOT_COOLDOWN;
        }
      } else if (hasTargetAbove) {
        this.burstBulletsRemaining = BURST_BULLET_COUNT;
        this.burstBulletsRemaining--;
        this.shootCooldown = RAPID_SHOOT_COOLDOWN;
      } else {
        this.burstBulletsRemaining = 0;
        this.shootCooldown = NORMAL_SHOOT_COOLDOWN;
      }
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
    const currentDims = justShot ? PLAYER_SPRITES.shooting : PLAYER_SPRITES.idle;
    const renderWidth = currentDims.w * SPRITE_SCALE;
    const renderHeight = currentDims.h * SPRITE_SCALE;

    image(
      currentSprite,
      Math.floor(this.x),
      Math.floor(this.y),
      renderWidth,
      renderHeight
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
   * Returns the rendered width of the player.
   * @returns {number}
   */
  getWidth() {
    return this.width;
  }

  /**
   * Returns the rendered height of the player.
   * @returns {number}
   */
  getHeight() {
    return this.height;
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

  /**
   * Returns the count of remaining burst bullets.
   * @returns {number}
   */
  getBurstBulletsRemaining() {
    return this.burstBulletsRemaining;
  }
}

