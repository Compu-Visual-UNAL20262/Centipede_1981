let score;
let lives;
let gameState;
let currentLevel;

let mushrooms;
let centipedes;
let bullets;
let explosions;
let flea;

let player;
let gridManager;

let spriteSheet;
let playerSprites;
let bulletSprite;
let mushroomSprites;
let centipedeSprites;
let spiderSprites;
let fleaSprites;

function updateLevelSprites() {
  let paletteIndex = (currentLevel - 1) % PALETTE_OFFSETS.length;
  let p = PALETTE_OFFSETS[paletteIndex];

  mushroomSprites = {
    life_4: spriteSheet.get(p.x + MUSHROOM_SPRITES.life_4.x, p.y + MUSHROOM_SPRITES.life_4.y, MUSHROOM_SPRITES.life_4.w, MUSHROOM_SPRITES.life_4.h),
    life_3: spriteSheet.get(p.x + MUSHROOM_SPRITES.life_3.x, p.y + MUSHROOM_SPRITES.life_3.y, MUSHROOM_SPRITES.life_3.w, MUSHROOM_SPRITES.life_3.h),
    life_2: spriteSheet.get(p.x + MUSHROOM_SPRITES.life_2.x, p.y + MUSHROOM_SPRITES.life_2.y, MUSHROOM_SPRITES.life_2.w, MUSHROOM_SPRITES.life_2.h),
    life_1: spriteSheet.get(p.x + MUSHROOM_SPRITES.destroyed.x, p.y + MUSHROOM_SPRITES.destroyed.y, MUSHROOM_SPRITES.destroyed.w, MUSHROOM_SPRITES.destroyed.h)
  };

  playerSprites = {
    idle: spriteSheet.get(p.x + PLAYER_SPRITES.idle.x, p.y + PLAYER_SPRITES.idle.y, PLAYER_SPRITES.idle.w, PLAYER_SPRITES.idle.h),
    shooting: spriteSheet.get(p.x + PLAYER_SPRITES.shooting.x, p.y + PLAYER_SPRITES.shooting.y, PLAYER_SPRITES.shooting.w, PLAYER_SPRITES.shooting.h)
  };

  bulletSprite = spriteSheet.get(p.x + PLAYER_SPRITES.bullet.x, p.y + PLAYER_SPRITES.bullet.y, PLAYER_SPRITES.bullet.w, PLAYER_SPRITES.bullet.h);

  centipedeSprites = {
    centipedeHead: spriteSheet.get(p.x + CENTIPEDE_SPRITES.centipedeHead.x, p.y + CENTIPEDE_SPRITES.centipedeHead.y, CENTIPEDE_SPRITES.centipedeHead.w, CENTIPEDE_SPRITES.centipedeHead.h),
    centipedeBodyA: spriteSheet.get(p.x + CENTIPEDE_SPRITES.centipedeBodyA.x, p.y + CENTIPEDE_SPRITES.centipedeBodyA.y, CENTIPEDE_SPRITES.centipedeBodyA.w, CENTIPEDE_SPRITES.centipedeBodyA.h),
    centipedeBodyB: spriteSheet.get(p.x + CENTIPEDE_SPRITES.centipedeBodyB.x, p.y + CENTIPEDE_SPRITES.centipedeBodyB.y, CENTIPEDE_SPRITES.centipedeBodyB.w, CENTIPEDE_SPRITES.centipedeBodyB.h),
    centipedeBodyC: spriteSheet.get(p.x + CENTIPEDE_SPRITES.centipedeBodyC.x, p.y + CENTIPEDE_SPRITES.centipedeBodyC.y, CENTIPEDE_SPRITES.centipedeBodyC.w, CENTIPEDE_SPRITES.centipedeBodyC.h),
    centipedeBodyD: spriteSheet.get(p.x + CENTIPEDE_SPRITES.centipedeBodyD.x, p.y + CENTIPEDE_SPRITES.centipedeBodyD.y, CENTIPEDE_SPRITES.centipedeBodyD.w, CENTIPEDE_SPRITES.centipedeBodyD.h),
  }

  spiderSprites = {
    spiderA: spriteSheet.get(p.x + SPIDER_SPRITES.spiderA.x, p.y + SPIDER_SPRITES.spiderA.y, SPIDER_SPRITES.spiderA.w, SPIDER_SPRITES.spiderA.h),
    spiderB: spriteSheet.get(p.x + SPIDER_SPRITES.spiderB.x, p.y + SPIDER_SPRITES.spiderB.y, SPIDER_SPRITES.spiderB.w, SPIDER_SPRITES.spiderB.h),
    spiderC: spriteSheet.get(p.x + SPIDER_SPRITES.spiderC.x, p.y + SPIDER_SPRITES.spiderC.y, SPIDER_SPRITES.spiderC.w, SPIDER_SPRITES.spiderC.h),
  }

  explosionSprites = {
    explosionA: spriteSheet.get(p.x + EXPLOSION_SPRITES.explosionA.x, p.y + EXPLOSION_SPRITES.explosionA.y, EXPLOSION_SPRITES.explosionA.w, EXPLOSION_SPRITES.explosionA.h),
    explosionB: spriteSheet.get(p.x + EXPLOSION_SPRITES.explosionB.x, p.y + EXPLOSION_SPRITES.explosionB.y, EXPLOSION_SPRITES.explosionB.w, EXPLOSION_SPRITES.explosionB.h),
    explosionC: spriteSheet.get(p.x + EXPLOSION_SPRITES.explosionC.x, p.y + EXPLOSION_SPRITES.explosionC.y, EXPLOSION_SPRITES.explosionC.w, EXPLOSION_SPRITES.explosionC.h),

  }

  fleaSprites = FLEA_SPRITES.map(s =>
    spriteSheet.get(p.x + s.x, p.y + s.y, s.w, s.h)
  );

  if (player) {
    player.sprites = playerSprites;
  }
}


async function setup() {
  spriteSheet = await loadImage('assets/sprite.png');
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  noSmooth();

  mushrooms = [];
  centipedeSegments = [];
  bullets = [];
  centipedes = [];
  explosions = [];
  spider = null;
  flea = null;

  gameState = 'START';

  currentLevel = 1;
  updateLevelSprites();

  gridManager = new GridManager();
  gridManager.generateLevel();
  spawnCentipede();

}

function draw() {
  background(0);

  switch (gameState) {
    case 'INGAME':

      for (let m of mushrooms) {
        m.render();
      }

      for (let c of centipedes) {
        if (!player.isDying) {
          c.update();
          checkCentipedeCollision();
        }
        c.render();
      }

      if (spider) {
        spider.update();
        spider.render();
        checkSpiderCollision();
        if (spider.isOutOfBoundX()) {
          spider = null;
        }
      } else {
        if (random() < SPIDER_SPAWN_CHANCE) {
          spider = new Spider(spiderSprites);
        }
      }


      if (flea) {
        flea.update(score);
        flea.render();
        if (!flea.isActive) {
          flea = null;
        }
      } else {
        if (random() < 0.005) {
          flea = new Flea(floor(random(COLS)), fleaSprites);
        }
      }

      if (keyIsDown(' ')) {
        player.shoot(bulletSprite);
      }
      player.update();
      player.render();

      for (let i = bullets.length - 1; i >= 0; i--) {
        let b = bullets[i];
        b.move();
        b.render();

        if (!b.isActive) {
          bullets.splice(i, 1);
        }
      }

      for (let i = explosions.length - 1; i >= 0; i--) {
        const explosion = explosions[i];
        explosion.render();

        if (explosion.finished) {
          explosions.splice(i, 1);
        }
      }

      checkCollisions();

      drawUI();
      break;

    case "START":
    case 'ENDGAME':
      for (let m of mushrooms) {
        m.render();
      }
      for (let c of centipedes) {
        c.update();
        c.render();
      }
      score = 16543;
      drawStartScreen();
      break;
  }
}

function drawRetroText(textStr, startX, startY, renderSize = 16, paletteIdx = null) {
  let str = String(textStr).toUpperCase();

  let charW = 8;
  let charH = 8;

  let pIdx = (paletteIdx !== null) ? paletteIdx : ((currentLevel - 1) % PALETTE_OFFSETS.length);
  let p = PALETTE_OFFSETS[pIdx];

  for (let i = 0; i < str.length; i++) {
    let char = str[i];
    let dx = startX + i * renderSize;
    let dy = startY;

    // para los espacios
    if (char === ' ') continue;

    let sx = -1;
    let sy = -1;
    let code = char.charCodeAt(0);

    if (code >= 48 && code <= 57) {
      // 0 al 9
      sx = p.x + (code - 48) * 9;
      sy = p.y + 108;
      charH = 8;
    } else if (code >= 65 && code <= 79) {
      // A a O
      sx = p.x + (code - 65) * 9;
      sy = p.y + 91;
      charH = 7;
    } else if (code >= 80 && code <= 90) {
      // P a Z
      sx = p.x + (code - 80) * 9;
      sy = p.y + 100;
      charH = 7;
    } else if (char === '©' || char === '@') {
      // copyright
      sx = p.x + 99;
      sy = p.y + 100;
      charH = 7;
    } else if (char === ':') {
      // dos puntos
      sx = p.x + 126;
      sy = p.y + 108;
      charH = 8;
    }

    if (sx !== -1 && sy !== -1 && spriteSheet) {
      image(spriteSheet, dx, dy, renderSize, renderSize, sx, sy, charW, charH);
    }
  }
}


function hasHighScoreTextAt(targetCol, targetRow) {
  const startRow = 3;
  const lineIdx = targetRow - startRow;
  if (lineIdx < 0 || lineIdx >= HIGH_SCORES_TEXT.length) return false;

  const line = HIGH_SCORES_TEXT[lineIdx];
  if (!line || line.length === 0) return false;


  const lineStartCol = Math.floor((COLS - line.length) / 2);
  const charIdx = targetCol - lineStartCol;


  if (charIdx >= 0 && charIdx < line.length && line[charIdx] !== ' ') {
    return true;
  }
  return false;
}


function spawnCentipede() {
  centipedes = [];
  let tmp = [];
  for (let i = 0; i < CENTIPEDE_LENGTH; i++) {
    tmp.push(new CentipedeSegment(INITIAL_X_CENTIPEDE + i, INITIAL_Y_CENTIPEDE, -1, i === 0, centipedeSprites));
  }
  centipedes.push(new Centipede(tmp));
}

function levelUp() {
  currentLevel++;
  bullets = [];
  updateLevelSprites();
  spawnCentipede();
}

function checkSpiderCollision() {
  for (let m = mushrooms.length - 1; m >= 0; m--) {
    let mushroom = mushrooms[m];
    let mCenterX = mushroom.x + TILE_SIZE / 2;
    let mCenterY = mushroom.y + TILE_SIZE / 2;
    if (dist(spider.x, spider.y, mCenterX, mCenterY) < COLLISION_RADIUS_SPIDER) {
      mushrooms.splice(m, 1);
    }
  }
}

function checkCentipedeCollision() {
  for (let c = centipedes.length - 1; c >= 0; c--) {
    let centipede = centipedes[c];

    for (let s = c; s >= 0; s--) {
      let otherCentipede = centipedes[s];

      let sameCol = centipede.segments[0].col === otherCentipede.segments[0].col;
      let sameRow = centipede.segments[0].row === otherCentipede.segments[0].row;

      if (sameCol && sameRow && centipede !== otherCentipede) {
        centipedes[c].segments[0].moveDownRow();
      }
    }
  }
}

function checkCollisions() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    let b = bullets[i];
    for (let j = mushrooms.length - 1; j >= 0; j--) {
      let m = mushrooms[j];
      let mCenterX = m.x + TILE_SIZE / 2;
      let mCenterY = m.y + TILE_SIZE / 2;


      if (dist(b.x, b.y, mCenterX, mCenterY) < COLLISION_RADIUS) {
        b.isActive = false;
        bullets.splice(i, 1);


        if (m.takeDamage()) {
          mushrooms.splice(j, 1);
          score += 1;
        }
        break;
      }
    }

    for (let c = centipedes.length - 1; c >= 0; c--) {
      const centipede = centipedes[c];

      for (let s = centipede.segments.length - 1; s >= 0; s--) {
        const segment = centipede.segments[s];

        const segCenterX = segment.x + TILE_SIZE / 2;
        const segCenterY = segment.y + TILE_SIZE / 2;

        if (dist(b.x, b.y, segCenterX, segCenterY) < COLLISION_RADIUS) {
          explosions.push(new Explosion(segment.x, segment.y, explosionSprites));
          mushrooms.push(new Mushroom(segment.col, segment.row));
          b.isActive = false;
          bullets.splice(i, 1);
          score += 5; // TODO: ESTO ES PARA CORREGIR. PONER EL PUNTAJE CORRECTO

          if (segment.isHead) {
            score += 15; // Tal vez matar una cabeza de bonus :p 
          }

          const newCentipede = centipede.hitSegment(s);

          if (newCentipede !== null) {
            centipedes.push(newCentipede);
          }

          if (centipede.isDead()) {
            centipedes.splice(c, 1);
          }
          break;
        }
      }

      if (!b.isActive) {
        break;
      }
    }

    if (b.isActive && spider) {
      const spiderCenterX = spider.x + 15;
      const spiderCenterY = spider.y + 8;

      if (dist(b.x, b.y, spiderCenterX, spiderCenterY) < COLLISION_RADIUS_SPIDER) {
        explosions.push(new Explosion(spider.x, spider.y, explosionSprites));
        b.isActive = false;
        bullets.splice(i, 1);
        score += 10; // TODO: ESTO ES PARA CORREGIR. PONER EL PUNTAJE CORRECTO
        spider = null;
      }
    }

    if (b.isActive && flea) {
      const fleaCenterX = flea.x + TILE_SIZE / 2;
      const fleaCenterY = flea.y + TILE_SIZE / 2;

      if (dist(b.x, b.y, fleaCenterX, fleaCenterY) < COLLISION_RADIUS) {
        b.isActive = false;
        bullets.splice(i, 1);


        if (flea.takeDamage()) {
          explosions.push(new Explosion(flea.x, flea.y, explosionSprites));
          score += (typeof FLEA_POINTS !== 'undefined' ? FLEA_POINTS : 200);
          flea = null;
        }
      }
    }

  }

  if (centipedes.length === 0) {
    levelUp();
  }
}

function startNewGame() {
  score = 0;
  lives = 3;
  currentLevel = 1;
  updateLevelSprites();

  gameState = 'INGAME';

  player = new Player(CANVAS_WIDTH / 2, CANVAS_HEIGHT - TILE_SIZE * 2, playerSprites);
  bullets = [];

  flea = null;

  gridManager.generateLevel();

  spawnCentipede();

  if (typeof SOUNDS !== 'undefined' && SOUNDS.track) {
    SOUNDS.spider.loop = true;
    SOUNDS.spider.currentTime = 0;
    SOUNDS.spider.play().catch(() => { });
  }


}

function drawStartScreen() {
  const startRow = 3;
  const charWidth = 16;
  for (let i = 0; i < HIGH_SCORES_TEXT.length; i++) {
    const line = HIGH_SCORES_TEXT[i];
    if (!line) continue;
    const totalW = line.length * charWidth;
    const x = Math.floor((width - totalW) / 2);
    const y = (startRow + i) * TILE_SIZE;
    drawRetroText(line, x, y, charWidth);
  }

  drawUI();
}

function drawUI() {
  fill(255);
  noStroke();
  textSize(18);
  textAlign(CENTER, TOP);


  let scoreStr = String(score).padStart(2, '0');

  drawRetroText(scoreStr, width / 2 - (scoreStr.length * 16) / 2, 10);

  let startX = 16;
  let lifeY = 10;
  let iconWidth = 12;
  let iconHeight = 16;
  let spacing = 16;
  for (let i = 0; i < lives; i++) {
    let currentX = startX + i * spacing;

    image(playerSprites.idle, currentX, lifeY, iconWidth, iconHeight);
  }
}

function keyPressed() {
  if (key === 'Enter') {
    if (gameState === 'START' || gameState === 'ENDGAME') {
      startNewGame();
    }
  }

  if ((key === 'n' || key === 'N') && gameState === 'INGAME') {
    levelUp();
  }
}
