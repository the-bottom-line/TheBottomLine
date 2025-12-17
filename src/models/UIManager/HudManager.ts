import { Container, Graphics, Text, Sprite, Assets, Application, TextStyle } from 'pixi.js';
import { FancyButton } from '../FancyButton.js';
import type Player from '../Player.js';
import type Character from '../Characters.js';
import type Liability from '../Liability.js';
import type Asset from '../Asset.js';
import type { CardType, MarketCard } from '@shared-types';

class HudManager {
    app: Application;
    _nextPlayedCardZIndex = 1;

    statsText = new Text({
        text: '',
        style: {
            fill: '#ffffff',
            fontSize: 36,
            fontFamily: 'MyFont',
        }
    });
    constructor(app: Application) {
            this.app = app;
    
            this.statsText.anchor.set(0.5);
            this.statsText.position.set(this.app.screen.width / 2, 30);
    
        }

     displayAllPlayerStats(players: Player[], container: Container, currentPlayer: Player) { // here
        
        players.forEach(async (player, playerIndex) => {
            const texture = await Assets.load(player.reveal && player.character ? player.character.iconPath : "./miscellaneous/noneCharacter.png");
            const characterIcon = new Sprite(texture);
            const x = 30 + playerIndex * 70;
            characterIcon.position.set(x, 30);
            characterIcon.width = 50;
            characterIcon.height = 55.7;
            characterIcon.anchor.set(0.5);
            characterIcon.eventMode = 'static'; // Make interactive
            characterIcon.cursor = 'pointer'; // make it look clickable by changing cursor
            container.addChild(characterIcon);

            if (player === currentPlayer) {
                const outline = new Graphics()
                    .circle(0, 0, 27)
                    .stroke({ width: 5, color: 0xCBC28E });
                outline.position.set(x, 32.5);
                container.addChild(outline);
                container.addChild(characterIcon); // ensure icon is on top of outline
            }

            const playerName = new Text({
                text: player.name,
                style: { fill: '#ffffff', fontSize: 20, fontFamily: 'MyFont' }
            });
            playerName.anchor.set(0.5);
            playerName.position.set(x, 70);
            container.addChild(playerName);

            const statsContainer = new Container();
            statsContainer.visible = false; // Hidden by default only active when you hover over the character icon
            container.addChild(statsContainer);

            const colors = ["blue", "green", "purple", "red", "yellow"];
            const statsBackground = new Sprite(await Assets.load("./miscellaneous/statsbg.svg"));

            
            statsBackground.position.set(20, 120);
            statsContainer.addChild(statsBackground);

            colors.forEach((color, index) => {


                const type = new Graphics()
                    .roundRect(150 - 30 + index * 50, 230, 30, 30)
                    .fill(color);
                statsContainer.addChild(type);

                const assetsOfColor = player.assetList.filter(asset => asset.color.toLowerCase() === color);
                const totalGold = assetsOfColor.reduce((sum, asset) => sum + asset.gold, 0);
                const totalSilver = assetsOfColor.reduce((sum, asset) => sum + asset.silver, 0);

                const gold = new Graphics()
                    .roundRect(150 - 30 + index * 50, 270 + 2.5, 25, 25)
                    .fill("gold");
                statsContainer.addChild(gold);

                const playerGold = new Text({
                    text: totalGold.toString(),
                    style: { fill: '#000000ff', fontSize: 24, fontFamily: 'MyFont' }
                });
                playerGold.anchor.set(0.5);
                playerGold.position.set(150 - 30 + index * 50 + 12.5, 270 + 15);
                statsContainer.addChild(playerGold);

                const silver = new Graphics()
                    .roundRect(150 - 30 + index * 50, 310 + 2.5, 25, 25)
                    .fill("silver");
                statsContainer.addChild(silver);

                const playerSilver = new Text({
                    text: totalSilver.toString(),
                    style: { fill: '#000000ff', fontSize: 24, fontFamily: 'MyFont' }
                });
                playerSilver.anchor.set(0.5);
                playerSilver.position.set(150 - 30 + index * 50 + 12.5, 310 + 15);
                statsContainer.addChild(playerSilver);

                const playerCash = new Text({
                    text: player.cash.toString(),
                    style: { fill: '#ffffff', fontSize: 24, fontFamily: 'MyFont' }
                });
                playerCash.anchor.set(0.5);
                playerCash.position.set(150 - 25, 405);
                statsContainer.addChild(playerCash);
            });

            
            characterIcon.on('pointerover', () => {
                statsContainer.visible = true;
            });// when you hover over the character icon the container becomes visible

            characterIcon.on('pointerout', () => {
                statsContainer.visible = false;
            });
            
            /*player.assetList.forEach((card, cardIndex) => {
                const rect = new Graphics()
                    .roundRect(x - 20, 80 + cardIndex * 30, 20, 20, 50)
                    .fill(card.color);
                container.addChild(rect);
            });*/
        });
    }
    async displayPlayerPlayedCards(assets: Asset[], liabilities: Liability[], playedCardsContainer: Container){
        playedCardsContainer.removeChildren();
        const texture = await Assets.load('./miscellaneous/cardBackdrop.svg');
        const cardBackdrop = Sprite.from(texture);
        cardBackdrop.width = 250;
        cardBackdrop.height = 250;
        cardBackdrop.anchor.set(0.5);
        cardBackdrop.position.set(this.app.screen.width / 2, this.app.screen.height / 2 - 10);
        
        playedCardsContainer.addChild(cardBackdrop);

        assets.forEach(card => {
            this.addCardToPlayedContainer(card, playedCardsContainer);
        });
        liabilities.forEach(card => {
            this.addCardToPlayedContainer(card, playedCardsContainer);
        });
    }

    addCardToPlayedContainer(card: Asset | Liability, playedCardsContainer: Container) {
        card.sprite.zIndex = this._nextPlayedCardZIndex++;
        playedCardsContainer.addChild(card.sprite);
    }

    removeCardFromPlayedContainer(card: Asset | Liability, playedCardsContainer: Container) {
        playedCardsContainer.removeChild(card.sprite);
    }

    async displayOtherPlayerHand(assets: Extract<CardType, 'Asset'>[], liabilities: Extract<CardType, 'Liability'>[], elseTurnContainer: Container) {        
        const oldCardBacks = elseTurnContainer.children.filter(child => child.label === 'otherPlayerCardBack');
        oldCardBacks.forEach(child => elseTurnContainer.removeChild(child));


        const baseY = this.app.screen.height - 100;
        const spacing = 60;
        
        const totalAssetsWidth = (assets.length - 1) * spacing;
        const assetsStartX = this.app.screen.width / 2 - totalAssetsWidth - 100;
        const assetBackTexture = await Assets.load("./assets/asset_back.webp");
    
        for (let i = 0; i < assets.length; i++) {
            const cardBack = new Sprite(assetBackTexture);
            cardBack.scale.set(0.25);
            cardBack.anchor.set(0.5);
            cardBack.label = 'otherPlayerCardBack';
            cardBack.x = assetsStartX + i * spacing;
            cardBack.y = baseY;
            elseTurnContainer.addChild(cardBack);
        }
    
        const totalLiabilitiesWidth = (liabilities.length > 0 ? liabilities.length - 1 : 0) * spacing;
        const liabilitiesStartX = this.app.screen.width / 2 + 100 + totalLiabilitiesWidth;
        const liabilityBackTexture = await Assets.load("liabilities/liability_back.webp");
    
        for (let i = 0; i < liabilities.length; i++) {
            const cardBack = new Sprite(liabilityBackTexture);
            cardBack.scale.set(0.25);
            cardBack.anchor.set(0.5);
            cardBack.label = 'otherPlayerCardBack';
            cardBack.x = liabilitiesStartX - i * spacing;
            cardBack.y = baseY;
            elseTurnContainer.addChild(cardBack);
        }
    }

    createNextTurnButton(onPressCallback: () => void, mainContainer: Container) {
        const nextButton = new FancyButton({
            text: "End Turn",
            width: 200,
            height: 60,
            onPress: onPressCallback
        });
        nextButton.view.position.set(this.app.screen.width - 150 - (nextButton.view.width / 2), this.app.screen.height - 100);
        mainContainer.addChild(nextButton.view);
    }

    showMarket(marketData: MarketCard, marketContainer: Container){
        if (!marketData) {
            return;
        }
        
        marketContainer.removeChildren();
        
        const width = 320;
        const height = 120;
        const x = (this.app.screen.width - width) / 2;
        const y = 10; // A little padding from the top

        const background = new Graphics()
            .roundRect(0, 0, width, height, 15)
            .fill(0x61594C); // Dark Indigo
        marketContainer.position.set(x, y);
        marketContainer.addChild(background);

        // Top half: 5 colored circles with status
        const colors = [
            { name: 'Yellow', value: marketData.Yellow },
            { name: 'Blue', value: marketData.Blue },
            { name: 'Green', value: marketData.Green },
            { name: 'Purple', value: marketData.Purple },
            { name: 'Red', value: marketData.Red }
        ];

        const circleRadius = 20;
        const circleY = height / 3-10;
        const spacing = 60;
        const totalCircleWidth = (colors.length - 1) * spacing;
        const startX = (width - totalCircleWidth) / 2;

        colors.forEach((colorInfo, index) => {
            const circleX = startX + index * spacing;
            const circle = new Graphics()
                .circle(0, 0, circleRadius)
                .fill(colorInfo.name.toLowerCase())
                .stroke({ width: 2, color: 0x000000 });
            circle.position.set(circleX, circleY);
            circle.label = colorInfo.name;
            marketContainer.addChild(circle);

            const statusIndicator = new Text({
                text: '',
                style: { 
                    fill: '#000000ff', 
                    fontSize: 30, 
                }
            });
            statusIndicator.anchor.set(0.5);
            statusIndicator.position.set(circleX, circleY); 

            if (colorInfo.value === 'down') {
                statusIndicator.text = '-';
             
            } else if (colorInfo.value === 'up') {
                statusIndicator.text = '+';
              
            } else if (colorInfo.value === 'zero') {
                statusIndicator.text = '0';
            }
            marketContainer.addChild(statusIndicator);
        });

        // Separator lines
        const horizontalLine = new Graphics()
            .moveTo(10, height / 2)
            .lineTo(width - 10, height / 2)
            .stroke({ width: 2, color: 0x000000 });
        marketContainer.addChild(horizontalLine);

        const verticalLine = new Graphics()
            .moveTo(width / 2, height / 2 + 5)
            .lineTo(width / 2, height - 5)
            .stroke({ width: 2, color: 0x000000 });
        marketContainer.addChild(verticalLine);

        // Bottom half: RFR and MRP values
        const textStyle = new TextStyle({ 
            fill: '#ffffffff', 
            fontSize: 30, 
            fontFamily: 'MyFont',
            stroke: { color: '#000000', width: 4, join: 'round' }
        });
        const rfrText = new Text({
            text: `RFR + ${marketData.rfr}%`,
            style: textStyle
        });
        rfrText.anchor.set(0.5);
        rfrText.position.set(width / 3 - 20, height * 0.75);
        marketContainer.addChild(rfrText);

        const mrpText = new Text({ text: `MRP + ${marketData.mrp}%`, style: textStyle });
        mrpText.anchor.set(0.5);
        mrpText.position.set(width * (2 / 3) + 20, height * 0.75);
        marketContainer.addChild(mrpText);
    }
    async displayPlayerCharacter(player: Player, container: Container, onIconClick?: (_: Character) => void) { 
        if (!player?.character) return;

        const tempContainer = new Container();
        container.addChild(tempContainer);

        const texture = await Assets.load(player.character.iconPath);
        const characterIcon = new Sprite(texture);
        if (onIconClick) {
            characterIcon.interactive = true;
            characterIcon.cursor = 'pointer';
            characterIcon.on('mousedown', () => {
                onIconClick(player.character!)
            });
        }
        characterIcon.scale.set(0.25);
        characterIcon.anchor.set(0.5, 1);
        

        tempContainer.addChild(characterIcon);

        const nameText = new Text({
            text: player.character.name,
            style: {
                fill: '#f2e8d5',
                fontSize: 20,
                fontFamily: 'MyFont',
            }
        });
        nameText.anchor.set(0.5, 0);
        nameText.position.set(0, 10);

        const nameBackground = new Graphics()
            .roundRect(0, 0, nameText.width + 20, nameText.height + 15, 10)
            .fill(0x60594C); 
        nameBackground.pivot.set(nameBackground.width / 2, 0);
        nameBackground.position.set(0, 5);

        tempContainer.addChild(nameBackground, nameText);
        tempContainer.position.set((tempContainer.width / 2) + 50, this.app.screen.height - 80);
    }
    async displayRevealedCharacters(players: Player[], container: Container) {

        const sortedPlayerList = [...players].sort((a, b) => {
            const aIsRevealed = a.reveal && a.character;
            const bIsRevealed = b.reveal && b.character;

            // TODO: reveal is pobably redundent 
            if (a.reveal && a.character && b.reveal && b.character) {
               
                return a.character.order - b.character.order;
            } else if (aIsRevealed) {
               
                return -1;
            } else if (bIsRevealed) {
                
                return 1;
            } else {
               
                return 0; 
            }
        });
       
        let index = 0;
        for (const player of sortedPlayerList) {
            let texturePath;
            
            if (player.reveal && player.character) {
               
                texturePath = player.character.texturePath;
            } else {
                
                texturePath = "./miscellaneous/character_back.webp";
            }
           
            const texture = await Assets.load(texturePath);
            const characterCard = new Sprite(texture);
            
            const y = 50 + index * 100; 
            characterCard.x = this.app.screen.width - 100;
            characterCard.y = y;
            characterCard.scale.set(0.15);
            characterCard.anchor.set(0.5);
            characterCard.rotation = 90 * Math.PI / 180;
            container.addChild(characterCard);

            index++;
        }
    }
    
}
export default HudManager;
