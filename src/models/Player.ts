import { Application } from "pixi.js";
import Asset from './Asset.js';
import Liability from './Liability.js';
import { Tween } from 'tweedle.js';
import type Character from "./Characters.js";
import type { CardType } from "@shared-types";

type HoveredCard = Asset | Liability | null;

class Player {
    app: Application;
    name: string;
    playerID: number;
    
    hand: (Asset | Liability)[] = [];
    playableAssets = 1;
    playableLiabilities = 1;
    character: Character | null = null;
    othersHand: CardType[] = [];
    isChaiman = false;

    assetList: Asset[] = [];
    cash = 0;
    liabilityList: Liability[] = [];        
    
    tradeCredit = 0;
    bankLoans = 0;
    bonds = 0;
    silver = 0;
    gold = 0;

    cardSpacing = 180;

    maxTempCards = 3;
    maxKeepCards = 2;
    drawableCards = this.maxTempCards;
    skipNextTurn = false;
    reveal = false;

    _nextZIndex = 0;
    
    constructor(name: string, id: number, app: Application) {
        this.app = app;
        this.name = name;
        this.playerID = id;
    }

    positionCardsInHand(hoveredCard: HoveredCard = null) {
        const liabilities = this.hand.filter(c => c instanceof Liability && !c.isTemporary).reverse();
        const assets = this.hand.filter(c => c instanceof Asset && !c.isTemporary).reverse();

        const baseY = this.app.screen.height - 100;
        const spacing = 60; 
        const hoverYOffset = -30; 
        const hoverSpacing = 75; 

        const totalAssetsWidth = (assets.length - 1) * spacing;
        const assetsStartX = this.app.screen.width / 2 - totalAssetsWidth - 100;

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
        const liabilitiesStartX = this.app.screen.width / 2 + 100 + totalLiabilitiesWidth;

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

    addCardToHand(card: Asset | Liability) {
        this.hand.push(card);
        if (card.sprite) card.sprite.zIndex = this._nextZIndex++;
        if (card.discardButton) card.discardButton.zIndex =this._nextZIndex + 1;
    }
    playLiability(cardIndex: number) {
        const card = this.hand[cardIndex];
        if (card instanceof Liability) {
            // Server-side logic will handle the rest.
            return true;
        }
        return false;
    }
    playAsset(cardIndex: number) {
        const card = this.hand[cardIndex];
        if (card instanceof Asset) {
            // Server-side logic will handle the rest.
            return true;
        }
        return false;
    }
    positionAssetsToPile() {
        const baseY = this.app.screen.height / 2 - 50;
        const spacing = -60; 

        const assetsStartX = this.app.screen.width / 2 - 145;

        this.assetList.forEach((card: Asset, i: number) => {
            card.setPosition(assetsStartX + i * spacing, baseY);
        });
    }
    positionLiabilitiesToPile() {

        const baseY = this.app.screen.height / 2 - 50;
        const spacing = 60; 

        const assetsStartX = this.app.screen.width / 2 + 145;

        this.liabilityList.forEach((card: Liability, i: number) => {
            card.setPosition(assetsStartX + i * spacing, baseY);
        });
    }

    positionTempCards() {
        const tempCards = this.hand.filter(c => c.isTemporary);

        const startX = (this.app.screen.width - (this.drawableCards * this.cardSpacing)) / 2 + this.cardSpacing / 2;
        const y = this.app.screen.height/2; 

        tempCards.forEach((card, index) => {
            card.setPosition(startX + (index * this.cardSpacing), y);
        });
   }

    useCharacterAbility(targetPlayer?: Player, cardIndex?: number, targetCardIndex?: number) {
        if (this.character && !this.character.used) {
            return this.character.useActive(this, targetPlayer, cardIndex, targetCardIndex);
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