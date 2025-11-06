import { Assets, Sprite } from 'pixi.js';

class GeneralCard {
    constructor(texturePath) {
        this.texturePath = texturePath;
        this.sprite = null;   
        this.discardButton = null;
        this.isTemporary = false;
        this.initializeSprite();
    }

    async initializeSprite() {
        const texture = await Assets.load(this.texturePath);
        const buttonTex = await Assets.load("./miscellaneous/discard.png");
        
        texture.scaleMode = 'linear';
        this.sprite = new Sprite(texture);
        this.sprite.scale.set(0.25);
        this.sprite.anchor.set(0.5);

        this.discardButton = new Sprite(buttonTex);
        this.discardButton.eventMode = 'static';
        this.discardButton.cursor = "pointer";
        this.discardButton.anchor.set(0.5);
        this.discardButton.width = 30;
        this.discardButton.height = 30;
        this.discardButton.on('mousedown', () => { 
            this.sprite.emit('cardDiscarded', this); 
        });
    }

    makePlayable() {
        this.sprite.interactive = true;
        this.sprite.cursor = 'pointer';
        this.sprite.on('mouseover', () => {
            this.sprite.emit('cardHover', this);
        });
        this.sprite.on('mouseout', () => {
            this.sprite.emit('cardOut', this);
        });
    }

    makeUnplayable() {
        this.sprite.interactive = false;
        this.sprite.cursor = 'default';
        this.sprite.off('mousedown');
    }

    setPosition(x, y) {
        if (this.sprite) {
            this.sprite.x = x;
            this.sprite.y = y;
           
        }
        if (this.discardButton) {
                this.discardButton.x = x;
                this.discardButton.y = y - this.sprite.height/2 + 20;
            }
    }
}

export default GeneralCard;
