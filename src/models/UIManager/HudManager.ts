import { Container, Graphics, Text, Sprite, Assets, Application, TextStyle } from 'pixi.js';
import { FancyButton } from '../FancyButton.js';
import type Player from '../Player.js';
import type Character from '../Characters.js';
import Liability from '../Liability.js';
import Asset from '../Asset.js';
import type { CardType, Color, MarketCard } from '@shared-types';
import { GlowFilter } from 'pixi-filters';
import { marketColors } from '../theme.js';



class HudManager {
    app: Application;
    _nextPlayedCardZIndex = 1;

    
    constructor(app: Application) {
            this.app = app;
        }

    displayAllPlayerStats(players: Player[], container: Container, currentPlayer: Player,localPlayer:Player) { 
        const existingStats = this.app.stage.getChildByLabel("playerStatsGroup");
        if (existingStats) {
            existingStats.destroy({ children: true });
        }

        const statsGroup = new Container(); 
        statsGroup.label = "playerStatsGroup";
        this.app.stage.addChild(statsGroup); 
        this.app.stage.setChildIndex(statsGroup, this.app.stage.children.length - 1); 
        
        players.forEach(async (player, playerIndex) => {
            const texture = await Assets.load(player.reveal && player.character ? player.character.iconPath : "./miscellaneous/noneCharacter.png");
            const characterIcon = new Sprite(texture);
            const x = 30 + playerIndex * 70;
            characterIcon.position.set(x, 30);
            characterIcon.width = 50;
            characterIcon.height = 55.7;
            characterIcon.anchor.set(0.5);
            characterIcon.eventMode = 'static'; 
            characterIcon.cursor = 'pointer'; 
            statsGroup.addChild(characterIcon);

            if (player === currentPlayer) {
                const outline = new Graphics()
                    .circle(0, 0, 27)
                    .stroke({ width: 5, color: 0xCBC28E });
                outline.position.set(x, 32.5);
                statsGroup.addChild(outline);
                statsGroup.addChild(characterIcon); 
            }

            const playerName = new Text({
                text: player.name,
                style: { fill: '#ffffff', fontSize: 20, fontFamily: 'MyFont' }
            });
            playerName.anchor.set(0.5);
            playerName.position.set(x, 70);
            statsGroup.addChild(playerName);

            const statsContainer = new Container();
            statsContainer.visible = false; 
            statsGroup.addChild(statsContainer);

            const statsBackground = new Graphics()
                .rect(0, 0, 870, 340)
                .fill(0x2A2B2A)
                .stroke({ width: 2, color: 0x60584C })
                .rect(61.5, 93.5, 285, 170)
                .fill(0x2A2B2A)
                .stroke({ width: 1, color: 0x60584C })
                .rect(464, 169, 172, 100)
                .fill({ color: 0x333333, alpha: 0.5 })
                .rect(659, 169, 173, 100)
                .fill({ color: 0x333333, alpha: 0.5 })
                .moveTo(444.5, 17)
                .lineTo(444.5, 304)
                .stroke({ width: 1, color: 0xFFFFFF, alpha: 0.5 })
                .circle(61, 93, 4.5).stroke({ width: 1, color: 0x60584C })
                .circle(347, 93, 4.5).stroke({ width: 1, color: 0x60584C })
                .circle(61, 263, 4.5).stroke({ width: 1, color: 0x60584C })
                .circle(347, 263, 4.5).stroke({ width: 1, color: 0x60584C });

            
            statsBackground.position.set(20, 120);
            statsContainer.addChild(statsBackground);

            
            const titleStyle = new TextStyle({
                fill: '#ffffff',
                fontSize: 28,
                fontFamily: 'MyFont',
                stroke: { color: '#000000', width: 2, join: 'round' }
            });

            const descriptionStyle = new TextStyle({
                fill: '#ffffff',
                fontSize: 24,
                fontFamily: 'MyFont',
                stroke: { color: '#000000', width: 1, join: 'round' }
            });

            // Add "STATS" title
            const statsTitle = new Text({
                text: 'STATS',
                style: titleStyle
            });
            statsTitle.anchor.set(0.5);
            statsTitle.position.set(20 + (444.5 / 2), 170); 
            statsContainer.addChild(statsTitle);

            
            const cardsTitle = new Text({
                text: 'CARDS',
                style: titleStyle
            });
            cardsTitle.anchor.set(0.5);
            cardsTitle.position.set(20 + 444.5 + (870 - 444.5) / 2, 170); 
            statsContainer.addChild(cardsTitle);

            const startX = 109;
            const colors = (Object.keys(marketColors) as Color[]).map(color => ({
                name: color,
                hex: marketColors[color],
            })).reverse();
            colors.forEach((color, index) => {
                const type = new Graphics()
                    .roundRect(startX + (4 - index) * 50, 230, 30, 30)
                    .fill(color.hex)
                    .stroke({ width: 3, color: 0x000000 });
                statsContainer.addChild(type);

                const assetsOfColor = player.assetList.filter(asset => asset.color === color.name);
                const totalGold = assetsOfColor.reduce((sum, asset) => sum + asset.gold, 0);
                const totalSilver = assetsOfColor.reduce((sum, asset) => sum + asset.silver, 0);

                const gold = new Graphics()
                    .roundRect(startX + index * 50, 280 + 2.5, 25, 25)
                    .fill("gold")
                    .stroke({ width: 3, color: 0x000000 });
                statsContainer.addChild(gold);

                const playerGold = new Text({
                    text: totalGold.toString(),
                    style: { fill: '#000000ff', fontSize: 24, fontFamily: 'MyFont' }
                });
                playerGold.anchor.set(0.5);
                playerGold.position.set(startX + index * 50 + 12.5, 280 + 15);
                statsContainer.addChild(playerGold);

                const silver = new Graphics()
                    .roundRect(startX + index * 50, 330 + 2.5, 25, 25)
                    .fill("silver")
                    .stroke({ width: 3, color: 0x000000 });
                statsContainer.addChild(silver);

                const playerSilver = new Text({
                    text: totalSilver.toString(),
                    style: { fill: '#000000ff', fontSize: 24, fontFamily: 'MyFont' }
                });
                playerSilver.anchor.set(0.5);
                playerSilver.position.set(startX + index * 50 + 12.5, 330 + 15);
                statsContainer.addChild(playerSilver);
            });

            const backdropWidth = 60;
            const separation = 30;
            const totalGroupWidth = (backdropWidth * 3) + (separation * 2); 
            const leftPanelWidth = 444.5; 
            const startXGroup = (leftPanelWidth / 2) - (totalGroupWidth / 2); 

            const cashBackdropX = startXGroup;
            const cashBackdropY = 383.5;
            const cashBackdropWidth = backdropWidth;
            const cashBackdropHeight = 45;
            const cashBackdropRadius = 15;

            const cashBackdrop = new Graphics()
                .moveTo(cashBackdropX, cashBackdropY)
                .lineTo(cashBackdropX + cashBackdropWidth, cashBackdropY)
                .lineTo(cashBackdropX + cashBackdropWidth, cashBackdropY + cashBackdropHeight - cashBackdropRadius)
                .arcTo(cashBackdropX + cashBackdropWidth, cashBackdropY + cashBackdropHeight, cashBackdropX + cashBackdropWidth - cashBackdropRadius, cashBackdropY + cashBackdropHeight, cashBackdropRadius)
                .lineTo(cashBackdropX + cashBackdropRadius, cashBackdropY + cashBackdropHeight)
                .arcTo(cashBackdropX, cashBackdropY + cashBackdropHeight, cashBackdropX, cashBackdropY + cashBackdropHeight - cashBackdropRadius, cashBackdropRadius)
                .closePath()
                .fill(0x61594C)
                .stroke({ width: 1, color: 0x60584C });
            statsContainer.addChild(cashBackdrop);

            const playerCash = new Text({
                text: player.cash.toString(),
                style: { fill: '#ffffff', fontSize: 24, fontFamily: 'MyFont' }
            });
            playerCash.anchor.set(0.5); 
            playerCash.position.set(cashBackdropX + 44.5, 405); 
            statsContainer.addChild(playerCash);
            const cashIconAsset = await Assets.load('./miscellaneous/cashIcon2.svg');
            const cashIcon = Sprite.from(cashIconAsset);
            cashIcon.width = playerCash.height;
            cashIcon.height = playerCash.height;
            cashIcon.anchor.set(0.5);
            cashIcon.position.set(cashBackdropX + 15.5, 405); 
            statsContainer.addChild(cashIcon);

            // Asset card count display
            const assetCountBackdropX = startXGroup + backdropWidth + separation;
            const assetCountBackdrop = new Graphics()
                .moveTo(assetCountBackdropX, cashBackdropY)
                .lineTo(assetCountBackdropX + cashBackdropWidth, cashBackdropY)
                .lineTo(assetCountBackdropX + cashBackdropWidth, cashBackdropY + cashBackdropHeight - cashBackdropRadius)
                .arcTo(assetCountBackdropX + cashBackdropWidth, cashBackdropY + cashBackdropHeight, assetCountBackdropX + cashBackdropWidth - cashBackdropRadius, cashBackdropY + cashBackdropHeight, cashBackdropRadius)
                .lineTo(assetCountBackdropX + cashBackdropRadius, cashBackdropY + cashBackdropHeight)
                .arcTo(assetCountBackdropX, cashBackdropY + cashBackdropHeight, assetCountBackdropX, cashBackdropY + cashBackdropHeight - cashBackdropRadius, cashBackdropRadius)
                .closePath()
                .fill(0x61594C)
                .stroke({ width: 1, color: 0x60584C });
            statsContainer.addChild(assetCountBackdrop);
            let assetCount;
            if(player === localPlayer){
                assetCount = player.hand.filter(card => card instanceof Asset).length;
            }else{
                assetCount = player.othersHand.filter(card => card === "Asset").length;
            }
            
            const assetCountText = new Text({
                text: assetCount.toString(),
                style: { fill: '#ffffff', fontSize: 24, fontFamily: 'MyFont' }
            });
            assetCountText.anchor.set(0.5);
            assetCountText.position.set(assetCountBackdropX + 44.5, 405); 
            statsContainer.addChild(assetCountText);
            
            const assetIconAsset = await Assets.load('./miscellaneous/assetIcon.svg');
            const assetIcon = Sprite.from(assetIconAsset);
            assetIcon.width = playerCash.height;
            assetIcon.height = playerCash.height;
            assetIcon.anchor.set(0.5); 
            assetIcon.position.set(assetCountBackdropX + 15.5, 405); 
            statsContainer.addChild(assetIcon);

            // Liability card count display
            const liabilityCountBackdropX = startXGroup + (backdropWidth * 2) + (separation * 2);
            const liabilityCountBackdrop = new Graphics()
                .moveTo(liabilityCountBackdropX, cashBackdropY)
                .lineTo(liabilityCountBackdropX + cashBackdropWidth, cashBackdropY)
                .lineTo(liabilityCountBackdropX + cashBackdropWidth, cashBackdropY + cashBackdropHeight - cashBackdropRadius)
                .arcTo(liabilityCountBackdropX + cashBackdropWidth, cashBackdropY + cashBackdropHeight, liabilityCountBackdropX + cashBackdropWidth - cashBackdropRadius, cashBackdropY + cashBackdropHeight, cashBackdropRadius)
                .lineTo(liabilityCountBackdropX + cashBackdropRadius, cashBackdropY + cashBackdropHeight)
                .arcTo(liabilityCountBackdropX, cashBackdropY + cashBackdropHeight, liabilityCountBackdropX, cashBackdropY + cashBackdropHeight - cashBackdropRadius, cashBackdropRadius)
                .closePath()
                .fill(0x61594C)
                .stroke({ width: 1, color: 0x60584C });
            statsContainer.addChild(liabilityCountBackdrop); 

            let liabilityCount;
            if(player === localPlayer){
                liabilityCount = player.hand.filter(card => card instanceof Liability).length;
            }else{
                liabilityCount = player.othersHand.filter(card => card === "Liability").length;
            }
           
            const liabilityCountText = new Text({
                text: liabilityCount.toString(),
                style: { fill: '#ffffff', fontSize: 24, fontFamily: 'MyFont' }
            });
            liabilityCountText.anchor.set(0.5);
            liabilityCountText.position.set(liabilityCountBackdropX + 44.5, 405); 
            statsContainer.addChild(liabilityCountText);

            const liabilityIconAsset = await Assets.load('./miscellaneous/liabilityIcon.svg');
            const liabilityIcon = Sprite.from(liabilityIconAsset);
            liabilityIcon.width = playerCash.height;
            liabilityIcon.height = playerCash.height;
            liabilityIcon.anchor.set(0.5); 
            liabilityIcon.position.set(liabilityCountBackdropX + 15.5, 405); 
            statsContainer.addChild(liabilityIcon);

            const drawCenteredPile = async (cards: (Asset | Liability)[], centerX: number, centerY: number, boxWidth: number, spreadDirection: 'left' | 'right') => {
                if (cards.length === 0) return;
                
                const scale = 0.15; 
                const maxSpacing = 35;
                const cardWidth = 100 * scale;
                let spacing = 0;
                if (cards.length > 1) {
                    
                    spacing = Math.min(maxSpacing, (boxWidth - cardWidth) / (cards.length - 1));
                    spacing = Math.max(spacing, 10); 
                }

                const totalStackSpan = (cards.length - 1) * spacing; 
                let firstCardX: number; 

                if (spreadDirection === 'right') {
                    
                    firstCardX = centerX - (totalStackSpan / 2);
                } else { 
                    firstCardX = centerX + (totalStackSpan / 2);
                }

                for (let i = 0; i < cards.length; i++) {
                    const card = cards[i]!;
                    await card.initializeSprite();
                    
                    const cardSprite = new Sprite(card.sprite.texture);
                    cardSprite.scale.set(scale);
                    cardSprite.anchor.set(0.5);                    
                    cardSprite.position.set(spreadDirection === 'right' ? firstCardX + i * spacing : firstCardX - i * spacing, centerY);
                    statsContainer.addChild(cardSprite);
                }
            };

            
            drawCenteredPile(player.assetList, 570, 300, 172, 'left');
            drawCenteredPile(player.liabilityList, 765.5, 300, 173, 'right'); 
            
           
            const assetsDescription = new Text({
                text: 'ASSETS',
                style: descriptionStyle
            });
            assetsDescription.anchor.set(0.5);
            assetsDescription.position.set(570, 300 + 120); 
            statsContainer.addChild(assetsDescription);

            
            const liabilitiesDescription = new Text({
                text: 'LIABILITIES',
                style: descriptionStyle
            });
            liabilitiesDescription.anchor.set(0.5);
            liabilitiesDescription.position.set(765.5, 300 + 120); 
            statsContainer.addChild(liabilitiesDescription);

            characterIcon.on('pointerover', () => {
                statsContainer.visible = true;
            });

            characterIcon.on('pointerout', () => {
                statsContainer.visible = false;
            });
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
        const button = new FancyButton({
            text: "END TURN",
            width: 200,
            height: 60,
            onPress: onPressCallback
        });
        button.view.position.set(this.app.screen.width - 150 - (button.view.width / 2), this.app.screen.height - 100);
        mainContainer.addChild(button.view);
    }
    createCardDrawButton(onPressCallback: () => void, mainContainer: Container, isEnabled: boolean = true) {    const button = new FancyButton({
            text: "DRAW",
            width: 200,
            height: 60,
            onPress: onPressCallback
        });
        button.enabled = isEnabled;
        button.view.alpha = isEnabled ? 1 : 0.5;
        button.view.position.set(this.app.screen.width - 150 - (button.view.width / 2), this.app.screen.height - 180);
        mainContainer.addChild(button.view);
    }
    createColorGoldButton(onPressCallback: () => void, mainContainer: Container, isEnabled: boolean = true) {
        const button = new FancyButton({
            text: "COLLECT",
            width: 200,
            height: 60,
            onPress: onPressCallback
        });
        button.enabled = isEnabled;
        button.view.alpha = isEnabled ? 1 : 0.5;
        button.view.position.set(this.app.screen.width - 150 - (button.view.width / 2), this.app.screen.height - 260);
        mainContainer.addChild(button.view);
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
        const colors = (Object.keys(marketColors) as Color[]).map(color => ({
            name: color,
            value: marketData[color],
            hex: marketColors[color],
        })).reverse();

        const circleRadius = 20;
        const circleY = height / 3-10;
        const spacing = 60;
        const totalCircleWidth = (colors.length - 1) * spacing;
        const startX = (width - totalCircleWidth) / 2;
        colors.forEach((colorInfo, index) => {
            const circleX = startX + index * spacing;
            const circle = new Graphics()
                .circle(0, 0, circleRadius)
                .fill(colorInfo.hex)
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
            characterIcon.on('pointertap', () => {
                onIconClick(player.character!)
            });
        }

        characterIcon.filters =[
            
            new GlowFilter({
                distance: 40,
                outerStrength: 1,
                innerStrength: 0,
                color: 0xf2e8d9, 
            })
        ];
        characterIcon.scale.set(0.3);
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

        
        nameBackground.filters =[
            
            new GlowFilter({
                distance: 40,
                outerStrength: 1,
                innerStrength: 0,
                color: 0xf2e8d9, 
            })
        ];
        nameBackground.pivot.set(nameBackground.width / 2, 0);
        nameBackground.position.set(0, 5);

        tempContainer.addChild(nameBackground, nameText);
        tempContainer.position.set(140, this.app.screen.height - 100);
    }
    async displayPlayerInfo(currentPlayer:Player,container: Container){
        const existingStats = this.app.stage.getChildByLabel("playerInfoGroup");
        if (existingStats) {
            existingStats.destroy({ children: true });
        }
        const statsGroup = new Container(); 
        statsGroup.label = "playerInfoGroup";
        const statData = [
            { value: currentPlayer.cash, iconPath: './miscellaneous/cashIcon2.svg' },
            { value: currentPlayer.playableAssets, iconPath: './miscellaneous/playableAssets.svg' },
            { value: currentPlayer.playableLiabilities, iconPath: './miscellaneous/playableLiabilities.svg' }
        ];
                let currentX = 0;
        const blobSpacing = 10;

        for (const stat of statData) {
            const blob = new Container();

            const text = new Text({
                text: stat.value.toString(),
                style: {
                    fill: '#f2e8d5',
                    fontSize: 24,
                    fontFamily: 'MyFont',
                }
            });
        const iconTexture = await Assets.load(stat.iconPath);
            const icon = new Sprite(iconTexture);
            icon.width = 30;
            icon.height = 30;
            icon.anchor.set(0.5);

            const bgWidth = text.width + icon.width + 35;
            const bgHeight = Math.max(text.height, icon.height) + 10;

            const bg = new Graphics()
                .roundRect(0, 0, bgWidth, bgHeight, 15)
                .fill(0x60594C);

            icon.position.set(20, bgHeight / 2);
            text.anchor.set(0, 0.5);
            text.position.set(40, bgHeight / 2);

            blob.addChild(bg, icon, text);
            blob.x = currentX;
            statsGroup.addChild(blob);

            currentX += bgWidth + blobSpacing;
        }

        statsGroup.pivot.x = statsGroup.width / 2;
        statsGroup.position.set(140, this.app.screen.height - 50);
        container.addChild(statsGroup);
    }
    
    
}
export default HudManager;
