class Mushroom {
  constructor(col, row) {
    this.col = col;
    this.row = row;

    this.x = col * TILE_SIZE;
    this.y = row * TILE_SIZE;

    this.health = 4;

    this.sprite = MUSHROOM_SPRITES;
  }

  render() {

    let currentSprite;

    // The mushroom changes appearance according to its health.
    if (this.health === 4) {
      currentSprite = this.sprite.life_4;
    } else if (this.health === 3) {
      currentSprite = this.sprite.life_3;
    } else if (this.health === 2) {
      currentSprite = this.sprite.life_2;
    } else if (this.health === 1) {
      currentSprite = this.sprite.life_1;
    }

    image(
      currentSprite,
      Math.floor(this.x),
      Math.floor(this.y),
      currentSprite.w,
      currentSprite.h
    );
  }

  takeDamage() {
    this.health -= 1;

    return this.health <= 0;
  }
}