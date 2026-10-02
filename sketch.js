// sketch.js
function setup() {
    // Verificamos que las constantes existan y el canvas se cree
    createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    console.log("Canvas initialized correctly!");
}

function draw() {
    background(20); // Fondo oscuro estilo arcade

    // Dibujar una línea que marque el límite del jugador (PLAYER_AREA_Y)
    stroke(100);
    line(0, PLAYER_AREA_Y, CANVAS_WIDTH, PLAYER_AREA_Y);

    // Mensaje de prueba
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    text("Centipede 1981 - Ready", width / 2, height / 2);
}