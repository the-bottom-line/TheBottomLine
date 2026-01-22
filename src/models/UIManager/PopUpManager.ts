import { Container, Graphics, Text, Sprite, Assets, FillGradient, Application, ColorMatrixFilter } from 'pixi.js';
import { FancyButton } from '../FancyButton.js';
import type Player from '../Player.js';
import type Character from '../Characters.js';
import type { Color, IssuedLiabilityToPayBanker, PlayerId, RegulatorSwapPlayer, SoldAssetToPayBanker } from '@shared-types';
import type GameState from '../GameState.js'; 
import type { MarketCard } from '@shared-types';
import type { DivestmentTarget } from '../GameManager.js';
import type HudManager from './HudManager.js';
import Liability from '../Liability.js';
import { marketColors, themeColors } from '../theme.js';

class PopUpManager {
    app: Application;
    popupContainer: Container;
    hudManager: HudManager;
    private updateBankerSellTable?: (data: { assets: Array<SoldAssetToPayBanker>; liabilities: Array<IssuedLiabilityToPayBanker>; }) => void;
    private updateRnDMarketCallback?: (market: MarketCard) => void;
    private updateEndGameScoreCallback?: (name: string, score: number) => void;
    private endGameScoresContainer?: Container;

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

    async announceClosedCharacter(character: Character) {
        const tempContainer = this._createPopupBase();
        const x = this.app.screen.width / 2;
        let y = this.app.screen.height / 2 - 250;

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
            text: "This is the closed character. They will be available for the last player",
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
        charSprite.scale.set(0.3    );
        charSprite.anchor.set(0.5);
        charSprite.position.set(x, y);

        tempContainer.addChild(chairmanIcon);
        tempContainer.addChild(titleBackground);
        tempContainer.addChild(titleText);
        tempContainer.addChild(infoBackground);
        tempContainer.addChild(infoText);
        tempContainer.addChild(charSprite);

        this._addPopupCloseButton(tempContainer);
        this.popupContainer.addChild(tempContainer);
    }

    async announceBonusCash(player: Player, amount: number) {
        const tempContainer = this._createPopupBase();
        let x = this.app.screen.width / 2;
        let y = this.app.screen.height / 2 - 120;

        let texture = await Assets.load("./miscellaneous/ChairmanIcon.png");
        const chairmanIcon = new Sprite(texture);

        chairmanIcon.position.set(x, y);
        chairmanIcon.width = 200;
        chairmanIcon.height = 240;
        chairmanIcon.anchor.set(0.5);
        y += 100;

        const textChairmanBackground = new Graphics()
            .roundRect(x - 120, y - 25, 240, 50, 5)
            .fill(0x60584C)
            .stroke({ width: 2, color: 0x000000 });

        const chairmanText = new Text({
            text: "The Chairman ",
            style: { fill: '#ffffff', fontSize: 20, fontFamily: 'MyFont' }
        });
        chairmanText.anchor.set(0.5);
        chairmanText.position.set(x, y);
        x += 50;
        y += 100;

        const textPlayerBackground = new Graphics()
            .roundRect(x - 200, y - 20, 350, 60, 5)
            .fill(0x323232)
            .stroke({ width: 2, color: 0x000000 });

        const infoText = new Text({
            text: `${player.name} received ${amount} Gold`,
            style: { fill: '#ffffff', fontSize: 18, fontFamily: 'MyFont' }
        });
        infoText.anchor.set(0, 0.5);
        infoText.position.set(x - 140, y);
        tempContainer.addChild(chairmanIcon, textChairmanBackground, chairmanText, textPlayerBackground, infoText);
        if (player.character) {
            texture = await Assets.load(player.character.iconPath);
            const characterIcon = new Sprite(texture);
            characterIcon.position.set(x - 200, y);
            characterIcon.width = 80;
            characterIcon.height = 90;
            characterIcon.anchor.set(0.5);
            tempContainer.addChild(characterIcon);
        }

        

        this._addPopupCloseButton(tempContainer);

        this.popupContainer.addChild(tempContainer);
    }
   

    async StakeholdersPerk(characters: Character[], onSelectCallback: (_: Character) => void) {
        const tempContainer = this._createPopupBase();
        const x = this.app.screen.width / 2;
        let y = this.app.screen.height / 2-300;

        const texture = await Assets.load("./miscellaneous/ShareholderIcon.png"); 
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
            text: 'Shareholder’s perk', 
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
            text: 'Please select a character you want to fire this round', 
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
            faceUpCard.on('pointertap', () => onSelectCallback(character));
            tempContainer.addChild(faceUpCard);
            
        });
        this._addPopupCloseButton(tempContainer);

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

    async terminatedCreditCharacter(character: Character, targetPlayer: Player, isSelf: boolean) {
        const tempContainer = this._createPopupBase();
        let x = this.app.screen.width / 2;
        let y = this.app.screen.height / 2-120;

        let texture = await Assets.load("./miscellaneous/BankerIcon.png");
        const bankerIcon = new Sprite(texture);
        
        bankerIcon.position.set(x, y);
        bankerIcon.width = 200;
        bankerIcon.height = 240;
        bankerIcon.anchor.set(0.5);
        y +=100;

        const textBankerBackground = new Graphics()
            .roundRect(x - 120, y-25 , 240, 50, 5)
            .fill(0x60584C) 
            .stroke({ width: 2, color: 0x000000 });

        const bankerText = new Text({
            text: "The Banker terminated...",
            style: { fill: '#ffffff', fontSize: 20, fontFamily: 'MyFont' }
        });
        bankerText.anchor.set(0.5);
        bankerText.position.set(x, y);      
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

        tempContainer.addChild(bankerIcon);
        tempContainer.addChild(textBankerBackground);   
        tempContainer.addChild(bankerText);
        tempContainer.addChild(textPlayerBackground);  
        tempContainer.addChild(characterText);
        tempContainer.addChild(characterIcon);

        if(isSelf){
            const playerText = new Text({
                text: "You have been terminated",
                style: { fill: '#CBC28E', fontSize: 18, fontFamily: 'MyFont' }
            });
            playerText.anchor.set(0, 0.5);
            playerText.position.set(x-140, y+20);
            tempContainer.addChild(playerText);
        }
        
        this._addPopupCloseButton(tempContainer);

        this.popupContainer.addChild(tempContainer);
    }

    async playerTargetedByBanker(targetPlayer: Player, cashDue: number, isSelf: boolean,isPossbilrToPayBanker: boolean, onPayCallback: (amount: number) => void, onSelectCallback: (index: number) => void, onUnselectCallback: (index: number) => void,onSelectLiablityCallback: (index: number) => void,onUnselectLiablityCallback: (index: number) => void ) {
        const tempContainer = this._createPopupBase();
        const x = this.app.screen.width / 2;
        let y = this.app.screen.height / 2 - 300;

        const texture = await Assets.load("./miscellaneous/BankerIcon.png");
        const bankerIcon = new Sprite(texture);
        
        bankerIcon.position.set(x, y);
        bankerIcon.width = 200;
        bankerIcon.height = 240;
        bankerIcon.anchor.set(0.5);
        tempContainer.addChild(bankerIcon);
        y += 140;

        const descriptionText = new Text({
            text: isSelf ? "The Banker has TERMINATED you" : `The Banker has TERMINATED ${targetPlayer.character?.name ?? targetPlayer.name}`,
            style: { fill: '#ffffff', fontSize: 18, fontFamily: 'MyFont', align: 'center' }
        });
        const padding = 40;
        const contentWidth = Math.max(descriptionText.width + padding, 300);

        const titleBackground = new Graphics()
            .roundRect(x - contentWidth / 2, y - 25, contentWidth, 50, 5)
            .fill('#60584C')
            .stroke({ width: 2, color: 0x000000 });
        tempContainer.addChild(titleBackground);

        const titleText = new Text({
            text: "Banker's perk",
            style: { fill: '#ffffff', fontSize: 24, fontFamily: 'MyFont' }
        });
        titleText.anchor.set(0.5);
        titleText.position.set(x, y);
        tempContainer.addChild(titleText);
        y += 70;

        descriptionText.anchor.set(0.5);
        descriptionText.position.set(x, y);

        const descriptionBackground = new Graphics()
            .roundRect(x - contentWidth / 2, y - 30, contentWidth, 60, 5)
            .fill(0x323232)
            .stroke({ width: 2, color: 0x000000 });

        tempContainer.addChild(descriptionBackground);
        tempContainer.addChild(descriptionText);
        y += 80;

        // Breakdown
        const assetCounts: Record<string, number> = {};
        targetPlayer.assetList.forEach(asset => {
            const color = asset.color;
            assetCounts[color] = (assetCounts[color] || 0) + 1;
        });

        const breakdownContainer = new Container();
        let rowY = 0; 
        const bgPadding = 20;
        const tableInnerWidth = contentWidth - (bgPadding * 2);
        
        const addRow = (parts: {text: string, color: string, bold?: boolean}[], value: string) => {
            let currentX = 0;
            parts.forEach(part => {
                const t = new Text({ 
                    text: part.text, 
                    style: { 
                        fill: part.color, 
                        fontSize: 20, 
                        fontFamily: 'MyFont',
                        fontWeight: part.bold ? 'bold' : 'normal'
                    } 
                });
                t.position.set(currentX, rowY);
                breakdownContainer.addChild(t);
                currentX += t.width + 5;
            });

            const v = new Text({ text: value, style: { fill: '#CBC28E', fontSize: 20, fontFamily: 'MyFont' } });
            v.anchor.set(1, 0);
            v.position.set(tableInnerWidth, rowY);
            breakdownContainer.addChild(v);
            rowY += 30;
        };

        addRow([{text: "Base Fee", color: "#cccccc"}], "+1 Gold");
        for(const color in assetCounts) {
            addRow([
                {text: color, color: color, bold: true},
                {text: "Assets", color: color}
            ], `+1 Gold`);
        }
        
        const line = new Graphics().moveTo(0, rowY).lineTo(tableInnerWidth, rowY).stroke({ width: 2, color: 0xffffff });
        breakdownContainer.addChild(line);
        rowY += 10;

        addRow([{text: "Total Due", color: "#cccccc"}], `${cashDue} Gold`);

        breakdownContainer.x = x - tableInnerWidth / 2;
        breakdownContainer.y = y;
        
        const breakdownBg = new Graphics()
            .roundRect(breakdownContainer.x - bgPadding, breakdownContainer.y - bgPadding, contentWidth, rowY + bgPadding*2, 10)
            .fill(0x323232)
            .stroke({ width: 2, color: 0x000000 });

        
        tempContainer.addChild(titleText);
        tempContainer.addChild(breakdownBg);
        tempContainer.addChild(breakdownContainer);

        y += rowY + 50;

        if (isSelf) {
            if (targetPlayer.cash >= cashDue) {
                const payButton = new FancyButton({
                    text: "Pay Banker",
                    width: 200,
                    height: 60,
                    onPress: () => {
                        onPayCallback(cashDue);
                        if (tempContainer.parent) tempContainer.parent.removeChild(tempContainer);
                    }
                });
                payButton.view.position.set(x - 100, y);
                tempContainer.addChild(payButton.view);
            } else {
                const payButton = new FancyButton({
                    text: "Pay Banker",
                    width: 200,
                    height: 60,
                });
                payButton.view.position.set(x - 100, y);
                payButton.view.alpha = 0.5;
                payButton.view.interactive = false;

                const crossLine = new Graphics()
                    .moveTo(0, 30)
                    .lineTo(200, 30)
                    .stroke({ width: 3, color: 0x000000 });
                payButton.view.addChild(crossLine);
                tempContainer.addChild(payButton.view);
                y += 70;
                const sellButton = new FancyButton({
                    text: "Sell Assets",
                    width: 200,
                    height: 60,
                    onPress: () => {
                        if (tempContainer.parent) tempContainer.parent.removeChild(tempContainer);
                        this.displayBankerSellAssets(targetPlayer, cashDue, onPayCallback, onSelectCallback, onUnselectCallback,onSelectLiablityCallback,onUnselectLiablityCallback);
                    }
                });
                sellButton.view.position.set(x - 100, y);
                tempContainer.addChild(sellButton.view);

                if (targetPlayer.character?.characterType === 'CFO') {
                    y += 70;
                    const issueButton = new FancyButton({
                        text: "Issue Liabilities",
                        width: 200,
                        height: 60,
                        onPress: () => {
                            if (tempContainer.parent) tempContainer.parent.removeChild(tempContainer);
                            this.displayBankerIssueLiabilities(targetPlayer, cashDue, onPayCallback, onSelectCallback, onUnselectCallback, onSelectLiablityCallback, onUnselectLiablityCallback);
                        }
                    });
                    issueButton.view.position.set(x - 100, y);
                    tempContainer.addChild(issueButton.view);
                }
            }
        } else {
            this._addPopupCloseButton(tempContainer);
        }

        this.popupContainer.addChild(tempContainer);
    }

    async displayBankerPaymentNotification(payer: Player, banker: Player, amountPaid: number, isLocalBanker: boolean, isLocalPayer: boolean, assets: SoldAssetToPayBanker[], liabilities: IssuedLiabilityToPayBanker[]) {
        const tempContainer = this._createPopupBase();
        const x = this.app.screen.width / 2;
        let y = this.app.screen.height / 2 - 250;

        const texture = await Assets.load("./miscellaneous/BankerIcon.png");
        const bankerIcon = new Sprite(texture);
        bankerIcon.position.set(x, y);
        bankerIcon.width = 160;
        bankerIcon.height = 180;
        bankerIcon.anchor.set(0.5);
        tempContainer.addChild(bankerIcon);
        y += 90;

        const titleBackground = new Graphics()
            .roundRect(x - 120, y - 25, 240, 50, 5)
            .fill(0x60584C)
            .stroke({ width: 2, color: 0x000000 });
        tempContainer.addChild(titleBackground);

        const titleText = new Text({
            text: "Banker's perk",
            style: { fill: '#ffffff', fontSize: 24, fontFamily: 'MyFont' }
        });
        titleText.anchor.set(0.5);
        titleText.position.set(x, y);
        tempContainer.addChild(titleText);
        y += 100;

        let descriptionStr = "";
        if (isLocalBanker) {
            descriptionStr = `${payer.name} has paid you ${amountPaid} Gold.`;
        } else if (isLocalPayer) {
            descriptionStr = `You have paid ${banker.name} ${amountPaid} Gold.`;
        } else {
            descriptionStr = `${payer.name} has paid ${banker.name} ${amountPaid} Gold.`;
        }

        const actions: string[] = [];
        if (assets && assets.length > 0) {
            const count = assets.length;
            actions.push(`Sold ${count} asset${count > 1 ? 's' : ''}`);
        }
        if (liabilities && liabilities.length > 0) {
            const count = liabilities.length;
            actions.push(`Issued ${count} ${count > 1 ? 'liabilities' : 'liability'}`); // English pluralization
        }

        if (actions.length > 0) {
            if (isLocalPayer) {
                descriptionStr += `\n\nTo do this, you:\n` + actions.join('\n');
            }else{
                descriptionStr += `\n\nTo do this, they:\n` + actions.join('\n');
            }
            
        }

        const descriptionText = new Text({
            text: descriptionStr,
            style: { fill: '#ffffff', fontSize: 18, fontFamily: 'MyFont', align: 'center', wordWrap: true, wordWrapWidth: 380 }
        });
        descriptionText.anchor.set(0.5);
        descriptionText.position.set(x, y);

        const descriptionBackground = new Graphics()
            .roundRect(x - 200, y - descriptionText.height/2 - 20, 400, descriptionText.height + 40, 5)
            .fill(0x323232)
            .stroke({ width: 2, color: 0x000000 });
        
        tempContainer.addChild(descriptionBackground);
        tempContainer.addChild(descriptionText);

        this._addPopupCloseButton(tempContainer);
        this.popupContainer.addChild(tempContainer);
    }

    updateBankerSellAssets(data: { assets: Array<SoldAssetToPayBanker>; liabilities: Array<IssuedLiabilityToPayBanker>; }) {
        if (this.updateBankerSellTable) {
            this.updateBankerSellTable(data);
        }
    }

    async displayBankerSellAssets(targetPlayer: Player, cashDue: number, onPayCallback: (amount: number) => void, onSelectCallback: (index: number) => void, onUnselectCallback: (index: number) => void,onSelectLiablityCallback: (index: number) => void,onUnselectLiablityCallback: (index: number) => void ) {
        const tempContainer = this._createPopupBase();
        
        // Table for breakdown
        const breakdownContainer = new Container();
        let rowY = 0;
        
        const addRow = (label: string, value: string, updateRef?: { text?: Text }) => {
            const t = new Text({ 
                text: label, 
                style: { fill: '#cccccc', fontSize: 20, fontFamily: 'MyFont' } 
            });
            t.position.set(0, rowY);
            breakdownContainer.addChild(t);

            const v = new Text({ text: value, style: { fill: '#CBC28E', fontSize: 20, fontFamily: 'MyFont' } });
            v.anchor.set(1, 0);
            v.position.set(250, rowY);
            breakdownContainer.addChild(v);
            
            if (updateRef) updateRef.text = v;
            
            rowY += 30;
        };

        addRow("Amount Due", `${cashDue} Gold`);
        let line = new Graphics().moveTo(0, rowY).lineTo(250, rowY).stroke({ width: 2, color: 0xffffff });
        breakdownContainer.addChild(line);
        rowY += 10;
        addRow("Current Cash", `${targetPlayer.cash} Gold`);
        
        const assetsValueRef: { text?: Text } = { };
        addRow("Assets Value", "0 Gold", assetsValueRef);

        const liabilitiesValueRef: { text?: Text } = { };
        addRow("Liabilities Value", "0 Gold", liabilitiesValueRef);
        
        line = new Graphics().moveTo(0, rowY).lineTo(250, rowY).stroke({ width: 2, color: 0xffffff });
        breakdownContainer.addChild(line);
        rowY += 10;
        
        const resultingCashRef: { text?: Text } = { };
        addRow("Resulting Cash", `${targetPlayer.cash - cashDue} Gold`, resultingCashRef);

        const bgPadding = 20;
        const breakdownBg = new Graphics()
            .roundRect(-bgPadding, -bgPadding, 250 + bgPadding*2, rowY + bgPadding*2, 10)
            .fill(0x323232)
            .stroke({ width: 2, color: 0x000000 });
        
        const tableContainer = new Container();
        tableContainer.addChild(breakdownBg);
        tableContainer.addChild(breakdownContainer);
        tableContainer.position.set(40, 110);
        tempContainer.addChild(tableContainer);

        this.updateBankerSellTable = (data) => {
            let assetValue = 0;
            let liabilityValue = 0;
            if (data.assets) {
                data.assets.forEach((item) => assetValue += item.market_value);
            }
            if (data.liabilities) {
                data.liabilities.forEach((item) => liabilityValue += item.liability.value);
            }
            if (assetsValueRef.text) assetsValueRef.text.text = `${assetValue} Gold`;
            if (resultingCashRef.text) resultingCashRef.text.text = `${targetPlayer.cash + assetValue + liabilityValue - cashDue} Gold`;
        };

        const titleText = new Text({
            text: `Select Assets to sell for market value`,
            style: { fill: '#ffffff', fontSize: 24, fontFamily: 'MyFont' }
        });
        titleText.anchor.set(0.5);
        titleText.position.set(this.app.screen.width / 2, 100);
        tempContainer.addChild(titleText);

        const cardScale = 0.25;
        const cardWidth = 590 * cardScale;
        const spacing = 20;
        const totalWidth = (targetPlayer.assetList.length * cardWidth) + ((targetPlayer.assetList.length - 1) * spacing);
        const startX = this.app.screen.width / 2 - totalWidth / 2 + cardWidth / 2;
        const startY = this.app.screen.height - 250;

        const selectedIndices: number[] = [];
        const cardSprites: { sprite: Sprite, originalPos: {x: number, y: number}, index: number }[] = [];

        const updateSelectedPositions = () => {
            const totalSelWidth = (selectedIndices.length * cardWidth) + ((selectedIndices.length - 1) * spacing);
            const selStartX = this.app.screen.width / 2 - totalSelWidth / 2 + cardWidth / 2;
            
            selectedIndices.forEach((originalIndex, i) => {
                const cardObj = cardSprites.find(c => c.index === originalIndex);
                if (cardObj) {
                    cardObj.sprite.position.set(selStartX + i * (cardWidth + spacing), this.app.screen.height / 2);
                }
            });
        };

        for (let i = 0; i < targetPlayer.assetList.length; i++) {
            const asset = targetPlayer.assetList[i]!;
            const texture = await Assets.load(asset.texturePath);
            const sprite = new Sprite(texture);
            sprite.scale.set(cardScale);
            sprite.anchor.set(0.5);
            
            const originalX = startX + i * (cardWidth + spacing);
            const originalY = startY;
            
            sprite.position.set(originalX, originalY);
            sprite.interactive = true;
            sprite.cursor = 'pointer';

            cardSprites.push({ sprite, originalPos: { x: originalX, y: originalY }, index: i });

            sprite.on('pointertap', () => {
                const selIdx = selectedIndices.indexOf(i);
                if (selIdx === -1) {
                    selectedIndices.push(i);
                    onSelectCallback(i);
                } else {
                    selectedIndices.splice(selIdx, 1);
                    onUnselectCallback(i);
                    sprite.position.set(originalX, originalY);
                }
                updateSelectedPositions();
            });

            tempContainer.addChild(sprite);
        }

        const payButton = new FancyButton({
            text: "Pay Banker",
            width: 200,
            height: 60,
            onPress: () => {
                onPayCallback(cashDue);
                if (tempContainer.parent) tempContainer.parent.removeChild(tempContainer);
            }
        });
        payButton.view.position.set(this.app.screen.width / 2 - 100, this.app.screen.height - 170);
        tempContainer.addChild(payButton.view);

        const backButton = new FancyButton({
            text: "Back",
            width: 200,
            height: 60,
            onPress: () => {
                if (tempContainer.parent) tempContainer.parent.removeChild(tempContainer);
                this.playerTargetedByBanker(targetPlayer, cashDue, true,true, onPayCallback, onSelectCallback, onUnselectCallback,onSelectLiablityCallback,onUnselectLiablityCallback,);
            }
        });
        backButton.view.position.set(this.app.screen.width / 2 - (backButton.view.width / 2), this.app.screen.height - 100);
        tempContainer.addChild(backButton.view);
        this.popupContainer.addChild(tempContainer);
    }    

    async displayBankerIssueLiabilities(targetPlayer: Player, cashDue: number, onPayCallback: (amount: number) => void, onSelectCallback: (index: number) => void, onUnselectCallback: (index: number) => void, onSelectLiablityCallback: (index: number) => void, onUnselectLiablityCallback: (index: number) => void) {
        const tempContainer = this._createPopupBase();
        
        // Table for breakdown
        const breakdownContainer = new Container();
        let rowY = 0;
        
        const addRow = (label: string, value: string, updateRef?: { text?: Text }) => {
            const t = new Text({ 
                text: label, 
                style: { fill: '#cccccc', fontSize: 20, fontFamily: 'MyFont' } 
            });
            t.position.set(0, rowY);
            breakdownContainer.addChild(t);

            const v = new Text({ text: value, style: { fill: '#CBC28E', fontSize: 20, fontFamily: 'MyFont' } });
            v.anchor.set(1, 0);
            v.position.set(250, rowY);
            breakdownContainer.addChild(v);
            
            if (updateRef) updateRef.text = v;
            
            rowY += 30;
        };

        addRow("Amount Due", `${cashDue} Gold`);
        addRow("Current Cash", `${targetPlayer.cash} Gold`);
        
        const assetsValueRef: { text?: Text } = { };
        addRow("Assets Value", "0 Gold", assetsValueRef);

        const liabilitiesValueRef: { text?: Text } = { };
        addRow("Liabilities Value", "0 Gold", liabilitiesValueRef);
        
        const line = new Graphics().moveTo(0, rowY).lineTo(250, rowY).stroke({ width: 2, color: 0xffffff });
        breakdownContainer.addChild(line);
        rowY += 10;
        
        const resultingCashRef: { text?: Text } = { };
        addRow("Resulting Cash", `${targetPlayer.cash - cashDue} Gold`, resultingCashRef);

        const bgPadding = 20;
        const breakdownBg = new Graphics()
            .roundRect(-bgPadding, -bgPadding, 250 + bgPadding*2, rowY + bgPadding*2, 10)
            .fill(0x323232)
            .stroke({ width: 2, color: 0x000000 });
        
        const tableContainer = new Container();
        tableContainer.addChild(breakdownBg);
        tableContainer.addChild(breakdownContainer);
        tableContainer.position.set(40, 110);
        tempContainer.addChild(tableContainer);

        this.updateBankerSellTable = (data) => {
            let assetValue = 0;
            let liabilityValue = 0;
            if (data.assets) {
                data.assets.forEach((item) => assetValue += item.market_value);
            }
            if (data.liabilities) {
                data.liabilities.forEach((item) => liabilityValue += item.liability.value);
            }
            if (liabilitiesValueRef.text) liabilitiesValueRef.text.text = `${liabilityValue} Gold`;
            if (resultingCashRef.text) resultingCashRef.text.text = `${targetPlayer.cash + assetValue + liabilityValue - cashDue} Gold`;
        };

        const titleText = new Text({
            text: `Issue Liabilities (Due: ${cashDue} Gold)`,
            style: { fill: '#ffffff', fontSize: 24, fontFamily: 'MyFont' }
        });
        titleText.anchor.set(0.5);
        titleText.position.set(this.app.screen.width / 2, 100);
        tempContainer.addChild(titleText);

        const cardScale = 0.25;
        const cardWidth = 590 * cardScale;
        const spacing = 20;
        
        const liabilityCards: { card: Liability, index: number }[] = [];
        targetPlayer.hand.forEach((card, index) => {
            if (card instanceof Liability) {
                liabilityCards.push({ card, index });
            }
        });

        const totalWidth = (liabilityCards.length * cardWidth) + ((liabilityCards.length - 1) * spacing);
        const startX = this.app.screen.width / 2 - totalWidth / 2 + cardWidth / 2;
        const startY = this.app.screen.height - 250;

        const selectedIndices: number[] = [];
        const cardSprites: { sprite: Sprite, originalPos: {x: number, y: number}, index: number }[] = [];

        const updateSelectedPositions = () => {
            const totalSelWidth = (selectedIndices.length * cardWidth) + ((selectedIndices.length - 1) * spacing);
            const selStartX = this.app.screen.width / 2 - totalSelWidth / 2 + cardWidth / 2;
            
            selectedIndices.forEach((originalIndex, i) => {
                const cardObj = cardSprites.find(c => c.index === originalIndex);
                if (cardObj) {
                    cardObj.sprite.position.set(selStartX + i * (cardWidth + spacing), this.app.screen.height / 2);
                }
            });
        };

        for (let i = 0; i < liabilityCards.length; i++) {
            const { card, index } = liabilityCards[i]!;
            const texture = await Assets.load(card.texturePath);
            const sprite = new Sprite(texture);
            sprite.scale.set(cardScale);
            sprite.anchor.set(0.5);
            
            const originalX = startX + i * (cardWidth + spacing);
            const originalY = startY;
            
            sprite.position.set(originalX, originalY);
            sprite.interactive = true;
            sprite.cursor = 'pointer';

            cardSprites.push({ sprite, originalPos: { x: originalX, y: originalY }, index: index });

            sprite.on('pointertap', () => {
                const selIdx = selectedIndices.indexOf(index);
                if (selIdx === -1) {
                    selectedIndices.push(index);
                    onSelectLiablityCallback(index);
                } else {
                    selectedIndices.splice(selIdx, 1);
                    onUnselectLiablityCallback(index);
                    sprite.position.set(originalX, originalY);
                }
                updateSelectedPositions();
            });

            tempContainer.addChild(sprite);
        }

        const payButton = new FancyButton({
            text: "Pay Banker",
            width: 200,
            height: 60,
            onPress: () => {
                onPayCallback(cashDue);
                if (tempContainer.parent) tempContainer.parent.removeChild(tempContainer);
            }
        });
        payButton.view.position.set(this.app.screen.width / 2 - 100, this.app.screen.height - 170);
        tempContainer.addChild(payButton.view);

        const backButton = new FancyButton({
            text: "Back",
            width: 200,
            height: 60,
            onPress: () => {
                if (tempContainer.parent) tempContainer.parent.removeChild(tempContainer);
                this.playerTargetedByBanker(targetPlayer, cashDue, true,true, onPayCallback, onSelectCallback, onUnselectCallback, onSelectLiablityCallback, onUnselectLiablityCallback);
            }
        });
        backButton.view.position.set(this.app.screen.width / 2 - (backButton.view.width / 2), this.app.screen.height - 100);
        tempContainer.addChild(backButton.view);
        this.popupContainer.addChild(tempContainer);
    }

    async youAreTerminatingSomeone(characters:Character[], perk: string, onSelectCallback: (charToTerminate:Character) => void ){
        const tempContainer = this._createPopupBase();

        const x = this.app.screen.width / 2;
        let y = this.app.screen.height / 2-300;

        const texture = await Assets.load("./miscellaneous/BankerIcon.png");
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
            text: 'Banker’s perk',
            style: { fill: '#ffffff', fontSize: 24, fontFamily: 'MyFont' }
        });
        perkText.anchor.set(0.5);
        perkText.position.set(x, y);
        y+= 70;

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
            faceUpCard.on('pointertap', () => {
                onSelectCallback(character);
                if (tempContainer.parent) {
                    tempContainer.parent.removeChild(tempContainer);
                }
            });
            tempContainer.addChild(faceUpCard);
            
        });    
        this._addPopupCloseButton(tempContainer);
        this.popupContainer.addChild(tempContainer); 
    }
    //data:"{\"action\":\"YouAreTerminatingSomeone\",\"data\":{\"characters\":[\"CEO\",\"CFO\",\"CSO\",\"HeadRnD\"],\"character\":\"Banker\",\"perk\":\"You can force a player to give you cash based on the amount of different color assets they have +1\"}}"

    async youCharacterAbility(character: Character, perk: string) {
        const tempContainer = this._createPopupBase();
        const x = this.app.screen.width / 2;
        let y = this.app.screen.height / 2-200;

        const texture = await Assets.load(character.iconPath);
        const characterIcon = new Sprite(texture);
        
        characterIcon.position.set(x, y);
        characterIcon.width = 200;
        characterIcon.height = 240;
        characterIcon.anchor.set(0.5);
        y +=130;

        const descriptionText = new Text({
            text: perk,
            style: { fill: '#ffffff', fontSize: 20, fontFamily: 'MyFont', wordWrap: true, wordWrapWidth: 500, align: 'center' }
        });
        const bgPadding = 30;
        const bgWidth = descriptionText.width + bgPadding;

        const titleText = new Text({
            text: `${character.characterType}’s perk`,
            style: { fill: '#ffffff', fontSize: 24, fontFamily: 'MyFont' }
        });
        titleText.anchor.set(0.5);
        titleText.position.set(x, y);
        const titleTextPadding = 20;

        const titleBackground = new Graphics()
            .roundRect(x - bgWidth / 2, y - (titleText.height + titleTextPadding) / 2 , bgWidth, titleText.height + titleTextPadding, 5)
            .fill(0x60584C) 
            .stroke({ width: 2, color: 0x000000 });
        
        y += 70;

        descriptionText.anchor.set(0.5);
        descriptionText.position.set(x, y);

        const descriptionBackground = new Graphics()
            .roundRect(0, 0 , bgWidth, descriptionText.height + bgPadding, 5)
            .fill(0x323232) 
            .stroke({ width: 2, color: 0x000000 });
        descriptionBackground.pivot.set(descriptionBackground.width / 2, descriptionBackground.height / 2);
        descriptionBackground.position.set(x, y);

        this._addPopupCloseButton(tempContainer);
        
        tempContainer.addChild(characterIcon); 
        tempContainer.addChild(titleBackground);   
        tempContainer.addChild(titleText);        
        tempContainer.addChild(descriptionBackground);
        tempContainer.addChild(descriptionText);

        this.popupContainer.addChild(tempContainer);
    }
    async youAreDivesting(divestmentTargets: DivestmentTarget[] ,onSelectCallback: (playerID: number, cardIndex: number) => void) {
        
        const tempContainer = this._createPopupBase();
        const x = this.app.screen.width / 2;
        let y = this.app.screen.height / 2-250;



        const texture = await Assets.load("./miscellaneous/StakeholderIcon.png"); 
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
            text: 'Stakeholder’s perk', 
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
            text: 'Please select a player you want to force to divest', 
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

            const grayscaleFilter = new ColorMatrixFilter();
            grayscaleFilter.grayscale(0.2, true);

            for(const card of target.assets){
                const tex = await Assets.load(card.asset.texturePath);
                const sprite = new Sprite(tex);
                sprite.scale.set(cardScale);
                sprite.anchor.set(0.5);
                sprite.interactive = true;
                if (!card.isDivestable) {
                    sprite.filters = [grayscaleFilter];
                }
                sprite.position.set(cardStartX + cardWidth / 2, playerY + cardHeight/2);
                sprite.on('pointertap', () => onSelectCallback(target.player.playerID, target.player.assetList.indexOf(card.asset)));
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

        const texture = await Assets.load("./miscellaneous/RegulatorIcon.png"); 
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
            text: 'Regulator\'s perk', 
            style: { fill: '#ffffff', fontSize: 24, fontFamily: 'MyFont' }
        });
        perkText.anchor.set(0.5);
        perkText.position.set(x, y);
        y+= 70;
      

        const descriptionText = new Text({
            text: perk, 
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
            cardBack.on('pointertap', () => onSelectCallback1(player.playerID));
               
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
            cardBack.on('pointertap', () => onSelectCallback1(player.playerID));
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
            width: 300,
            height: 60,
            onPress: () => {
                // Close the current popup and open the deck swap one
                this.popupContainer.removeChild(tempContainer);   
                this.displaySwapWithDeckPopup(gameState.getLocalPlayer(), (card_idxs) => {
                    onSelectCallback2(card_idxs); 
                }, () => {
                    this.youRegulatorOptions(options, perk, gameState, onSelectCallback1, onSelectCallback2);
                });
            }
        }); 
        deckButton.view.position.set((this.app.screen.width-deckButton.view.width)/2, 650);
        tempContainer.addChild(deckButton.view);



        this._addPopupCloseButton(tempContainer);

        this.popupContainer.addChild(tempContainer);
    }

    async displaySwapWithDeckPopup(player: Player, onConfirmCallback: (card_idxs: number[]) => void, onBackCallback: () => void) {
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

            cardSprite.on('pointertap', () => {
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
        okButton.view.position.set(this.app.screen.width / 2 - (okButton.view.width / 2), this.app.screen.height - 170);
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
        backButton.view.position.set(this.app.screen.width / 2 - (backButton.view.width / 2), this.app.screen.height - 100);
        tempContainer.addChild(backButton.view);

        this.popupContainer.addChild(tempContainer);
        return tempContainer;
    }

    async displayYouSwappedNotification(localPlayer: Player) {
        const tempContainer = this._createPopupBase();
        const x = this.app.screen.width / 2;
        let y = this.app.screen.height / 2 - 300;

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

        this._addPopupCloseButton(tempContainer);
        this.popupContainer.addChild(tempContainer);
    }

    async displayRegulatorSwapNotification( localPlayer: Player) {
        const tempContainer = this._createPopupBase();
        const x = this.app.screen.width / 2;
        let y = this.app.screen.height / 2 - 300;

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

        this._addPopupCloseButton(tempContainer);
        this.popupContainer.addChild(tempContainer);
    }

    async displayPlayerSwapNotification( targetPlayer: Player) { 
        const tempContainer = this._createPopupBase();
        const x = this.app.screen.width / 2;
        let y = this.app.screen.height / 2 - 200;

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
        
        this._addPopupCloseButton(tempContainer);
        this.popupContainer.addChild(tempContainer);
    }
    
    updateRnDMarket(market: MarketCard) {
        if (this.updateRnDMarketCallback) this.updateRnDMarketCallback(market);
    }

    updateEndGameScore(name: string, score: number) {
        if (this.updateEndGameScoreCallback) this.updateEndGameScoreCallback(name, score);
    }

    displayRnDPopup(marketState: MarketCard, onSelectCallback: (color: Color) => void, confirmAssetAbilityCall: (index: number) => void, cardIndex: number) {
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

        const colors = (Object.keys(marketColors) as Color[]).map(color => ({
            name: color,
            value: marketState[color],
            hex: marketColors[color],
        }));

        const circleRadius = 30;
        const circleY = height /2;
        const spacing = 80;
        const totalCircleWidth = (colors.length - 1) * spacing;
        const startX = (width - totalCircleWidth) / 2;

        const statusIndicators: Record<string, Text> = {};
        colors.forEach((colorInfo, index) => {
            const circleX = startX + index * spacing;
            const circle = new Graphics()
                .circle(0, 0, circleRadius)
                .fill(colorInfo.hex)
                .stroke({ width: 2, color: themeColors.outline });
            circle.position.set(circleX, circleY);
            
            circle.interactive = true;
            circle.cursor = 'pointer';
            circle.on('pointertap', () => onSelectCallback(colorInfo.name as Color));

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
            statusIndicator.position.set(circleX, circleY); 

            if (colorInfo.value === 'down') {
                statusIndicator.text = '-';
             
            } else if (colorInfo.value === 'up') {
                statusIndicator.text = '+';
              
            } else if (colorInfo.value === 'zero') {
                statusIndicator.text = '0';
            }
            marketContent.addChild(statusIndicator);
            statusIndicators[colorInfo.name] = statusIndicator;
        });

        this.updateRnDMarketCallback = (newMarket: MarketCard) => {
            if (!tempContainer.parent) return; // Popup closed
            const newColors = [
                { name: 'Yellow', value: newMarket.Yellow },
                { name: 'Blue', value: newMarket.Blue },
                { name: 'Green', value: newMarket.Green },
                { name: 'Purple', value: newMarket.Purple },
                { name: 'Red', value: newMarket.Red }
            ];
            newColors.forEach(c => {
                const indicator = statusIndicators[c.name];
                if (indicator) {
                    if (c.value === 'down') indicator.text = '-';
                    else if (c.value === 'up') indicator.text = '+';
                    else if (c.value === 'zero') indicator.text = '0';
                }
            });
        };

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
    displayPilotPlantPopup(localPlayer: Player, confirmColorChangeCall: ( cardIndex: number,color: Color,) => void,confirmAssetAbilityCall: (index: number) => void,cardIndex: number){
        const tempContainer = this._createPopupBase();

        let selectedCardIndex = -1;
        const cardOutlines: Graphics[] = [];

        const totalAssetsWidth = (localPlayer.assetList.length) * 200;
        const startX = (window.innerWidth - totalAssetsWidth) /2;
        const startY = window.innerHeight /2;
        localPlayer.assetList.forEach(async (asset, index) =>{
            const texture = await Assets.load(asset.texturePath);
            const card = new Sprite(texture);
            card.scale.set(0.25);
            card.anchor.set(0.5);
           
            card.x = startX + index * 200;
            card.y = startY;

            card.eventMode = 'static';
            card.cursor = 'pointer';

            const outline = new Graphics()
                .roundRect(-card.width / 2 - 5, -card.height / 2 - 5, card.width + 10, card.height + 10, 10)
                .stroke({ width: 5, color: 0xFFFFFF });
            outline.position.copyFrom(card.position);
            outline.visible = false;
            cardOutlines[index] = outline;

            card.on('pointertap', () => {
                selectedCardIndex = index;
                cardOutlines.forEach((o) => { if (o) o.visible = false; });
                if (cardOutlines[index]) cardOutlines[index].visible = true;
                confirmColorChangeCall(selectedCardIndex, colors[selectedIndex]?.name as Color);
            });

            tempContainer.addChild(card);
            tempContainer.addChild(outline);
        });


        const wheel = new Container();

        const colors = [
            { name: 'Yellow', color: 0xFFFF00 },
            { name: 'Blue',   color: 0x0000FF },
            { name: 'Green',  color: 0x00FF00 },
            { name: 'Purple', color: 0x800080 },
            { name: 'Red',    color: 0xFF0000 },
        ];

        const centerX = (window.innerWidth - totalAssetsWidth) /2 + totalAssetsWidth;
        const centerY = window.innerHeight/2 ;
        const radius = 100;
        const segments = colors.length;
        const angleStep = (Math.PI * 2) / segments;

        let selectedIndex = -1;
        const segmentGraphics: Graphics[] = [];

        const drawSegment = (g: Graphics, index: number, isSelected: boolean) => {
            const startAngle = index * angleStep;
            const endAngle = startAngle + angleStep;
            g.clear()
                .moveTo(centerX, centerY)
                .arc(centerX, centerY, radius, startAngle, endAngle)
                .closePath()
                .fill(marketColors[colors[index]!.name as Color]);
            
            if (isSelected) {
                g.stroke({ width: 5, color: 0xFFFFFF });
                if (selectedCardIndex> 0){
                    confirmColorChangeCall(selectedCardIndex, colors[selectedIndex]!.name as Color);
                }
               
                
              
            }
        };

        for (let i = 0; i < segments; i++) {
            const segment = new Graphics();
            drawSegment(segment, i, false);

            segment.eventMode = 'static';
            segment.cursor = 'pointer';
            segment.on('pointertap', () => {
                if (selectedIndex === i) return;

                if (selectedIndex !== -1) {
                    drawSegment(segmentGraphics[selectedIndex]!, selectedIndex, false);
                   
                }
                
                selectedIndex = i;
                drawSegment(segment, i, true);
                wheel.addChild(segment);
               
            });
            segmentGraphics.push(segment);
            wheel.addChild(segment);
        }
        wheel.pivot.set(centerX, centerY);
        wheel.position.set(centerX, centerY);
        wheel.rotation += 0.92;
        tempContainer.addChild(wheel);


        const confirmButton = new FancyButton({
            text: "Confirm",
            width: 200,
            height: 60,
            onPress: () => {
                confirmAssetAbilityCall(cardIndex);
                //confirmColorChangeCall(selectedCardIndex, colors[selectedIndex]!.name as Color);
                if (tempContainer.parent) {
                    tempContainer.parent.removeChild(tempContainer);
                }
                
            }
        });
        confirmButton.view.position.set(this.app.screen.width / 2 - (confirmButton.view.width / 2), this.app.screen.height - 180);
        tempContainer.addChild(confirmButton.view);

        this._addPopupCloseButton(tempContainer);
        
        this.popupContainer.addChild(tempContainer);
    }

    displayApplicationLabPopup(localPlayer: Player, silverIntoGoldCall: (index: number) => void,confirmAssetAbilityCall: (index: number) => void,cardIndex: number){
        const tempContainer = this._createPopupBase();

        //const selectedCardIndex = -1;
        const cardOutlines: Graphics[] = [];

        const totalAssetsWidth = (localPlayer.assetList.length - 1) * 200;
        const startX = (window.innerWidth - totalAssetsWidth) /2;
        const startY = window.innerHeight /2;
        localPlayer.assetList.forEach(async (asset, index) =>{
            const texture = await Assets.load(asset.texturePath);
            const card = new Sprite(texture);
            card.scale.set(0.25);
            card.anchor.set(0.5);
           
            card.x = startX + index * 200;
            card.y = startY;

            card.eventMode = 'static';
            card.cursor = 'pointer';

            const outline = new Graphics()
                .roundRect(-card.width / 2 - 5, -card.height / 2 - 5, card.width + 10, card.height + 10, 10)
                .stroke({ width: 5, color: 0xFFFFFF });
            outline.position.copyFrom(card.position);
            outline.visible = false;
            cardOutlines[index] = outline;

            card.on('pointertap', () => {
                cardOutlines.forEach((o) => { if (o) o.visible = false; });
                if (cardOutlines[index]) cardOutlines[index].visible = true;
                silverIntoGoldCall(index)
            });

            tempContainer.addChild(card);
            tempContainer.addChild(outline);
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

        this._addPopupCloseButton(tempContainer);
        
        this.popupContainer.addChild(tempContainer);
    }

    displayEndGameScores(scores: {name: string, score: number}[]) {
        this.popupContainer.removeChildren();
        this.endGameScoresContainer = new Container();
        
        const x = 20;
        let y = this.app.screen.height / 2;
        
        const bg = new Graphics();
        this.endGameScoresContainer.addChild(bg);
        
        const scoreTexts: Record<string, Text> = {};

        scores.forEach(s => {
            const nameText = new Text({ text: s.name, style: { fill: '#ffffff', fontSize: 20, fontFamily: 'MyFont' } });
            nameText.position.set(x, y);
            this.endGameScoresContainer!.addChild(nameText);
            
            const scoreText = new Text({ text: s.score.toFixed(2), style: { fill: '#CBC28E', fontSize: 20, fontFamily: 'MyFont' } });
            scoreText.position.set(x + 150, y);
            this.endGameScoresContainer!.addChild(scoreText);
            
            scoreTexts[s.name] = scoreText;
            y += 30;
        });

        bg.roundRect(10, 10, 250, y, 10).fill(0x000000).stroke({width:2, color:0xffffff}).alpha = 0.5;
        
        this.popupContainer.addChild(this.endGameScoresContainer);

        this.updateEndGameScoreCallback = (name, newScore) => {
            if (scoreTexts[name]) {
                scoreTexts[name].text = newScore.toFixed(2);
            }
        };
    }

    _createPopupBase() {
        this.popupContainer.removeChildren();
        if (this.endGameScoresContainer) {
            this.popupContainer.addChild(this.endGameScoresContainer);
        }
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