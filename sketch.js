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


async function setup() {
  spriteSheet = await loadImage('assets/sprite.png');
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  noSmooth();

  mushrooms = [];
  centipedeSegments = [];
  bullets = [];
  
  gameState = 'START';
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
        if (keyIsDown(ENTER)) {
            //player.shoot();      //hasta que angel lo tenga
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

  //player = new Player();      //hasta que angel lo tenga
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