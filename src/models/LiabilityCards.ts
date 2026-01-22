import { Assets, Sprite } from 'pixi.js';
import boardgameData from '../../boardgame.json' with { type: 'json' };

class LiabilityCards {
    deckSprite?: Sprite;

    async initializeDeckSprite() {
        const texture = await Assets.load(boardgameData.deck_list.liability_deck.card_image_back_url);

        this.deckSprite = new Sprite(texture);
        this.deckSprite.scale.set(0.4);
        this.deckSprite.anchor.set(0.5);
        this.deckSprite.interactive = true;
        this.deckSprite.cursor = 'pointer';
        return this.deckSprite;
    }

    setDeckPosition(x: number, y: number) {
        if (this.deckSprite) {
            this.deckSprite.x = x;
            this.deckSprite.y = y;
        }
    }
}

export default LiabilityCards;
