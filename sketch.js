let score;
let lives;
let gameState;
let currentLevel;

let mushrooms;
let centipedeSegments;
let bullets;

let player;
let gridManager;

let spriteSheet;
let playerSprites;
let bulletSprite;

function updateLevelSprites() {
  let paletteIndex = (currentLevel - 1) % PALETTE_OFFSETS.length;
  let p = PALETTE_OFFSETS[paletteIndex];

  playerSprites = {
    idle: spriteSheet.get(p.x + PLAYER_SPRITES.idle.x, p.y + PLAYER_SPRITES.idle.y, PLAYER_SPRITES.idle.w, PLAYER_SPRITES.idle.h),
    shooting: spriteSheet.get(p.x + PLAYER_SPRITES.shooting.x, p.y + PLAYER_SPRITES.shooting.y, PLAYER_SPRITES.shooting.w, PLAYER_SPRITES.shooting.h)
  };

  bulletSprite = spriteSheet.get(p.x + PLAYER_SPRITES.bullet.x, p.y + PLAYER_SPRITES.bullet.y, PLAYER_SPRITES.bullet.w, PLAYER_SPRITES.bullet.h);

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
    
    gameState = 'START';

    currentLevel = 1;
    updateLevelSprites();

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

function startNewGame() {
    score=0;
    lives=3;
    currentLevel=1;

    gameState= 'INGAME';

    player = new Player(CANVAS_WIDTH / 2, CANVAS_HEIGHT - TILE_SIZE * 2, playerSprites);
    bullets = [];

}

function drawUI() {
  fill(255);
  noStroke();
  textSize(18);
  textAlign(CENTER, TOP);

   // 1. Puntaje en el centro superior con tu función retro
  drawRetroScore(score, 10);
  // 2. Iconos de vidas en la esquina superior izquierda
  let startX = 16;
  let lifeY = 10;
  let iconWidth = 12;
  let iconHeight = 16;
  let spacing = 16;
  for (let i = 0; i < lives; i++) {
    let currentX = startX + i * spacing;
    // Dibuja el sprite de la nave del jugador:
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