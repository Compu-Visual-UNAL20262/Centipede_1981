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
    this.startX = x;
    this.startY = y;
    this.width = PLAYER_SPRITES.idle.w * SPRITE_SCALE;
    this.height = PLAYER_SPRITES.idle.h * SPRITE_SCALE;
    this.speed = PLAYER_SPEED;
    this.shootCooldown = 0;
    this.burstBulletsRemaining = 0;

    // Exact hitbox matching visual sprite boundaries:
    // Prevents the player from penetrating into mushroom tiles and erasing their pixels.
    this.hitboxOffsetX = 0;
    this.hitboxOffsetY = 0;
    this.hitboxWidth = this.width;
    this.hitboxHeight = this.height;

    // Death animation state
    this.isDying = false;
    this.deathFrameIndex = 0;
    this.deathTimer = 0;
    this.invulnerableTimer = 0;

    this.sprites = sprites;
  }

  /**
   * Getter for sprites object.
   */
  get sprites() {
    return this._sprites;
  }

  /**
   * Setter for sprites: automatically converts solid black background pixels
   * into fully transparent pixels so the sprite doesn't overwrite adjacent tiles.
   */
  set sprites(val) {
    this._sprites = val;
    if (val) {
      if (val.idle) this.makeBlackTransparent(val.idle);
      if (val.shooting) this.makeBlackTransparent(val.shooting);
    }
  }

  /**
   * Converts all pure black pixels (0, 0, 0) in a p5.Image to fully transparent.
   * Prevents the player's sprite rectangular bounding box from erasing background or mushroom pixels.
   * @param {p5.Image} img
   */
  makeBlackTransparent(img) {
    if (!img) return;
    img.loadPixels();
    if (!img.pixels || img.pixels.length === 0) return;
    for (let i = 0; i < img.pixels.length; i += 4) {
      if (img.pixels[i] === 0 && img.pixels[i + 1] === 0 && img.pixels[i + 2] === 0) {
        img.pixels[i + 3] = 0;
      }
    }
    img.updatePixels();
  }

  /**
   * Checks whether the player's bounding box at (testX, testY) collides with any active mushroom.
   * @param {number} testX - Horizontal position to test.
   * @param {number} testY - Vertical position to test.
   * @returns {Mushroom|null} The mushroom entity collided with, or null.
   */
  checkMushroomCollision(testX, testY) {
    if (typeof mushrooms === 'undefined' || !Array.isArray(mushrooms)) return null;

    const boxLeft = testX + this.hitboxOffsetX;
    const boxRight = boxLeft + this.hitboxWidth;
    const boxTop = testY + this.hitboxOffsetY;
    const boxBottom = boxTop + this.hitboxHeight;

    for (let i = 0; i < mushrooms.length; i++) {
      const m = mushrooms[i];
      if (!m || m.health <= 0) continue;

      const mLeft = m.x;
      const mRight = m.x + TILE_SIZE;
      const mTop = m.y;
      const mBottom = m.y + TILE_SIZE;

      if (
        boxLeft < mRight &&
        boxRight > mLeft &&
        boxTop < mBottom &&
        boxBottom > mTop
      ) {
        return m;
      }
    }
    return null;
  }

  /**
   * Moves the player with collision detection against mushrooms and corner nudging
   * to smoothly slide and navigate around obstacles.
   */
  handleMovement() {
    let moveX = 0;
    let moveY = 0;

    if (keyIsDown(LEFT_ARROW) || keyIsDown(65 /* A */)) {
      moveX -= this.speed;
    }
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68 /* D */)) {
      moveX += this.speed;
    }
    if (keyIsDown(UP_ARROW) || keyIsDown(87 /* W */)) {
      moveY -= this.speed;
    }
    if (keyIsDown(DOWN_ARROW) || keyIsDown(83 /* S */)) {
      moveY += this.speed;
    }

    if (moveX === 0 && moveY === 0) return;

    const stepX = Math.sign(moveX);
    const totalStepsX = Math.abs(moveX);

    const stepY = Math.sign(moveY);
    const totalStepsY = Math.abs(moveY);

    let blockedMushroomX = null;
    let blockedMushroomY = null;

    // ── Horizontal movement ──────────────────────────────────────────
    for (let s = 0; s < totalStepsX; s++) {
      const nextX = constrain(this.x + stepX, 0, CANVAS_WIDTH - this.width);
      const hit = this.checkMushroomCollision(nextX, this.y);
      if (!hit) {
        this.x = nextX;
      } else {
        blockedMushroomX = hit;
        break;
      }
    }

    // ── Vertical movement ────────────────────────────────────────────
    for (let s = 0; s < totalStepsY; s++) {
      const nextY = constrain(this.y + stepY, PLAYER_AREA_Y, CANVAS_HEIGHT - this.height);
      const hit = this.checkMushroomCollision(this.x, nextY);
      if (!hit) {
        this.y = nextY;
      } else {
        blockedMushroomY = hit;
        break;
      }
    }

    // ── Corner Nudging (Rodear obstáculos) ───────────────────────────
    // If blocked in one axis and moving purely along that axis, nudge around the mushroom
    if (blockedMushroomY && moveX === 0) {
      const mCenterX = blockedMushroomY.x + TILE_SIZE / 2;
      const pCenterX = this.x + this.width / 2;
      if (pCenterX >= mCenterX) {
        const nudgeX = constrain(this.x + 1, 0, CANVAS_WIDTH - this.width);
        if (!this.checkMushroomCollision(nudgeX, this.y)) {
          this.x = nudgeX;
        }
      } else {
        const nudgeX = constrain(this.x - 1, 0, CANVAS_WIDTH - this.width);
        if (!this.checkMushroomCollision(nudgeX, this.y)) {
          this.x = nudgeX;
        }
      }
    } else if (blockedMushroomX && moveY === 0) {
      const mCenterY = blockedMushroomX.y + TILE_SIZE / 2;
      const pCenterY = this.y + this.height / 2;
      if (pCenterY >= mCenterY) {
        const nudgeY = constrain(this.y + 1, PLAYER_AREA_Y, CANVAS_HEIGHT - this.height);
        if (!this.checkMushroomCollision(this.x, nudgeY)) {
          this.y = nudgeY;
        }
      } else {
        const nudgeY = constrain(this.y - 1, PLAYER_AREA_Y, CANVAS_HEIGHT - this.height);
        if (!this.checkMushroomCollision(this.x, nudgeY)) {
          this.y = nudgeY;
        }
      }
    }
  }

  /**
   * Checks collisions with centipedes and spiders.
   * Initiates the death animation if contact occurs.
   */
  checkEnemyCollision() {
    if (this.isDying || this.invulnerableTimer > 0) return;

    const pBoxLeft = this.x + this.hitboxOffsetX;
    const pBoxRight = pBoxLeft + this.hitboxWidth;
    const pBoxTop = this.y + this.hitboxOffsetY;
    const pBoxBottom = pBoxTop + this.hitboxHeight;

    // 1. Centipedes
    if (typeof centipedes !== 'undefined' && Array.isArray(centipedes)) {
      for (let i = 0; i < centipedes.length; i++) {
        const centipede = centipedes[i];
        if (!centipede || !centipede.segments) continue;

        for (let j = 0; j < centipede.segments.length; j++) {
          const seg = centipede.segments[j];
          if (!seg) continue;

          const segLeft = seg.x;
          const segRight = seg.x + TILE_SIZE;
          const segTop = seg.y;
          const segBottom = seg.y + TILE_SIZE;

          if (
            pBoxLeft < segRight &&
            pBoxRight > segLeft &&
            pBoxTop < segBottom &&
            pBoxBottom > segTop
          ) {
            this.die();
            return;
          }
        }
      }
    }

    // 2. Spider (supports global spiders array or spider instance)
    const spiderList = [];
    if (typeof spiders !== 'undefined' && Array.isArray(spiders)) {
      spiderList.push(...spiders);
    }
    if (typeof spider !== 'undefined' && spider) {
      spiderList.push(spider);
    }

    for (let k = 0; k < spiderList.length; k++) {
      const sp = spiderList[k];
      if (!sp || sp.isActive === false || sp.alive === false || sp.isDead === true) continue;

      const spX = typeof sp.getX === 'function' ? sp.getX() : sp.x;
      const spY = typeof sp.getY === 'function' ? sp.getY() : sp.y;
      const spW = typeof sp.getWidth === 'function' ? sp.getWidth() : (sp.width || sp.w || TILE_SIZE);
      const spH = typeof sp.getHeight === 'function' ? sp.getHeight() : (sp.height || sp.h || TILE_SIZE);

      if (
        pBoxLeft < spX + spW &&
        pBoxRight > spX &&
        pBoxTop < spY + spH &&
        pBoxBottom > spY
      ) {
        this.die();
        return;
      }
    }
  }

  /**
   * Starts the player death animation and disables controls.
   * Plays the death sound (Dead.wav) upon losing a life / enemy collision.
   */
  die() {
    if (this.isDying) return;
    this.isDying = true;
    this.deathFrameIndex = 0;
    this.deathTimer = 0;
    this.playDeathSound();
  }

  /**
   * Plays the player death sound effect (Dead.wav).
   */
  playDeathSound() {
    if (typeof playSound === 'function' && typeof SOUNDS !== 'undefined') {
      playSound(SOUNDS.dead);
    } else if (typeof SOUNDS !== 'undefined' && SOUNDS.dead) {
      try {
        SOUNDS.dead.currentTime = 0;
        SOUNDS.dead.play().catch(() => {});
      } catch (e) {}
    }
  }

  /**
   * Plays the bullet shoot sound effect (Shoot.wav).
   */
  playShootSound() {
    if (typeof playSound === 'function' && typeof SOUNDS !== 'undefined') {
      playSound(SOUNDS.shoot);
    } else if (typeof SOUNDS !== 'undefined' && SOUNDS.shoot) {
      try {
        SOUNDS.shoot.currentTime = 0;
        SOUNDS.shoot.play().catch(() => {});
      } catch (e) {}
    }
  }

  /**
   * Called when the death animation sequence finishes all frames.
   * Decrements lives, resets player position, or triggers game over.
   */
  onDeathComplete() {
    if (typeof lives !== 'undefined') {
      lives--;
      if (lives <= 0) {
        if (typeof gameState !== 'undefined') {
          gameState = 'ENDGAME';
        }
        this.isDying = false;
        return;
      }
    }

    // Respawn player
    this.isDying = false;
    this.deathFrameIndex = 0;
    this.deathTimer = 0;
    this.x = this.startX;
    this.y = this.startY;
    this.shootCooldown = 20;
    this.burstBulletsRemaining = 0;
    this.invulnerableTimer = 60; // 1 second invulnerability on respawn
  }

  /**
   * Handles player update, movement, enemy collision, and death animation sequence.
   */
  update() {
    // ── Death sequence tick ──────────────────────────────────────────
    if (this.isDying) {
      this.deathTimer++;
      if (this.deathTimer >= PLAYER_DEATH_FRAME_DELAY) {
        this.deathTimer = 0;
        this.deathFrameIndex++;
        if (this.deathFrameIndex >= PLAYER_DEATH_SPRITES.length) {
          this.onDeathComplete();
        }
      }
      return;
    }

    // ── Invulnerability countdown ────────────────────────────────────
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer--;
    }

    // ── Movement & Mushroom obstacle avoidance ───────────────────────
    this.handleMovement();

    // ── Enemy collision checks ───────────────────────────────────────
    this.checkEnemyCollision();

    // ── Cooldown tick ────────────────────────────────────────────────
    if (this.shootCooldown > 0) {
      this.shootCooldown--;
    }
  }

  /**
   * Scans global mushrooms and active centipede segments to find the closest entity
   * located directly in the bullet's vertical firing path (same column/trajectory).
   * Prevents entities in adjacent columns from triggering rapid bursts.
   * @returns {number} The vertical distance (Y) to the closest entity above, or Infinity if none.
   */
  getClosestEntityDistanceY() {
    let minDistance = Infinity;

    const bulletWidth = PLAYER_SPRITES.bullet.w * SPRITE_SCALE;
    const bulletSpawnX = this.x + Math.floor(this.width / 2) - Math.floor(bulletWidth / 2);
    const bulletCenterX = bulletSpawnX + bulletWidth / 2;

    const scanEntities = (entityList) => {
      if (!entityList || !Array.isArray(entityList)) return;

      for (let i = 0; i < entityList.length; i++) {
        const entity = entityList[i];
        if (!entity) continue;
        if (entity.isActive === false || entity.isDestroyed === true || entity.alive === false) continue;
        if (typeof entity.health === 'number' && entity.health <= 0) continue;

        const entX = typeof entity.getX === 'function' ? entity.getX() : entity.x;
        const entY = typeof entity.getY === 'function' ? entity.getY() : entity.y;
        if (typeof entX !== 'number' || typeof entY !== 'number') continue;

        const entWidth = typeof entity.getWidth === 'function' ? entity.getWidth() : (entity.width || entity.w || TILE_SIZE);
        const entHeight = typeof entity.getHeight === 'function' ? entity.getHeight() : (entity.height || entity.h || TILE_SIZE);

        const entCenterX = entX + entWidth / 2;

        // The bullet travels along bulletCenterX; only objects directly in its path collide
        const inBulletPath = Math.abs(bulletCenterX - entCenterX) < COLLISION_RADIUS;
        const isAbove = (entY + entHeight / 2) < this.y;

        if (inBulletPath && isAbove) {
          const distanceY = Math.max(0, this.y - (entY + entHeight));
          if (distanceY < minDistance) {
            minDistance = distanceY;
          }
        }
      }
    };

    if (typeof mushrooms !== 'undefined') {
      scanEntities(mushrooms);
    }
    if (typeof centipedes !== 'undefined' && Array.isArray(centipedes)) {
      for (let i = 0; i < centipedes.length; i++) {
        const c = centipedes[i];
        if (c && Array.isArray(c.segments)) {
          scanEntities(c.segments);
        }
      }
    }
    if (typeof centipedeSegments !== 'undefined' && Array.isArray(centipedeSegments) && centipedeSegments.length > 0) {
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
   * Only fires in rapid burst when a target is directly ahead in the firing line.
   * Centered horizontally relative to the player's current width.
   * @param {p5.Image} bulletSprite - Pre-extracted sprite image for the bullet.
   */
  shoot(bulletSprite) {
    if (this.isDying) return;

    if (this.shootCooldown <= 0) {
      const bulletWidth = PLAYER_SPRITES.bullet.w * SPRITE_SCALE;
      const spawnX = this.x + Math.floor(this.width / 2) - Math.floor(bulletWidth / 2);
      const spawnY = this.y;

      bullets.push(new Bullet(spawnX, spawnY, bulletSprite));

      const closestDistance = this.getClosestEntityDistanceY();
      const hasTargetAbove = Number.isFinite(closestDistance);

      if (!hasTargetAbove) {
        // No target directly ahead: fire single shots at normal cadence
        this.burstBulletsRemaining = 0;
        this.shootCooldown = NORMAL_SHOOT_COOLDOWN;
      } else if (this.burstBulletsRemaining > 0) {
        this.burstBulletsRemaining--;
        if (this.burstBulletsRemaining === 0) {
          this.shootCooldown = this.calculateDynamicCooldown(closestDistance);
        } else {
          this.shootCooldown = RAPID_SHOOT_COOLDOWN;
        }
      } else {
        this.burstBulletsRemaining = BURST_BULLET_COUNT;
        this.burstBulletsRemaining--;
        this.shootCooldown = RAPID_SHOOT_COOLDOWN;
      }
    }
  }

  /**
   * Retrieves and caches the death animation sprites for the current palette,
   * ensuring all solid black background pixels are converted to transparent.
   * @param {number} frameIndex
   * @returns {p5.Image|null}
   */
  getDeathSprite(frameIndex) {
    const levelKey = typeof currentLevel !== 'undefined' ? currentLevel : 1;
    if (!this._deathSpriteCache || this._deathSpriteCacheLevel !== levelKey) {
      this._deathSpriteCacheLevel = levelKey;
      this._deathSpriteCache = [];
      const paletteIndex = (levelKey - 1) % PALETTE_OFFSETS.length;
      const p = PALETTE_OFFSETS[paletteIndex];

      if (typeof spriteSheet !== 'undefined' && spriteSheet) {
        for (let i = 0; i < PLAYER_DEATH_SPRITES.length; i++) {
          const frame = PLAYER_DEATH_SPRITES[i];
          const img = spriteSheet.get(p.x + frame.x, p.y + frame.y, frame.w, frame.h);
          this.makeBlackTransparent(img);
          this._deathSpriteCache.push(img);
        }
      }
    }
    return this._deathSpriteCache ? this._deathSpriteCache[frameIndex] : null;
  }

  /**
   * Renders the player sprite or death disappearance sequence.
   * Shows the shooting frame during the first quarter of the cooldown,
   * otherwise shows the idle frame.
   * Uses Math.floor() to pixel-snap and prevent sub-pixel texture bleeding.
   */
  render() {
    // ── Death animation sequence ─────────────────────────────────────
    if (this.isDying) {
      if (this.deathFrameIndex < PLAYER_DEATH_SPRITES.length) {
        const frame = PLAYER_DEATH_SPRITES[this.deathFrameIndex];
        const deathImg = this.getDeathSprite(this.deathFrameIndex);

        const renderWidth = frame.w * SPRITE_SCALE;
        const renderHeight = frame.h * SPRITE_SCALE;

        // Centered on the player's entity center
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const drawX = Math.floor(centerX - renderWidth / 2);
        const drawY = Math.floor(centerY - renderHeight / 2);

        if (deathImg) {
          image(
            deathImg,
            drawX,
            drawY,
            renderWidth,
            renderHeight
          );
        }
      }
      return;
    }

    // ── Flicker during respawn invulnerability ───────────────────────
    if (this.invulnerableTimer > 0 && Math.floor(this.invulnerableTimer / 4) % 2 === 0) {
      return;
    }

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

