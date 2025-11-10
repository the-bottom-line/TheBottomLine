import Asset from './Asset.js';
import Liability from './Liability.js';
import { Tween } from 'tweedle.js';
class Player {
    constructor(name, id) {
        this.hand = [];
        this.playableAssets = 1;
        this.playableLiabilities = 1;
        this.character = null;
        this.name = name;
        this.playerID = id;
        this.othersHand = []; 
        this.isChaiman = false;
        this.drawableCards;

        this.assetList = [];
        this.cash = 0;
        this.liabilityList = [];        
        
        this.tradeCredit = 0;
        this.bankLoans = 0;
        this.bonds = 0;
        this.silver = 0;
        this.gold = 0;

        this.cardSpacing = 180;

        this.skipNextTurn = false;
        this.reveal = false;

        this._nextZIndex = 0;
    }

    positionCardsInHand(hoveredCard = null) {
        const liabilities = this.hand.filter(c => c instanceof Liability && !c.isTemporary).reverse();
        const assets = this.hand.filter(c => c instanceof Asset && !c.isTemporary).reverse();

        const baseY = window.innerHeight - 100;
        const spacing = 60; 
        const hoverYOffset = -30; 
        const hoverSpacing = 75; 

        const totalAssetsWidth = (assets.length - 1) * spacing;
        const assetsStartX = window.innerWidth / 2 - totalAssetsWidth - 100;

        assets.forEach((card, i) => {
            let x = assetsStartX + i * spacing;
            let y = baseY;
            if (hoveredCard instanceof Asset) {
                const hoverIndex = assets.indexOf(hoveredCard);
                if (hoverIndex !== -1) {
                    if (i < hoverIndex) x -= hoverSpacing;
                    if (card === hoveredCard) y += hoverYOffset;
                }
            }
            new Tween(card.sprite.position).to({ x, y }, 150).start();
            if (card.discardButton) {
                const discardButtonY = y - card.sprite.height / 2 + 20;
                new Tween(card.discardButton.position).to({ x, y: discardButtonY }, 150).start();
            }
        });

        const totalLiabilitiesWidth = (liabilities.length > 0 ? liabilities.length - 1 : 0) * spacing;
        const liabilitiesStartX = window.innerWidth / 2 + 100 + totalLiabilitiesWidth;

        liabilities.forEach((card, i) => {
            let x = liabilitiesStartX - i * spacing;
            let y = baseY;
            if (hoveredCard instanceof Liability) {
                const hoverIndex = liabilities.indexOf(hoveredCard);
                if (hoverIndex !== -1) {
                    if (i < hoverIndex) x += hoverSpacing;
                    if (card === hoveredCard) y += hoverYOffset;
                }
            }
            new Tween(card.sprite.position).to({ x, y }, 150).start();
            if (card.discardButton) {
                const discardButtonY = y - card.sprite.height / 2 + 20;
                new Tween(card.discardButton.position).to({ x, y: discardButtonY }, 150).start();
            }
        });
    }

    addCardToHand(card) {
        this.hand.push(card);
        if (card.sprite) card.sprite.zIndex = this._nextZIndex++;
        if (card.discardButton) card.discardButton.zIndex =this._nextZIndex + 1;
    }
    playLiability(cardIndex) {
        const card = this.hand[cardIndex];
        if (card instanceof Liability) {
            // Server-side logic will handle the rest.
            return true;
        }
        return false;
    }
    playAsset(cardIndex) {
        const card = this.hand[cardIndex];
        if (card instanceof Asset) {
            // Server-side logic will handle the rest.
            return true;
        }
        return false;
    }
    positionAssetsToPile() {
        const baseY = window.innerHeight / 2 - 50;
        const spacing = -60; 

        const assetsStartX = window.innerWidth / 2 - 145;

        this.assetList.forEach((card, i) => {
            card.setPosition(assetsStartX + i * spacing, baseY);
        });
    }
    positionLiabilitiesToPile() {
        

        const baseY = window.innerHeight / 2 - 50;
        const spacing = 60; 

        const assetsStartX = window.innerWidth / 2 + 145;

        this.liabilityList.forEach((card, i) => {
            card.setPosition(assetsStartX + i * spacing, baseY);
        });
    }

    positionTempCards() {
        const tempCards = this.hand.filter(c => c.isTemporary);

        const startX = (window.innerWidth - (this.drawableCards * this.cardSpacing)) / 2 + this.cardSpacing / 2;
        const y = window.innerHeight/2; 

        tempCards.forEach((card, index) => {
            card.setPosition(startX + (index * this.cardSpacing), y);
        });
   }

    useCharacterAbility(targetPlayer = null, cardIndex = null, targetCardIndex = null) {
        if (this.character && !this.character.used) {
            return this.character.useAbility(this, targetPlayer, cardIndex, targetCardIndex);
        }
        return false;
    }

    resetCharacterAbility() {
        if (this.character) {
            this.character.used = false;
        }
    }
}

export default Player;