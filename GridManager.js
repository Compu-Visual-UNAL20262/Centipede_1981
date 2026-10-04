// GridManager.js
class GridManager {
  constructor() {
    this.playerAreaStartRow = floor(PLAYER_AREA_Y / TILE_SIZE);
  }

  generateLevel() {
    mushrooms.length = 0;

    for (let row = 3; row < this.playerAreaStartRow; row++) {
      for (let col = 0; col < COLS; col++) {
        if (random() < 0.10) {
          if (!this.hasMushroomAt(col, row)) {
            mushrooms.push(
              new Mushroom(col, row)
            );
          }
        }
      }
    }
  }

  hasMushroomAt(targetCol, targetRow) {
    for (let mushroom of mushrooms) {
      if (
        mushroom.col === targetCol &&
        mushroom.row === targetRow
      ) {
        return true;
      }
    }

    return false;
  }
}