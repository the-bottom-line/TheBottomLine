import { Container, Graphics, Text, Sprite, Assets } from 'pixi.js';
import { FancyButton } from '../../FancyButton.js';
import type Player from '../../Player.js';
import type { PlayerId, RegulatorSwapPlayer } from '@shared-types';
import type GameState from '../../GameState.js';
import type PopUpManager from '../PopUpManager.js';

export class RegulatorPopups {
    private manager: PopUpManager;

    constructor(manager: PopUpManager) {
        this.manager = manager;
    }

    async youRegulatorOptions(options: RegulatorSwapPlayer[], perk: string, gameState: GameState, onSelectCallback1: (id: PlayerId) => void, onSelectCallback2: (card_idxs: number[]) => void) {
        const tempContainer = this.manager.createPopupBase();
        const x = this.manager.app.screen.width / 2;
        let y = this.manager.app.screen.height / 2 - 250;

        const texture = await Assets.load("./miscellaneous/RegulatorIcon.png");
        const characterIcon = new Sprite(texture);
        characterIcon.position.set(x, y);
        characterIcon.width = 160;
        characterIcon.height = 180;
        characterIcon.anchor.set(0.5);

        y += 90;

        const perkBackground = new Graphics()
            .roundRect(x - 120, y - 25, 240, 50, 5)
            .fill(0x60584C)
            .stroke({ width: 2, color: 0x000000 });


        const perkText = new Text({
            text: 'Regulators’s perk',
            style: { fill: '#ffffff', fontSize: 24, fontFamily: 'MyFont' }
        });
        perkText.anchor.set(0.5);
        perkText.position.set(x, y);
        y += 70;


        const descriptionText = new Text({
            text: perk,
            style: { fill: '#ffffff', fontSize: 18, fontFamily: 'MyFont' }
        });
        descriptionText.anchor.set(0.5);
        descriptionText.position.set(x, y);

        const descriptionBackground = new Graphics()
            .roundRect(x - (descriptionText.width + 20) / 2, y - (descriptionText.height + 20) / 2, descriptionText.width + 20, descriptionText.height + 20, 5)
            .fill(0x323232)
            .stroke({ width: 2, color: 0x000000 });

        tempContainer.addChild(characterIcon);
        tempContainer.addChild(perkBackground);
        tempContainer.addChild(perkText);
        tempContainer.addChild(descriptionBackground);
        tempContainer.addChild(descriptionText);


        const cardScale = 0.1;
        const cardWidth = 590 * cardScale;
        const cardHeight = 940 * cardScale;
        const cardSpacing = 10;
        const assetBackTexture = await Assets.load("./assets/asset_back.webp");
        const liabilityBackTexture = await Assets.load("liabilities/liability_back.webp");

        const playerCount = options.length;
        const columnWidth = (cardWidth * 2) + 80;
        let startX = this.manager.app.screen.width / 2 - (columnWidth * playerCount) / 2;

        for (const option of options) {
            const player = gameState.getPlayerById(option.player_id);
            if (!player) continue;

            const playerX = startX + columnWidth / 2;
            let playerY = y + 50;

            const name = new Text({
                text: player.name,
                style: { fill: "#fff", fontSize: 18, fontFamily: "MyFont" }
            });
            name.anchor.set(0.5);
            name.position.set(playerX, playerY);
            tempContainer.addChild(name);

            playerY += 30;

            const assetStartX = playerX - (cardWidth / 2) - (cardSpacing / 2);
            let cardBack = new Sprite(assetBackTexture);
            cardBack.scale.set(cardScale);
            cardBack.anchor.set(0.5);
            cardBack.position.set(assetStartX, playerY + cardHeight / 2);
            cardBack.interactive = true;
            cardBack.on('mousedown', () => onSelectCallback1(player.playerID));

            tempContainer.addChild(cardBack);
            const assetCount = new Text({
                text: `${option.asset_count} X`,
                style: { fill: "#fff", fontSize: 18, fontFamily: "MyFont" }
            });
            assetCount.anchor.set(0.5);
            assetCount.position.set(assetStartX, playerY + cardHeight + 20);
            tempContainer.addChild(assetCount);


            const liabilityStartX = playerX + (cardWidth / 2) + (cardSpacing / 2);

            cardBack = new Sprite(liabilityBackTexture);
            cardBack.scale.set(cardScale);
            cardBack.anchor.set(0.5);
            cardBack.position.set(liabilityStartX, playerY + cardHeight / 2);
            cardBack.interactive = true;
            cardBack.on('mousedown', () => onSelectCallback1(player.playerID));
            tempContainer.addChild(cardBack);
            const liabilityCount = new Text({
                text: `${option.liability_count} X`,
                style: { fill: "#fff", fontSize: 18, fontFamily: "MyFont" }
            });
            liabilityCount.anchor.set(0.5);
            liabilityCount.position.set(liabilityStartX, playerY + cardHeight + 20);
            tempContainer.addChild(liabilityCount);


            startX += columnWidth; // move to next player column
        }
        const orText = new Text({
            text: `OR`,
            style: { fill: "#fff", fontSize: 32, fontFamily: "MyFont" }
        });
        orText.anchor.set(0.5);
        orText.position.set(this.manager.app.screen.width / 2, 600);
        tempContainer.addChild(orText);

        const deckButton = new FancyButton({
            text: "SWAP WITH DECK",
            width: 300,
            height: 60,
            onPress: () => {
                // Close the current popup and open the deck swap one
                this.manager.popupContainer.removeChild(tempContainer);
                this.displaySwapWithDeckPopup(gameState.getLocalPlayer(), (card_idxs) => {
                    onSelectCallback2(card_idxs);
                }, () => {
                    this.youRegulatorOptions(options, perk, gameState, onSelectCallback1, onSelectCallback2);
                });
            }
        });
        deckButton.view.position.set((this.manager.app.screen.width - deckButton.view.width) / 2, 650);
        tempContainer.addChild(deckButton.view);



        this.manager.addPopupCloseButton(tempContainer);

        this.manager.popupContainer.addChild(tempContainer);
    }

    async displaySwapWithDeckPopup(player: Player, onConfirmCallback: (card_idxs: number[]) => void, onBackCallback: () => void) {
        const tempContainer = this.manager.createPopupBase();
        const x = this.manager.app.screen.width / 2;
        let y = this.manager.app.screen.height / 2 - 250;

        const titleText = new Text({
            text: 'Select cards to swap with the deck',
            style: { fill: '#ffffff', fontSize: 24, fontFamily: 'MyFont' }
        });
        titleText.anchor.set(0.5);
        titleText.position.set(x, y);
        tempContainer.addChild(titleText);

        y += 150;

        const selectedIndices: number[] = [];

        const cardScale = 0.25;
        const cardWidth = 590 * cardScale;
        const cardHeight = 940 * cardScale;
        const spacing = 20;
        const totalWidth = (player.hand.length * cardWidth) + ((player.hand.length - 1) * spacing);
        const startX = x - totalWidth / 2 + cardWidth / 2;

        player.hand.forEach((card, index) => {
            const cardSprite = new Sprite(card.sprite.texture);
            cardSprite.scale.set(cardScale);
            cardSprite.anchor.set(0.5);
            cardSprite.position.set(startX + index * (cardWidth + spacing), y);
            cardSprite.interactive = true;
            cardSprite.cursor = 'pointer';

            const outline = new Graphics()
                .roundRect(0, 0, cardWidth + 5, cardHeight + 5, 15)
                .stroke({ width: 4, color: 0xCBC28E }) // 0xCBC28E -> gold color
            outline.position.set(startX + index * (cardWidth + spacing), y);
            outline.pivot.set((cardWidth + 10) / 2, (cardHeight + 10) / 2);
            outline.alpha = 0;
            tempContainer.addChild(outline);

            cardSprite.on('mousedown', () => {
                const selectionIndex = selectedIndices.indexOf(index);
                if (selectionIndex > -1) {

                    selectedIndices.splice(selectionIndex, 1);
                    outline.alpha = 0; // Hide outline
                } else {

                    selectedIndices.push(index);
                    outline.alpha = 1; // Show outline
                }
            });

            tempContainer.addChild(cardSprite);
        });

        const okButton = new FancyButton({
            text: "Confirm",
            width: 200,
            height: 60,
            onPress: () => {
                if (tempContainer.parent) {
                    tempContainer.parent.removeChild(tempContainer);
                }
                onConfirmCallback(selectedIndices);
            }
        });
        okButton.view.position.set(this.manager.app.screen.width / 2 - (okButton.view.width / 2), this.manager.app.screen.height - 170);
        tempContainer.addChild(okButton.view);

        const backButton = new FancyButton({
            text: "Back",
            width: 200,
            height: 60,
            onPress: () => {
                if (tempContainer.parent) {
                    tempContainer.parent.removeChild(tempContainer);
                }
                onBackCallback();
            }
        });
        backButton.view.position.set(this.manager.app.screen.width / 2 - (backButton.view.width / 2), this.manager.app.screen.height - 100);
        tempContainer.addChild(backButton.view);

        this.manager.popupContainer.addChild(tempContainer);
        return tempContainer;
    }

    async displayYouSwappedNotification(localPlayer: Player) {
        const tempContainer = this.manager.createPopupBase();
        const x = this.manager.app.screen.width / 2;
        let y = this.manager.app.screen.height / 2 - 300;

        // Regulator Icon
        const texture = await Assets.load("./miscellaneous/RegulatorIcon.png");
        const regulatorIcon = new Sprite(texture);
        regulatorIcon.position.set(x, y);
        regulatorIcon.width = 160;
        regulatorIcon.height = 180;
        regulatorIcon.anchor.set(0.5);
        tempContainer.addChild(regulatorIcon);
        y += 90;

        // Title
        const titleBackground = new Graphics()
            .roundRect(x - 150, y - 25, 300, 50, 5)
            .fill(0x60584C)
            .stroke({ width: 2, color: 0x000000 });
        tempContainer.addChild(titleBackground);

        const titleText = new Text({
            text: `Regulator’s perk`,
            style: { fill: '#ffffff', fontSize: 24, fontFamily: 'MyFont' }
        });
        titleText.anchor.set(0.5);
        titleText.position.set(x, y);
        tempContainer.addChild(titleText);
        y += 70;

        // Info
        const infoBackground = new Graphics()
            .roundRect(x - 200, y - 30, 400, 60, 5)
            .fill(0x323232)
            .stroke({ width: 2, color: 0x000000 });
        tempContainer.addChild(infoBackground);

        const infoText = new Text({
            text: "Trade complete! Your new hand:",
            style: { fill: '#ffffff', fontSize: 18, fontFamily: 'MyFont' }
        });
        infoText.anchor.set(0.5);
        infoText.position.set(x, y);
        tempContainer.addChild(infoText);
        y += 100;

        if (localPlayer.hand.length > 0) {
            const cardScale = 0.25;
            const cardWidth = 590 * cardScale;
            const spacing = 20;
            const totalWidth = (localPlayer.hand.length * cardWidth) + ((localPlayer.hand.length - 1) * spacing);
            const startX = x - totalWidth / 2 + cardWidth / 2;

            const backgroundPadding = 30;
            const cardsBackground = new Graphics()
                .roundRect(
                    startX - (cardWidth / 2) - backgroundPadding,
                    y - backgroundPadding,
                    totalWidth + (backgroundPadding * 2),
                    (940 * cardScale) + (backgroundPadding * 2),
                    5)
                .fill(0x323232)
                .stroke({ width: 2, color: 0x000000 });
            tempContainer.addChild(cardsBackground);

            localPlayer.hand.forEach((card, index) => {
                const cardSprite = new Sprite(card.sprite.texture);
                cardSprite.scale.set(cardScale);
                cardSprite.anchor.set(0.5);
                cardSprite.position.set(startX + index * (cardWidth + spacing), y + (940 * cardScale) / 2);
                tempContainer.addChild(cardSprite);
            });
        }

        this.manager.addPopupCloseButton(tempContainer);
        this.manager.popupContainer.addChild(tempContainer);
    }

    async displayRegulatorSwapNotification(localPlayer: Player) {
        const tempContainer = this.manager.createPopupBase();
        const x = this.manager.app.screen.width / 2;
        let y = this.manager.app.screen.height / 2 - 300;

        // Regulator Icon
        const texture = await Assets.load("./miscellaneous/RegulatorIcon.png");
        const regulatorIcon = new Sprite(texture);
        regulatorIcon.position.set(x, y);
        regulatorIcon.width = 160;
        regulatorIcon.height = 180;
        regulatorIcon.anchor.set(0.5);
        tempContainer.addChild(regulatorIcon);
        y += 90;

        // Title
        const titleBackground = new Graphics()
            .roundRect(x - 150, y - 25, 300, 50, 5)
            .fill(0x60584C)
            .stroke({ width: 2, color: 0x000000 });
        tempContainer.addChild(titleBackground);

        const titleText = new Text({
            text: `Regulator traded your cards!`,
            style: { fill: '#ffffff', fontSize: 24, fontFamily: 'MyFont' }
        });
        titleText.anchor.set(0.5);
        titleText.position.set(x, y);
        tempContainer.addChild(titleText);
        y += 70;

        // Info
        const infoBackground = new Graphics()
            .roundRect(x - 200, y - 30, 400, 60, 5)
            .fill(0x323232)
            .stroke({ width: 2, color: 0x000000 });
        tempContainer.addChild(infoBackground);

        const infoText = new Text({
            text: "You received the regulator's hand:",
            style: { fill: '#ffffff', fontSize: 18, fontFamily: 'MyFont' }
        });
        infoText.anchor.set(0.5);
        infoText.position.set(x, y);
        tempContainer.addChild(infoText);
        y += 100;

        if (localPlayer.hand.length > 0) {
            const cardScale = 0.25;
            const cardWidth = 590 * cardScale;
            const spacing = 20;
            const totalWidth = (localPlayer.hand.length * cardWidth) + ((localPlayer.hand.length - 1) * spacing);
            const startX = x - totalWidth / 2 + cardWidth / 2;

            const backgroundPadding = 30;
            const cardsBackground = new Graphics()
                .roundRect(
                    startX - (cardWidth / 2) - backgroundPadding,
                    y - backgroundPadding,
                    totalWidth + (backgroundPadding * 2),
                    (940 * cardScale) + (backgroundPadding * 2),
                    5)
                .fill(0x323232)
                .stroke({ width: 2, color: 0x000000 });
            tempContainer.addChild(cardsBackground);

            localPlayer.hand.forEach((card, index) => {
                const cardSprite = new Sprite(card.sprite.texture);
                cardSprite.scale.set(cardScale);
                cardSprite.anchor.set(0.5);
                cardSprite.position.set(startX + index * (cardWidth + spacing), y + (940 * cardScale) / 2);
                tempContainer.addChild(cardSprite);
            });
        }

        this.manager.addPopupCloseButton(tempContainer);
        this.manager.popupContainer.addChild(tempContainer);
    }

    async displayPlayerSwapNotification(targetPlayer: Player) {
        const tempContainer = this.manager.createPopupBase();
        const x = this.manager.app.screen.width / 2;
        let y = this.manager.app.screen.height / 2 - 200;

        // Regulator Icon
        const texture = await Assets.load("./miscellaneous/RegulatorIcon.png");
        const regulatorIcon = new Sprite(texture);
        regulatorIcon.position.set(x, y);
        regulatorIcon.width = 160;
        regulatorIcon.height = 180;
        regulatorIcon.anchor.set(0.5);
        tempContainer.addChild(regulatorIcon);
        y += 90;

        // Title
        const titleBackground = new Graphics()
            .roundRect(x - 150, y - 25, 300, 50, 5)
            .fill(0x60584C)
            .stroke({ width: 2, color: 0x000000 });
        tempContainer.addChild(titleBackground);

        const titleText = new Text({
            text: `The Regulator's perk`,
            style: { fill: '#ffffff', fontSize: 24, fontFamily: 'MyFont' }
        });
        titleText.anchor.set(0.5);
        titleText.position.set(x, y);
        tempContainer.addChild(titleText);
        y += 70;

        // Info
        const infoText = new Text({
            text: `The regulator has swapped their hand with ${targetPlayer.name}.`,
            style: { fill: '#ffffff', fontSize: 18, fontFamily: 'MyFont' }
        });
        infoText.anchor.set(0.5);
        infoText.position.set(x, y);

        const infoBackground = new Graphics()
            .roundRect(x - (infoText.width + 40) / 2, y - 30, infoText.width + 40, 60, 5)
            .fill(0x323232)
            .stroke({ width: 2, color: 0x000000 });

        tempContainer.addChild(infoBackground);
        tempContainer.addChild(infoText);

        this.manager.addPopupCloseButton(tempContainer);
        this.manager.popupContainer.addChild(tempContainer);
    }
}
