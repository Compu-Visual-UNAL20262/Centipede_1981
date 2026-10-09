let score;
let lives;
let gameState;
let currentLevel;

let mushrooms;
let centipedes;
let bullets;

let player;
let gridManager;

let spriteSheet;
let playerSprites;
let bulletSprite;
let mushroomSprites;
let centipedeSprites;
let spiderSprites;

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

  spiderSprites ={
    spiderA: spriteSheet.get(p.x + SPIDER_SPRITES.spiderA.x, p.y + SPIDER_SPRITES.spiderA.y, SPIDER_SPRITES.spiderA.w, SPIDER_SPRITES.spiderA.h),
    spiderB: spriteSheet.get(p.x + SPIDER_SPRITES.spiderB.x, p.y + SPIDER_SPRITES.spiderB.y, SPIDER_SPRITES.spiderB.w, SPIDER_SPRITES.spiderB.h),
    spiderC: spriteSheet.get(p.x + SPIDER_SPRITES.spiderC.x, p.y + SPIDER_SPRITES.spiderC.y, SPIDER_SPRITES.spiderC.w, SPIDER_SPRITES.spiderC.h),
  }

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
    spider = null;
    
    gameState = 'START';

    currentLevel = 1;
    updateLevelSprites();

     gridManager = new GridManager();

}

function draw() {
  background(0);

  switch (gameState) {
    case 'START':
      fill(255);
      textSize(20);
      textAlign(CENTER, CENTER);
      text("CENTIPEDE\nPress ENTER to start", width / 2, height / 2);
      break;

    case 'INGAME':

      for (let m of mushrooms) {
        m.render();
      }

      for (let c of centipedes) {
        c.update();
        c.render();
      }

      if (spider) {
        spider.update();
        spider.render();
        if (spider.isOutOfBoundX()) {
          spider = null;
        }
      } else {
        if (random() < SPIDER_SPAWN_CHANCE) {
          spider = new Spider(spiderSprites);
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

        checkCollisions();

        drawUI();
        break;    
    
    case 'ENDGAME':
      text("CENTIPEDE\nPress ENTER to start", width / 2, height / 2);
      break;
  }
}

function drawRetroScore(scoreValue, yPosition) {
  let scoreStr = String(scoreValue);
  let charSize = 8; 
  let renderSize = 16; 
  
  let totalWidth = scoreStr.length * renderSize;
  let startX = (width / 2) - (totalWidth / 2);

  for (let i = 0; i < scoreStr.length; i++) {
   
    let d = int(scoreStr[i]);
    let paletteIndex = (currentLevel - 1) % PALETTE_OFFSETS.length;
    let p = PALETTE_OFFSETS[paletteIndex];
    let sx = p.x + d * 9;
    let sy = p.y + 108;
    let dx = startX + i * renderSize;
    let dy = yPosition;

    
    image(spriteSheet, dx, dy, renderSize, renderSize, sx, sy, charSize, charSize);

  }
}

function levelUp() {
  currentLevel++;
  bullets = [];
  updateLevelSprites();
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

        if (dist(b.x, b.y, segment.x, segment.y) < COLLISION_RADIUS) {
          b.isActive = false;
          score += 5; // TODO: ESTO ES PARA CORREGIR. PONER EL PUNTAJE CORRECTO

          if (segment.isHead) {
            score += 15; // Tal vez matar una cabeza de bonus :p 
            mushrooms.push(
              new Mushroom(segment.col, segment.row)
            );
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

    if (spider) {
      if (dist(b.x, b.y, spider.x, spider.y) < COLLISION_RADIUS) {
        b.isActive = false;
        score += 10; // TODO: ESTO ES PARA CORREGIR. PONER EL PUNTAJE CORRECTO
        spider = null; 
        break;
      }

      for (let m = mushrooms.length - 1; m >= 0; m--) {
        let mushroom = mushrooms[m];
        let mCenterX = mushroom.x + TILE_SIZE / 2;
        let mCenterY = mushroom.y + TILE_SIZE / 2;
        if (dist(spider.x, spider.y, mCenterX, mCenterY) < COLLISION_RADIUS) {
          mushrooms.splice(m, 1);
        }
      }
    }
  }
}

function startNewGame() {
    score=0;
    lives=3;
    currentLevel=1;

    gameState= 'INGAME';

    player = new Player(CANVAS_WIDTH / 2, CANVAS_HEIGHT - TILE_SIZE * 2, playerSprites);
    bullets = [];

    gridManager.generateLevel();

    let tmp;
    tmp = [];
    for (let i = 0; i < CENTIPEDE_LENGTH; i++) {
      tmp.push(new CentipedeSegment(INITIAL_X_CENTIPEDE + i, INITIAL_Y_CENTIPEDE, -1, i === 0, centipedeSprites));
    }
    centipedes.push(new Centipede(tmp));


}

function drawUI() {
  fill(255);
  noStroke();
  textSize(18);
  textAlign(CENTER, TOP);

   
  drawRetroScore(score, 10);
  
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