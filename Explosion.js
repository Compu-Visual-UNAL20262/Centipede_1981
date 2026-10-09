class Explosion {
    constructor(x, y, sprites){
        this.x = x;
        this.y = y;
        this.animationCounter = 0;
        this.animationDelay = 5;

        this.sprites = [
            sprites.explosionA,
            sprites.explosionB,
            sprites.explosionC,
        ];

        this.spriteIndex = 0;

        this.finished = false;
    }

    render() {
        if (this.finished) return;

        const currentSprite = this.sprites[this.spriteIndex];
        const renderWidth = currentSprite.width * SPRITE_SCALE;
        const renderHeight = currentSprite.height * SPRITE_SCALE;

        image(
        currentSprite,
        Math.floor(this.x),
        Math.floor(this.y),
        renderWidth,
        renderHeight
        );

        this.animationCounter++;

        if (this.animationCounter >= this.animationDelay) {
        this.animationCounter = 0;
        this.spriteIndex++;

        if (this.spriteIndex >= this.sprites.length) {
            this.finished = true;
        }
        }
    }

}