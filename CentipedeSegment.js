// CentipedeSegment.js
class CentipedeSegment {
    constructor(col, row, xDir, isHead, sprites) {
      this.col = col;
      this.row = row;
      this.x = col * TILE_SIZE;
      this.y = row * TILE_SIZE;

      this.xDir = xDir;
      this.yDir = 1;
      this.isHead = isHead;
      this.sprites = sprites;
      this.bodySprites = [
        this.sprites.centipedeBodyA,
        this.sprites.centipedeBodyB,
        this.sprites.centipedeBodyC,
        this.sprites.centipedeBodyD,
      ];

      this.bodySpriteIndex = 0;
      this.bodySprite = this.bodySprites[0];      
  }

  changeSprite() {
    this.bodySpriteIndex++;

    if (this.bodySpriteIndex >= this.bodySprites.length) {
      this.bodySpriteIndex = 0;
    }

    this.bodySprite = this.bodySprites[this.bodySpriteIndex];
  }

  render() {
    const currentSprite = this.isHead ? this.sprites.centipedeHead : this.bodySprite;
    const renderWidth = currentSprite.width * SPRITE_SCALE;
    const renderHeight = currentSprite.height * SPRITE_SCALE;
    image(
      currentSprite,
      Math.floor(this.x),
      Math.floor(this.y),
      renderWidth,
      renderHeight
    );
  }

  moveDownRow(){
    this.xDir *= -1;
    this.row += this.yDir;
  }

  setPosition(col, row) {
    this.col = col;
    this.row = row;

    this.x = col * TILE_SIZE;
    this.y = row * TILE_SIZE;
  }

  becomeHead() {
    this.isHead = true;
  }
}