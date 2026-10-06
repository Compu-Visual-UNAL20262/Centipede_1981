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
  }

  render() {
    const currentSprite = this.isHead ? this.sprites.centipedeHead : this.sprites.centipedeBody;
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

  move(){
    let nextCol = this.col + this.xDir;
    let outOfBoundX = nextCol < 0 || nextCol >= COLS;
    let outOfBoundY = this.row + this.yDir >= gridManager.playerAreaStartRow || this.row + this.yDir <= 0;

    if ( outOfBoundX || gridManager.hasMushroomAt(nextCol, this.row)) {
      this.xDir *= -1;
      this.row += this.yDir;
      console.log(this.yDir)
    }
    if (outOfBoundY) {
      this.yDir *= -1;
    }

    this.col += this.xDir;


    this.x = this.col * TILE_SIZE;
    this.y = this.row * TILE_SIZE;
  }
}