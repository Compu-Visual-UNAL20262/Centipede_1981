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


async function setup() {
    spriteSheet = await loadImage('assets/sprite.png');
    createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    noSmooth();

    mushrooms = [];
    centipedeSegments = [];
    bullets = [];
    
    gameState = 'START';


    playerSprites = {
        idle: spriteSheet.get(PLAYER_SPRITES.idle.x, PLAYER_SPRITES.idle.y, PLAYER_SPRITES.idle.w, PLAYER_SPRITES.idle.h),
        shooting: spriteSheet.get(PLAYER_SPRITES.shooting.x, PLAYER_SPRITES.shooting.y, PLAYER_SPRITES.shooting.w, PLAYER_SPRITES.shooting.h)
    };

    bulletSprite = spriteSheet.get(PLAYER_SPRITES.bullet.x, PLAYER_SPRITES.bullet.y, PLAYER_SPRITES.bullet.w, PLAYER_SPRITES.bullet.h);
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
    let sx = d * 9;
    let sy = 108;
    let dx = startX + i * renderSize;
    let dy = yPosition;

    
    image(spriteSheet, dx, dy, renderSize, renderSize, sx, sy, charSize, charSize);

  }
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
  drawRetroScore(score, 10);

  fill(0, 255, 0);
  let startX = 20;
  let lifeY = 18;
  let spacing = 16;

  for (let i = 0; i < lives; i++) {
    let currentX = startX + i * spacing;
    triangle(
      currentX, lifeY - 6,
      currentX - 5, lifeY + 6,
      currentX + 5, lifeY + 6
    );
  }
}

function keyPressed() {
  if (key === 'Enter') {
    if (gameState === 'START' || gameState === 'ENDGAME') {
      startNewGame();
    }
  }
}