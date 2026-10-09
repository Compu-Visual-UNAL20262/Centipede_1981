// Spider.js
class Spider {
    constructor(sprites){
        this.x = random([0, CANVAS_WIDTH])
        this.y = random(PLAYER_AREA_Y, PLAYER_AREA_Y+100);
        this.origin = (this.x === 0) ? 1 : -1

        this.velX = this.origin * SPIDER_SPEED;
        this.velY = random([-1, 1]) * SPIDER_SPEED;

        this.time = 0;
        this.moveDelay = random(Array(6).fill(0).map((_, i) => MIN_SPIDER_MOVE_DELAY*(i+1)));
        this.animationCounter = 0;
        this.animationDelay = 5;

        this.sprites = [
            sprites.spiderA,
            sprites.spiderB,
            sprites.spiderC,
        ];

        this.spriteIndex = 0;
    }

    update(){
        this.x += this.velX;
        this.y += this.velY;


        if (this.isOutOfBoundY()) {
            this.velY *= -1;
        }

        this.time++;
        if (this.time >= this.moveDelay) {
            this.changeDirection();
        }

        this.animationCounter++;
        if (this.animationCounter >= this.animationDelay) {
            this.animationCounter = 0;
            this.changeSprite();
        }
    }

    changeDirection(){
        this.velY = random([-1, 1]) * SPIDER_SPEED;
        this.velX = random([0, this.origin * SPIDER_SPEED, this.origin * SPIDER_SPEED, this.origin * SPIDER_SPEED]);

        this.time = 0;
        this.moveDelay = random(Array(6).fill(0).map((_, i) => MIN_SPIDER_MOVE_DELAY*(i+1)));
    }
    
    isOutOfBoundY(){
        return this.y < PLAYER_AREA_Y-100 || this.y > PLAYER_AREA_Y+100;
    }

    isOutOfBoundX(){
        return this.x < -10|| this.x > CANVAS_WIDTH+10;
    }

    render(){
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
    }

    changeSprite() {
        this.spriteIndex++;

        if (this.spriteIndex >= this.sprites.length) {
        this.spriteIndex = 0;
        }
    }
}
