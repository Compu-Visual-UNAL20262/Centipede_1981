// GridManager.js
class GridManager {
  constructor() {
    this.playerAreaStartRow = floor(PLAYER_AREA_Y / TILE_SIZE);
    this.area = ROWS - 2;
  }

  generateLevel() {
    mushrooms.length = 0;

    for (let row = 3; row < this.area; row++) {
      for (let col = 0; col < COLS; col++) {
        if (random() < MUSHROOM_PROBABILITY) {
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

    if (typeof gameState !== 'undefined' && (gameState === 'START' || gameState === 'ENDGAME')) {
      if (typeof hasHighScoreTextAt === 'function' && hasHighScoreTextAt(targetCol, targetRow)) {
        return true;
      }
    }

    return false;
  }
}