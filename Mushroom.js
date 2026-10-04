class Mushroom {
  constructor(col, row) {
    this.col = col;
    this.row = row;

    this.x = col * TILE_SIZE;
    this.y = row * TILE_SIZE;

    this.health = 4;

    this.sprite = mushroomSprites;
  }

  render() {

    let currentSprite;

    // The mushroom changes appearance according to its health.
    if (this.health === 4) {
      currentSprite = mushroomSprites.life_4;
    } else if (this.health === 3) {
      currentSprite = mushroomSprites.life_3;
    } else if (this.health === 2) {
      currentSprite = mushroomSprites.life_2;
    } else if (this.health === 1) {
      currentSprite = mushroomSprites.life_1;
    }

    image(
      currentSprite,
      Math.floor(this.x),
      Math.floor(this.y),
      TILE_SIZE,
      TILE_SIZE
    );
  }

  takeDamage() {
    this.health -= 1;

    return this.health <= 0;
  }
}