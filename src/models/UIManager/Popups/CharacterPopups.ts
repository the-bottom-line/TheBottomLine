
import { Container, Graphics, Text, Sprite, Assets, ColorMatrixFilter } from 'pixi.js';
import { FancyButton } from '../../FancyButton.js';
import type Player from '../../Player.js';
import Character from '../../Characters.js';
import type { DivestmentTarget } from '../../GameManager.js';
import type PopUpManager from '../PopUpManager.js';

export class CharacterPopups {
    private manager: PopUpManager;

    constructor(manager: PopUpManager) {
        this.manager = manager;
    }

    async anounceCharacter(player: Player) {
        const { container: tempContainer, contentY } = await this.manager.createStandardPopupContent(
            "./miscellaneous/ChairmanIcon.png",
            "The Chairman is calling..",
            `${player.character!.name}\n${player.name}`,
            player.character!.iconPath
        );

        this.manager.addPopupCloseButton(tempContainer);

        this.manager.popupContainer.addChild(tempContainer);
    }

    async announceClosedCharacter(character: Character) {
        const tempContainer = this.manager.createPopupBase();
        const x = this.manager.app.screen.width / 2;
        let y = this.manager.app.screen.height / 2 - 250;

        const texture = await Assets.load("./miscellaneous/ChairmanIcon.png");
        const chairmanIcon = new Sprite(texture);
        chairmanIcon.position.set(x, y);
        chairmanIcon.width = 200;
        chairmanIcon.height = 240;
        chairmanIcon.anchor.set(0.5);
        y += 140;

        const titleBackground = new Graphics()
            .roundRect(x - 150, y - 25, 300, 50, 5)
            .fill(0x60584C)
            .stroke({ width: 2, color: 0x000000 });

        const titleText = new Text({
            text: "The Chairman",
            style: { fill: '#ffffff', fontSize: 20, fontFamily: 'MyFont' }
        });
        titleText.anchor.set(0.5);
        titleText.position.set(x, y);
        y += 70;

        const infoText = new Text({
            text: "This is the closed character. They will be avalibe for the last player",
            style: { fill: '#ffffff', fontSize: 18, fontFamily: 'MyFont', align: 'center' }
        });
        infoText.anchor.set(0.5);
        infoText.position.set(x, y);

        const infoBackground = new Graphics()
            .roundRect(x - (infoText.width + 40) / 2, y - 30, infoText.width + 40, 60, 5)
            .fill(0x323232)
            .stroke({ width: 2, color: 0x000000 });
        y += 180;

        const charTexture = await Assets.load(character.texturePath);
        const charSprite = new Sprite(charTexture);
        charSprite.scale.set(0.3);
        charSprite.anchor.set(0.5);
        charSprite.position.set(x, y);

        tempContainer.addChild(chairmanIcon);
        tempContainer.addChild(titleBackground);
        tempContainer.addChild(titleText);
        tempContainer.addChild(infoBackground);
        tempContainer.addChild(infoText);
        tempContainer.addChild(charSprite);

        this.manager.addPopupCloseButton(tempContainer);
        this.manager.popupContainer.addChild(tempContainer);
    }

    async StakeholdersPerk(characters: Character[], onSelectCallback: (_: Character) => void) {
        const tempContainer = this.manager.createPopupBase();
        const x = this.manager.app.screen.width / 2;
        let y = this.manager.app.screen.height / 2 - 300;

        const texture = await Assets.load("./miscellaneous/ShareholderIcon.png");
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
            text: 'Shareholder’s perk',
            style: { fill: '#ffffff', fontSize: 24, fontFamily: 'MyFont' }
        });
        perkText.anchor.set(0.5);
        perkText.position.set(x, y);
        y += 70;

        const descriptionBackground = new Graphics()
            .roundRect(x - 200, y - 30, 400, 60, 5)
            .fill(0x323232)
            .stroke({ width: 2, color: 0x000000 });

        const descriptionText = new Text({
            text: 'Please select a character you want to fire this round',
            style: { fill: '#ffffff', fontSize: 18, fontFamily: 'MyFont' }
        });
        descriptionText.anchor.set(0.5);
        descriptionText.position.set(x, y);
        y += 100

        const cardScale = 0.3;
        const cardWidth = 590 * cardScale; // Assuming original card width
        const spacing = 20;
        const totalWidth = (characters.length * cardWidth) + ((characters.length - 1) * spacing);
        const startX = x - totalWidth / 2 + cardWidth / 2;

        const backgroundPadding = 50;
        const charactersBackground = new Graphics()
            .roundRect(
                startX - (cardWidth / 2) - backgroundPadding,
                y - backgroundPadding,
                totalWidth + (backgroundPadding * 2),
                (940 * cardScale) + (backgroundPadding * 2), // Assuming original card height
                5)
            .fill(0x323232)
            .stroke({ width: 2, color: 0x000000 });

        tempContainer.addChild(characterIcon);
        tempContainer.addChild(perkBackground);
        tempContainer.addChild(perkText);
        tempContainer.addChild(descriptionBackground);
        tempContainer.addChild(descriptionText);
        tempContainer.addChild(charactersBackground);

        characters.forEach(async (character, index) => {
            const texture = await Assets.load(character.texturePath);
            const faceUpCard = new Sprite(texture);
            faceUpCard.interactive = true;
            faceUpCard.scale.set(cardScale);
            faceUpCard.anchor.set(0.5);

            faceUpCard.x = startX + index * (cardWidth + spacing);
            faceUpCard.y = y + (940 * cardScale) / 2;
            faceUpCard.on('mousedown', () => onSelectCallback(character));
            tempContainer.addChild(faceUpCard);

        });
        this.manager.addPopupCloseButton(tempContainer);

        this.manager.popupContainer.addChild(tempContainer);
        return tempContainer;
    }

    async firedCharacter(character: Character, localPlayer: Player) {
        let description = character.name;
        if (localPlayer.character === character) {
            description += "\nYou have been fired";
        }

        const { container: tempContainer } = await this.manager.createStandardPopupContent(
            "./miscellaneous/ShareholderIcon.png",
            "The Shareholder fired...",
            description,
            character.iconPath
        );

        this.manager.addPopupCloseButton(tempContainer);
        this.manager.popupContainer.addChild(tempContainer);
    }

    async youCharacterAbility(character: Character, perk: string) {
        const tempContainer = this.manager.createPopupBase();
        const x = this.manager.app.screen.width / 2;
        let y = this.manager.app.screen.height / 2 - 200;

        const texture = await Assets.load(character.iconPath);
        const characterIcon = new Sprite(texture);

        characterIcon.position.set(x, y);
        characterIcon.width = 200;
        characterIcon.height = 240;
        characterIcon.anchor.set(0.5);
        y += 130;

        const descriptionText = new Text({
            text: perk,
            style: { fill: '#ffffff', fontSize: 20, fontFamily: 'MyFont', wordWrap: true, wordWrapWidth: 500, align: 'center' }
        });
        const padding = 30;
        const bgWidth = descriptionText.width + padding;

        const titleText = new Text({
            text: `${character.characterType}’s perk`,
            style: { fill: '#ffffff', fontSize: 24, fontFamily: 'MyFont' }
        });
        titleText.anchor.set(0.5);
        titleText.position.set(x, y);
        const padd = 20;

        const titleBackground = new Graphics()
            .roundRect(x - bgWidth / 2, y - (titleText.height + padd) / 2, bgWidth, titleText.height + padd, 5)
            .fill(0x60584C)
            .stroke({ width: 2, color: 0x000000 });

        y += 70;

        descriptionText.anchor.set(0.5);
        descriptionText.position.set(x, y);

        const descriptionBackground = new Graphics()
            .roundRect(0, 0, bgWidth, descriptionText.height + padding, 5)
            .fill(0x323232)
            .stroke({ width: 2, color: 0x000000 });
        descriptionBackground.pivot.set(descriptionBackground.width / 2, descriptionBackground.height / 2);
        descriptionBackground.position.set(x, y);

        this.manager.addPopupCloseButton(tempContainer);

        tempContainer.addChild(characterIcon);
        tempContainer.addChild(titleBackground);
        tempContainer.addChild(titleText);
        tempContainer.addChild(descriptionBackground);
        tempContainer.addChild(descriptionText);

        this.manager.popupContainer.addChild(tempContainer);
    }

    async youAreDivesting(divestmentTargets: DivestmentTarget[], onSelectCallback: (playerID: number, cardIndex: number) => void) {

        const tempContainer = this.manager.createPopupBase();
        const x = this.manager.app.screen.width / 2;
        let y = this.manager.app.screen.height / 2 - 250;



        const texture = await Assets.load("./miscellaneous/StakeholderIcon.png");
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
            text: 'Stakeholder’s perk',
            style: { fill: '#ffffff', fontSize: 24, fontFamily: 'MyFont' }
        });
        perkText.anchor.set(0.5);
        perkText.position.set(x, y);
        y += 70;
        const descriptionBackground = new Graphics()
            .roundRect(x - 200, y - 30, 400, 60, 5)
            .fill(0x323232)
            .stroke({ width: 2, color: 0x000000 });

        const descriptionText = new Text({
            text: 'Please select a player you want to force to divest',
            style: { fill: '#ffffff', fontSize: 18, fontFamily: 'MyFont' }
        });
        descriptionText.anchor.set(0.5);
        descriptionText.position.set(x, y);
        y += 100;

        tempContainer.addChild(characterIcon);
        tempContainer.addChild(perkBackground);
        tempContainer.addChild(perkText);
        tempContainer.addChild(descriptionBackground);
        tempContainer.addChild(descriptionText);

        const cardScale = 0.2;
        const cardWidth = 590 * cardScale;
        const cardHeight = 940 * cardScale;
        const cardSpacing = 10;

        const playerCount = divestmentTargets.length;
        const columnWidth = cardWidth * 4;
        let startX = this.manager.app.screen.width / 2 - (columnWidth * playerCount) / 2;

        for (const target of divestmentTargets) {

            const playerX = startX + columnWidth / 2;
            let playerY = 450;

            const name = new Text({
                text: target.player.name,
                style: { fill: "#fff", fontSize: 18, fontFamily: "MyFont" }
            });
            name.anchor.set(0.5);
            name.position.set(playerX, playerY);
            tempContainer.addChild(name);

            playerY += 30;

            const totalWidth = target.assets.length * cardWidth + (target.assets.length - 1) * cardSpacing;
            let cardStartX = playerX - totalWidth / 2;

            const grayscaleFilter = new ColorMatrixFilter();
            grayscaleFilter.grayscale(0.2, true);

            for (const card of target.assets) {
                const tex = await Assets.load(card.asset.texturePath);
                const sprite = new Sprite(tex);
                sprite.scale.set(cardScale);
                sprite.anchor.set(0.5);
                sprite.interactive = true;
                if (!card.isDivestable) {
                    sprite.filters = [grayscaleFilter];
                }
                sprite.position.set(cardStartX + cardWidth / 2, playerY + cardHeight / 2);
                sprite.on('mousedown', () => onSelectCallback(target.player.playerID, target.player.assetList.indexOf(card.asset)));
                tempContainer.addChild(sprite);
                cardStartX += cardWidth + cardSpacing;
            }

            startX += columnWidth; // move to next player column
        }

        this.manager.addPopupCloseButton(tempContainer);

        this.manager.popupContainer.addChild(tempContainer);

        return tempContainer;
    }
}
