// Bullet.js

class Bullet {
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

  move() {
    this.y += this.speed;
    if (this.y + this.height < 0) {
      this.isActive = false;
    }
  }

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

  getIsActive() {
    return this.isActive;
  }

  deactivate() {
    this.isActive = false;
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
}
