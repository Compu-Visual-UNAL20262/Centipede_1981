class Centipede {
  constructor(segments, moveDelay = 10) {
    this.segments = segments;

    this.moveDelay = moveDelay;
    this.moveCounter = 0;

    this.animationCounter = 0;
    this.animationDelay = 10;
  }

  update() {
    this.moveCounter++;
    this.animationCounter++;

    if (this.animationCounter >= this.animationDelay) {
      this.animationCounter = 0;

      for (const segment of this.segments) {
        segment.changeSprite();
      }
    }

    if (this.moveCounter < this.moveDelay) {
      return;
    }

    this.moveCounter = 0;

    this.move();
    this.increaseSpeed();
  }

  move() {
    if (this.segments.length === 0) {
      return;
    }

    const head = this.segments[0];

    let nextCol = head.col + head.xDir;

    let outOfBoundX = nextCol < 0 || nextCol >= COLS;
    let outOfBoundY = head.row + head.yDir >= ROWS || head.row + head.yDir <= 0;


    const previousPositions = this.segments.map(segment => ({
      col: segment.col,
      row: segment.row
    }));


    if (outOfBoundX || gridManager.hasMushroomAt(nextCol, head.row)) {
      head.moveDownRow();
    } else { 
      head.col += head.xDir;
    }

    if (outOfBoundY) {
      head.yDir *= -1;
    }

    
    head.x = head.col * TILE_SIZE;
    head.y = head.row * TILE_SIZE;

    for (let i = 1; i < this.segments.length; i++) {
      const segment = this.segments[i];
      const previous = previousPositions[i - 1];

      segment.setPosition(previous.col, previous.row);
    }
  }

  render() {
    for (const segment of this.segments) {

      if ((this.moveCounter) % floor(this.moveDelay/1.5) === 0) {
        segment.changeSprite();
      }
      segment.render();
    }
  }

  isDead() {
    return this.segments.length === 0;
  }

  increaseSpeed(amount = 0.01) {
    this.moveDelay = max(MIN_CENTIPEDE_SPEED, this.moveDelay - amount);
  }

  hitSegment(index) {
    const newSegments = this.segments.splice(index + 1);
    this.segments.splice(index, 1);

    if (newSegments.length === 0) {
      return null;
    }

    const newHead = newSegments[0];
    newHead.becomeHead();

    if (this.segments.length > 0) {
      const oldHead = this.segments[0];

      newHead.xDir = oldHead.xDir;
      newHead.yDir = oldHead.yDir;
    }

    return new Centipede(newSegments, this.moveDelay);
  }
}