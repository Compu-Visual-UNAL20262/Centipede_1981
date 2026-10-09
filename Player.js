// Player.js

class Player {
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

    this.hitboxOffsetX = 0;
    this.hitboxOffsetY = 0;
    this.hitboxWidth = this.width;
    this.hitboxHeight = this.height;

    this.isDying = false;
    this.deathFrameIndex = 0;
    this.deathTimer = 0;
    this.invulnerableTimer = 0;

    this.sprites = sprites;
  }

  get sprites() {
    return this._sprites;
  }

  // Convert solid black background pixels to transparent to prevent overwriting adjacent tiles
  set sprites(val) {
    this._sprites = val;
    if (val) {
      if (val.idle) this.makeBlackTransparent(val.idle);
      if (val.shooting) this.makeBlackTransparent(val.shooting);
    }
  }

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

    // Corner nudging to smoothly slide around mushroom obstacles
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

  checkEnemyCollision() {
    if (this.isDying || this.invulnerableTimer > 0) return;

    const pBoxLeft = this.x + this.hitboxOffsetX;
    const pBoxRight = pBoxLeft + this.hitboxWidth;
    const pBoxTop = this.y + this.hitboxOffsetY;
    const pBoxBottom = pBoxTop + this.hitboxHeight;

    // Centipede collision
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

    // Spider collision
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

    // Flea collision
    const fleaList = [];
    if (typeof fleas !== 'undefined' && Array.isArray(fleas)) {
      fleaList.push(...fleas);
    }
    if (typeof flea !== 'undefined' && flea) {
      fleaList.push(flea);
    }

    for (let f = 0; f < fleaList.length; f++) {
      const fl = fleaList[f];
      if (!fl || fl.isActive === false) continue;

      const flX = typeof fl.getX === 'function' ? fl.getX() : fl.x;
      const flY = typeof fl.getY === 'function' ? fl.getY() : fl.y;
      const flW = typeof fl.getWidth === 'function' ? fl.getWidth() : (fl.width || TILE_SIZE);
      const flH = typeof fl.getHeight === 'function' ? fl.getHeight() : (fl.height || TILE_SIZE);

      if (
        pBoxLeft < flX + flW &&
        pBoxRight > flX &&
        pBoxTop < flY + flH &&
        pBoxBottom > flY
      ) {
        this.die();
        return;
      }
    }
  }

  die() {
    if (this.isDying) return;
    this.isDying = true;
    this.deathFrameIndex = 0;
    this.deathTimer = 0;
    this.playDeathSound();
  }

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

    this.isDying = false;
    this.deathFrameIndex = 0;
    this.deathTimer = 0;
    this.x = this.startX;
    this.y = this.startY;
    this.shootCooldown = 20;
    this.burstBulletsRemaining = 0;
    this.invulnerableTimer = 60; // 1 second invulnerability on respawn

    if (typeof spawnCentipede === 'function') {
      spawnCentipede();
    }
    if (typeof bullets !== 'undefined') {
      bullets = [];
    }
  }

  update() {
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

    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer--;
    }

    this.handleMovement();
    this.checkEnemyCollision();

    if (this.shootCooldown > 0) {
      this.shootCooldown--;
    }
  }

  // Find vertical distance to the closest entity aligned in the bullet path
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

  render() {
    if (this.isDying) {
      if (this.deathFrameIndex < PLAYER_DEATH_SPRITES.length) {
        const frame = PLAYER_DEATH_SPRITES[this.deathFrameIndex];
        const deathImg = this.getDeathSprite(this.deathFrameIndex);

        const renderWidth = frame.w * SPRITE_SCALE;
        const renderHeight = frame.h * SPRITE_SCALE;

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

    // Flicker during respawn invulnerability
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

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  getWidth() {
    return this.width;
  }

  getHeight() {
    return this.height;
  }

  getSpeed() {
    return this.speed;
  }

  getShootCooldown() {
    return this.shootCooldown;
  }

  getBurstBulletsRemaining() {
    return this.burstBulletsRemaining;
  }
}
