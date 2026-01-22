import { Assets, Sprite } from 'pixi.js';

class GeneralCard {
    texturePath: string;
    sprite: Sprite;
    discardButton: Sprite;
    isTemporary = false;
    
    constructor(texturePath: string) {
        this.texturePath = texturePath;
        this.sprite = new Sprite();
        this.discardButton = new Sprite();
        this.initializeSprite();
    }

    async initializeSprite() {
        const cardTexture = await Assets.load(this.texturePath);
        const buttonTexture = await Assets.load("./miscellaneous/discard.png");
        
        cardTexture.scaleMode = 'linear';
        this.sprite.texture = cardTexture;
        this.sprite.scale.set(0.25);
        this.sprite.anchor.set(0.5);

        this.discardButton.texture = buttonTexture;
        this.discardButton.eventMode = 'static';
        this.discardButton.cursor = "pointer";
        this.discardButton.anchor.set(0.5);
        this.discardButton.width = 30;
        this.discardButton.height = 30;
        this.discardButton.on('pointertap', () => { 
            this.sprite.emit('cardDiscarded', this); 
        });
    }

    makePlayable() {
        this.sprite.interactive = true;
        this.sprite.cursor = 'pointer';
        this.sprite.on('pointerover', () => {
            this.sprite.emit('cardHover', this);
        });
        this.sprite.on('pointerout', () => {
            this.sprite.emit('cardOut', this);
        });

        
    }

    makeUnplayable() {
        this.sprite.interactive = false;
        this.sprite.cursor = 'default';
        this.sprite.off('pointertap');
    }

    setPosition(x: number, y: number) {
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
