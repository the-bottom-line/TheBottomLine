import { Container, Graphics, Text, Sprite, Assets, FillGradient, Application,TextStyle } from 'pixi.js';
import { FancyButton } from '../FancyButton.js';
import type Player from '../Player.js';
import type Character from '../Characters.js';
import type { Color, PlayerId, RegulatorSwapPlayer } from '@shared-types';
import type GameState from '../GameState.js'; 
import type { MarketState } from '../GameState.js';
import type { DivestmentTarget } from '../GameManager.js';
import type HudManager from './HudManager.js';

class PopUpManager {
    app: Application;
    popupContainer: Container;
    hudManager: HudManager;

    constructor(app: Application, popupContainer: Container, hudManager: HudManager) {
        this.app = app;
        this.popupContainer = popupContainer;
        this.hudManager = hudManager;
    }

    async anounceCharacter(player: Player) {
        const tempContainer = this._createPopupBase();
        let x = this.app.screen.width / 2;
        let y = this.app.screen.height / 2-120;

        let texture = await Assets.load("./miscellaneous/ChairmanIcon.png");
        const chairmanIcon = new Sprite(texture);
        
        chairmanIcon.position.set(x, y);
        chairmanIcon.width = 200;
        chairmanIcon.height = 240;
        chairmanIcon.anchor.set(0.5);
        y +=100;

        const textChairmanBackground = new Graphics()
            .roundRect(x - 120, y-25 , 240, 50, 5)
            .fill(0x60584C) 
            .stroke({ width: 2, color: 0x000000 });

        const chairmanText = new Text({
            text: "The Chairman is calling..",
            style: { fill: '#ffffff', fontSize: 20, fontFamily: 'MyFont' }
        });
        chairmanText.anchor.set(0.5);
        chairmanText.position.set(x, y);      
        x +=50
        y += 100;

        const textPlayerBackground = new Graphics()
            .roundRect(x - 200, y-20, 350, 60, 5)
            .fill(0x323232) 
            .stroke({ width: 2, color: 0x000000 });
        console.log("here:", player)
       
        const characterText = new Text({
            text: player.character!.name ,
            style: { fill: '#ffffff', fontSize: 18, fontFamily: 'MyFont' }
        });
        characterText.anchor.set(0, 0.5);
        characterText.position.set(x-140, y);
        
        texture = await Assets.load(player.character!.iconPath);
        const characterIcon = new Sprite(texture);
        characterIcon.position.set(x-200, y);
        characterIcon.width = 80;
        characterIcon.height = 90;
        characterIcon.anchor.set(0.5);
        
       
        
        const playerText = new Text({
            text: player.name,
            style: { fill: '#CBC28E', fontSize: 18, fontFamily: 'MyFont' }
        });
        playerText.anchor.set(0, 0.5);
        playerText.position.set(x-140, y+20);

        tempContainer.addChild(chairmanIcon);
        tempContainer.addChild(textChairmanBackground);   
        tempContainer.addChild(chairmanText);
        tempContainer.addChild(textPlayerBackground);  
        tempContainer.addChild(playerText);
        tempContainer.addChild(characterText);
        tempContainer.addChild(characterIcon);

        this._addPopupCloseButton(tempContainer);
        
        this.popupContainer.addChild(tempContainer);
    }

    async StakeholdersPerk(characters: Character[], onSelectCallback: (_: Character) => void) {
        const tempContainer = this._createPopupBase();
        const x = this.app.screen.width / 2;
        let y = this.app.screen.height / 2-300;

        const texture = await Assets.load("./miscellaneous/ShareholderIcon.png"); // here
        const characterIcon = new Sprite(texture);
        characterIcon.position.set(x, y);
        characterIcon.width = 160;
        characterIcon.height = 180;
        characterIcon.anchor.set(0.5);

        y+=90;

        const perkBackground = new Graphics()
            .roundRect(x - 120, y-25 , 240, 50, 5)
            .fill(0x60584C) 
            .stroke({ width: 2, color: 0x000000 });

        
        const perkText = new Text({
            text: 'Shareholder’s perk', // here
            style: { fill: '#ffffff', fontSize: 24, fontFamily: 'MyFont' }
        });
        perkText.anchor.set(0.5);
        perkText.position.set(x, y);
        y+= 70;

        const descriptionBackground = new Graphics()
        .roundRect(x - 200, y-30, 400, 60, 5)
        .fill(0x323232) 
        .stroke({ width: 2, color: 0x000000 });

        const descriptionText = new Text({
            text: 'Please select a character you want to fire this round', // here
            style: { fill: '#ffffff', fontSize: 18, fontFamily: 'MyFont' }
        });
        descriptionText.anchor.set(0.5);
        descriptionText.position.set(x, y);
        y+=100

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
    

        this.popupContainer.addChild(tempContainer);
        return tempContainer;
    }

    async firedCharacter(character: Character, localPlayer: Player) {
        const tempContainer = this._createPopupBase();
        let x = this.app.screen.width / 2;
        let y = this.app.screen.height / 2-120;

        let texture = await Assets.load("./miscellaneous/ShareholderIcon.png");
        const chairmanIcon = new Sprite(texture);
        
        chairmanIcon.position.set(x, y);
        chairmanIcon.width = 200;
        chairmanIcon.height = 240;
        chairmanIcon.anchor.set(0.5);
        y +=100;

        const textChairmanBackground = new Graphics()
            .roundRect(x - 120, y-25 , 240, 50, 5)
            .fill(0x60584C) 
            .stroke({ width: 2, color: 0x000000 });

        const chairmanText = new Text({
            text: "The Shareholder fired...",
            style: { fill: '#ffffff', fontSize: 20, fontFamily: 'MyFont' }
        });
        chairmanText.anchor.set(0.5);
        chairmanText.position.set(x, y);      
        x +=50
        y += 100;

        const textPlayerBackground = new Graphics()
            .roundRect(x - 200, y-20, 350, 60, 5)
            .fill(0x323232) 
            .stroke({ width: 2, color: 0x000000 });

        const characterText = new Text({
            text: character.name,
            style: { fill: '#ffffff', fontSize: 18, fontFamily: 'MyFont' }
        });
        characterText.anchor.set(0, 0.5);
        characterText.position.set(x-140, y);

        

        texture = await Assets.load(character.iconPath);
        const characterIcon = new Sprite(texture);
        characterIcon.position.set(x-200, y);
        characterIcon.width = 80;
        characterIcon.height = 90;
        characterIcon.anchor.set(0.5);

        tempContainer.addChild(chairmanIcon);
        tempContainer.addChild(textChairmanBackground);   
        tempContainer.addChild(chairmanText);
        tempContainer.addChild(textPlayerBackground);  
        tempContainer.addChild(characterText);
        tempContainer.addChild(characterIcon);

       
        if(localPlayer.character === character){
            const playerText = new Text({
                text: "You have been fired",
                style: { fill: '#CBC28E', fontSize: 18, fontFamily: 'MyFont' }
            });
            playerText.anchor.set(0, 0.5);
            playerText.position.set(x-140, y+20);
            tempContainer.addChild(playerText);
        }
        
        this._addPopupCloseButton(tempContainer);

        this.popupContainer.addChild(tempContainer);
    }

    async youCharacterAbility(character: Character, perk: string) {
        const tempContainer = this._createPopupBase();
        const x = this.app.screen.width / 2;
        let y = this.app.screen.height / 2-50;

        const texture = await Assets.load(character.iconPath);
        const characterIcon = new Sprite(texture);
        
        characterIcon.position.set(x, y);
        characterIcon.width = 200;
        characterIcon.height = 240;
        characterIcon.anchor.set(0.5);
        y +=100;

       

        const chairmanText = new Text({
            text: perk,
            style: { fill: '#ffffff', fontSize: 20, fontFamily: 'MyFont' }
        });
        chairmanText.anchor.set(0.5);
        chairmanText.position.set(x, y);

        const padding = 20;
        const textChairmanBackground = new Graphics()
            .roundRect(0, 0 , chairmanText.width + padding, chairmanText.height + padding, 5)
            .fill(0x60584C) 
            .stroke({ width: 2, color: 0x000000 });
        textChairmanBackground.pivot.set(textChairmanBackground.width / 2, textChairmanBackground.height / 2);
        textChairmanBackground.position.set(x, y);

        this._addPopupCloseButton(tempContainer);
        
        tempContainer.addChild(characterIcon); 
        tempContainer.addChild(textChairmanBackground);   
        tempContainer.addChild(chairmanText);        

        this.popupContainer.addChild(tempContainer);
    }
    async youAreDivesting(divestmentTargets: DivestmentTarget[] ,onSelectCallback: (playerID: number, cardIndex: number) => void) {
        
        const tempContainer = this._createPopupBase();
        const x = this.app.screen.width / 2;
        let y = this.app.screen.height / 2-250;



        const texture = await Assets.load("./miscellaneous/StakeholderIcon.png"); // here
        const characterIcon = new Sprite(texture);
        characterIcon.position.set(x, y);
        characterIcon.width = 160;
        characterIcon.height = 180;
        characterIcon.anchor.set(0.5);

        y+=90;

        const perkBackground = new Graphics()
            .roundRect(x - 120, y-25 , 240, 50, 5)
            .fill(0x60584C) 
            .stroke({ width: 2, color: 0x000000 });

        
        const perkText = new Text({
            text: 'Stakeholder’s perk', // here
            style: { fill: '#ffffff', fontSize: 24, fontFamily: 'MyFont' }
        });
        perkText.anchor.set(0.5);
        perkText.position.set(x, y);
        y+= 70;
        const descriptionBackground = new Graphics()
        .roundRect(x - 200, y-30, 400, 60, 5)
        .fill(0x323232) 
        .stroke({ width: 2, color: 0x000000 });

        const descriptionText = new Text({
            text: 'Please select a player you want to force to divest', // here
            style: { fill: '#ffffff', fontSize: 18, fontFamily: 'MyFont' }
        });
        descriptionText.anchor.set(0.5);
        descriptionText.position.set(x, y);
        y+=100;        

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
        let startX = this.app.screen.width / 2 - (columnWidth * playerCount) / 2;
        
        for (const target of divestmentTargets) {

            const playerX = startX + columnWidth / 2;
            let playerY = 450; 

            const name = new Text({
                text: target.player.name,
                style:{fill:"#fff",fontSize:18,fontFamily:"MyFont"}
            });
            name.anchor.set(0.5);
            name.position.set(playerX, playerY);
            tempContainer.addChild(name);

            playerY += 30;

            const totalWidth = target.assets.length * cardWidth + (target.assets.length - 1) * cardSpacing;
            let cardStartX = playerX - totalWidth / 2;

            for(const card of target.assets){
                const tex = await Assets.load(card.asset.texturePath);
                const sprite = new Sprite(tex);
                sprite.scale.set(cardScale);
                sprite.anchor.set(0.5);
                sprite.interactive = true;
                sprite.position.set(cardStartX + cardWidth / 2, playerY + cardHeight/2);
                sprite.on('mousedown', () => onSelectCallback(target.player.playerID, target.player.assetList.indexOf(card.asset)));
                tempContainer.addChild(sprite);
                cardStartX += cardWidth + cardSpacing;
            }

            startX += columnWidth; // move to next player column
        }


       

        this._addPopupCloseButton(tempContainer);

        this.popupContainer.addChild(tempContainer);

        return tempContainer;
    }
    
    async youRegulatorOptions(options: RegulatorSwapPlayer[], perk: string, gameState: GameState, onSelectCallback1: (id: PlayerId) => void, onSelectCallback2: (card_idxs: number[]) => void){
        const tempContainer = this._createPopupBase();
        const x = this.app.screen.width / 2;
        let y = this.app.screen.height / 2-250;

        const texture = await Assets.load("./miscellaneous/RegulatorIcon.png"); // here
        const characterIcon = new Sprite(texture);
        characterIcon.position.set(x, y);
        characterIcon.width = 160;
        characterIcon.height = 180;
        characterIcon.anchor.set(0.5);

        y+=90;

        const perkBackground = new Graphics()
            .roundRect(x - 120, y-25 , 240, 50, 5)
            .fill(0x60584C) 
            .stroke({ width: 2, color: 0x000000 });

        
        const perkText = new Text({
            text: 'Regulators’s perk', // here
            style: { fill: '#ffffff', fontSize: 24, fontFamily: 'MyFont' }
        });
        perkText.anchor.set(0.5);
        perkText.position.set(x, y);
        y+= 70;
      

        const descriptionText = new Text({
            text: perk, // here
            style: { fill: '#ffffff', fontSize: 18, fontFamily: 'MyFont' }
        });
        descriptionText.anchor.set(0.5);
        descriptionText.position.set(x, y);

        const descriptionBackground = new Graphics()
        .roundRect(x - (descriptionText.width+20)/2, y-(descriptionText.height+20)/2, descriptionText.width+20, descriptionText.height+20, 5)
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
        let startX = this.app.screen.width / 2 - (columnWidth * playerCount) / 2;

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
            assetCount.position.set(assetStartX, playerY + cardHeight+20);
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
            liabilityCount.position.set(liabilityStartX, playerY + cardHeight+20);
            tempContainer.addChild(liabilityCount);
        

            startX += columnWidth; // move to next player column
        }
        const orText = new Text({
                text: `OR`,
                style: { fill: "#fff", fontSize: 32, fontFamily: "MyFont" }
            });
        orText.anchor.set(0.5);
        orText.position.set(this.app.screen.width/2, 600);
        tempContainer.addChild(orText);

        const deckButton = new FancyButton({
            text: "SWAP WITH DECK",
            width: 250,
            height: 60,
            onPress: () => {
                // Close the current popup and open the deck swap one
                this.popupContainer.removeChild(tempContainer);   
                this.displaySwapWithDeckPopup(gameState.getLocalPlayer(), (card_idxs) => {
                    onSelectCallback2(card_idxs); 
                });
            }
        }); 
        deckButton.view.position.set((this.app.screen.width-deckButton.view.width)/2, 650);
        tempContainer.addChild(deckButton.view);



        this._addPopupCloseButton(tempContainer);

        this.popupContainer.addChild(tempContainer);
    }

    async displaySwapWithDeckPopup(player: Player, onConfirmCallback: (card_idxs: number[]) => void) {
        const tempContainer = this._createPopupBase();
        const x = this.app.screen.width / 2;
        let y = this.app.screen.height / 2 - 250;

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
        okButton.view.position.set(this.app.screen.width / 2 - (okButton.view.width / 2), this.app.screen.height - 100);
        tempContainer.addChild(okButton.view);

        this.popupContainer.addChild(tempContainer);
        return tempContainer;
    }

    async displayRegulatorSwapNotification(regulatorPlayer: Player) {
        const tempContainer = this._createPopupBase();
        const x = this.app.screen.width / 2;
        let y = this.app.screen.height / 2 - 150;

        // Regulator Icon
        const texture = await Assets.load("./miscellaneous/RegulatorIcon.png");
        const regulatorIcon = new Sprite(texture);
        regulatorIcon.position.set(x, y);
        regulatorIcon.width = 200;
        regulatorIcon.height = 220;
        regulatorIcon.anchor.set(0.5);
        y += 130;

        // "The Regulator..." text
        const titleText = new Text({
            text: `The Regulator (${regulatorPlayer.name})`,
            style: { fill: '#ffffff', fontSize: 24, fontFamily: 'MyFont' }
        });
        titleText.anchor.set(0.5);
        titleText.position.set(x, y);
        y += 40;

        // "...swapped cards with you" text
        const infoText = new Text({
            text: "has swapped cards with you.",
            style: { fill: '#CBC28E', fontSize: 20, fontFamily: 'MyFont' }
        });
        infoText.anchor.set(0.5);
        infoText.position.set(x, y);

        const background = new Graphics()
            .roundRect(0, 0, Math.max(titleText.width, infoText.width) + 40, titleText.height + infoText.height + 50, 10)
            .fill(0x323232)
            .stroke({ width: 2, color: 0x000000 });
        background.pivot.set(background.width / 2, 0);
        background.position.set(x, y - 50);

        tempContainer.addChild(regulatorIcon, background, titleText, infoText);
        this._addPopupCloseButton(tempContainer);
        this.popupContainer.addChild(tempContainer);
    }

    async displayPlayerSwapNotification(regulatorPlayer: Player, targetPlayer: Player) {
        const tempContainer = this._createPopupBase();
        const x = this.app.screen.width / 2;
        let y = this.app.screen.height / 2 - 150;

        // Regulator Icon
        const texture = await Assets.load("./miscellaneous/RegulatorIcon.png");
        const regulatorIcon = new Sprite(texture);
        regulatorIcon.position.set(x, y);
        regulatorIcon.width = 200;
        regulatorIcon.height = 220;
        regulatorIcon.anchor.set(0.5);
        y += 130;

        // "The Regulator..." text
        const titleText = new Text({
            text: `The Regulator (${regulatorPlayer.name})`,
            style: { fill: '#ffffff', fontSize: 24, fontFamily: 'MyFont' }
        });
        titleText.anchor.set(0.5);
        titleText.position.set(x, y);
        y += 40;

        // "...swapped cards with player" text
        const infoText = new Text({
            text: `has swapped cards with ${targetPlayer.name}.`,
            style: { fill: '#CBC28E', fontSize: 20, fontFamily: 'MyFont' }
        });
        infoText.anchor.set(0.5);
        infoText.position.set(x, y);

        const background = new Graphics()
            .roundRect(0, 0, Math.max(titleText.width, infoText.width) + 40, titleText.height + infoText.height + 50, 10)
            .fill(0x323232)
            .stroke({ width: 2, color: 0x000000 });
        background.pivot.set(background.width / 2, 0);
        background.position.set(x, y - 50);

        tempContainer.addChild(regulatorIcon, background, titleText, infoText);
        this._addPopupCloseButton(tempContainer);
        this.popupContainer.addChild(tempContainer);
    }
    
    displayMarketPopup(marketState: MarketState, onSelectCallback: (color: Color) => void, confirmAssetAbilityCall: (index: number) => void, cardIndex: number) {
        const tempContainer = this._createPopupBase();
        
        const width = 420;
        const height = 100;
        
        const marketContent = new Container();
        marketContent.x = (this.app.screen.width - width) / 2;
        marketContent.y = (this.app.screen.height - height) / 2;

        const background = new Graphics()
            .roundRect(0, 0, width, height, 15)
            .fill(0x61594C); // Dark Indigo

        marketContent.addChild(background);

        const colors = [
            { name: 'Yellow', value: marketState.Yellow },
            { name: 'Blue', value: marketState.Blue },
            { name: 'Green', value: marketState.Green },
            { name: 'Purple', value: marketState.Purple },
            { name: 'Red', value: marketState.Red }
        ];

        const circleRadius = 30;
        const circleY = height /2;
        const spacing = 80;
        const totalCircleWidth = (colors.length - 1) * spacing;
        const startX = (width - totalCircleWidth) / 2;

        colors.forEach((colorInfo, index) => {
            const circleX = startX + index * spacing;
            const circle = new Graphics()
                .circle(0, 0, circleRadius)
                .fill(colorInfo.name.toLowerCase())
                .stroke({ width: 2, color: 0x000000 });
            circle.position.set(circleX, circleY);
            
            circle.interactive = true;
            circle.cursor = 'pointer';
            circle.on('mousedown', () => onSelectCallback(colorInfo.name as Color));

            marketContent.addChild(circle);

            const statusIndicator = new Text({
                text: '',
                style: { 
                    fill: '#000000ff', 
                    fontSize: 30, 
                    fontFamily: 'MyFont'
                }
            });
            statusIndicator.anchor.set(0.5);
            statusIndicator.position.set(circleX, circleY); // here

            if (colorInfo.value === 'down') {
                statusIndicator.text = '-';
             
            } else if (colorInfo.value === 'up') {
                statusIndicator.text = '+';
              
            } else if (colorInfo.value === 'Zero') {
                statusIndicator.text = '0';
            }
            marketContent.addChild(statusIndicator);
        });

        const confirmButton = new FancyButton({
            text: "Confirm",
            width: 200,
            height: 60,
            onPress: () => {
                confirmAssetAbilityCall(cardIndex);
                if (tempContainer.parent) {
                    tempContainer.parent.removeChild(tempContainer);
                }
            }
        });
        confirmButton.view.position.set(this.app.screen.width / 2 - (confirmButton.view.width / 2), this.app.screen.height - 180);
        tempContainer.addChild(confirmButton.view);

        tempContainer.addChild(marketContent);
        this._addPopupCloseButton(tempContainer);
        
        this.popupContainer.addChild(tempContainer);

    
    }
    _createPopupBase() {
        this.popupContainer.removeChildren();

        const tempContainer = new Container();
        const gradient = new FillGradient({
            type: 'radial',
            center: { x: 0.5, y: 0.5 },
            innerRadius: 0.2,
            outerCenter: { x: 0.5, y: 0.5 },
            outerRadius: .5,
            colorStops: [
                { offset: 0, color: 0x000000 },
                { offset: 1, color: 0x1c1c1c },
            ],
        });

        const darkenBackground = new Graphics()
            .rect(0, 0, this.app.screen.width, this.app.screen.height)
            .fill(gradient);
        darkenBackground.alpha = 0.8;
        darkenBackground.interactive = true;

        tempContainer.addChild(darkenBackground);
        return tempContainer;
    }

    _addPopupCloseButton(popupContainer: Container) {
        const okButton = new FancyButton({
            text: "CLOSE",
            width: 200,
            height: 60,
            onPress: () => {
                // Always remove the popup from its parent container
                if (popupContainer.parent) {
                    popupContainer.parent.removeChild(popupContainer);
                }
            }
        });
        okButton.view.position.set(this.app.screen.width / 2 - (okButton.view.width / 2), this.app.screen.height - 100);
        popupContainer.addChild(okButton.view);
    }
}

export default PopUpManager;