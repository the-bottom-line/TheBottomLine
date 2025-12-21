import { Container, Graphics, Text, Sprite, Assets } from 'pixi.js';
import { FancyButton } from '../../FancyButton.js';
import type Player from '../../Player.js';
import type Character from '../../Characters.js';
import type { IssuedLiabilityToPayBanker, SoldAssetToPayBanker } from '@shared-types';
import type PopUpManager from '../PopUpManager.js';
import Liability from '../../Liability.js';

export class BankerPopups {
    private manager: PopUpManager;
    private updateBankerSellTable?: (data: { assets: Array<SoldAssetToPayBanker>; liabilities: Array<IssuedLiabilityToPayBanker>; }) => void;

    constructor(manager: PopUpManager) {
        this.manager = manager;
    }

    async playerTargetedByBanker(targetPlayer: Player, cashDue: number, isSelf: boolean, onPayCallback: (amount: number) => void, onSelectCallback: (index: number) => void, onUnelectCallback: (index: number) => void, onSelectLiablityCallback: (index: number) => void, onUnselectLiablityCallback: (index: number) => void) {
        const tempContainer = this.manager.createPopupBase();
        const x = this.manager.app.screen.width / 2;
        let y = this.manager.app.screen.height / 2 - 300;

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

        const addRow = (parts: { text: string, color: string, bold?: boolean }[], value: string) => {
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

        addRow([{ text: "Base Fee", color: "#cccccc" }], "+1 Gold");
        for (const color in assetCounts) {
            addRow([
                { text: color, color: color, bold: true },
                { text: "Assets", color: color }
            ], `+1 Gold`);
        }

        const line = new Graphics().moveTo(0, rowY).lineTo(tableInnerWidth, rowY).stroke({ width: 2, color: 0xffffff });
        breakdownContainer.addChild(line);
        rowY += 10;

        addRow([{ text: "Total Due", color: "#cccccc" }], `${cashDue} Gold`);

        breakdownContainer.x = x - tableInnerWidth / 2;
        breakdownContainer.y = y;

        const breakdownBg = new Graphics()
            .roundRect(breakdownContainer.x - bgPadding, breakdownContainer.y - bgPadding, contentWidth, rowY + bgPadding * 2, 10)
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
                        this.displayBankerSellAssets(targetPlayer, cashDue, onPayCallback, onSelectCallback, onUnelectCallback, onSelectLiablityCallback, onUnselectLiablityCallback);
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
                            this.displayBankerIssueLiabilities(targetPlayer, cashDue, onPayCallback, onSelectCallback, onUnelectCallback, onSelectLiablityCallback, onUnselectLiablityCallback);
                        }
                    });
                    issueButton.view.position.set(x - 100, y);
                    tempContainer.addChild(issueButton.view);
                }
            }
        } else {
            this.manager.addPopupCloseButton(tempContainer);
        }

        this.manager.popupContainer.addChild(tempContainer);
    }

    async displayBankerPaymentNotification(payer: Player, banker: Player, amountPaid: number, isLocalBanker: boolean, isLocalPayer: boolean, assets: SoldAssetToPayBanker[], liabilities: IssuedLiabilityToPayBanker[]) {
        const tempContainer = this.manager.createPopupBase();
        const x = this.manager.app.screen.width / 2;
        let y = this.manager.app.screen.height / 2 - 250;

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
            actions.push(`Issued ${count} liability${count > 1 ? 'ies' : ''}`);
        }

        if (actions.length > 0) {
            if (isLocalPayer) {
                descriptionStr += `\n\nTo do this, you:\n` + actions.join('\n');
            } else {
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
            .roundRect(x - 200, y - descriptionText.height / 2 - 20, 400, descriptionText.height + 40, 5)
            .fill(0x323232)
            .stroke({ width: 2, color: 0x000000 });

        tempContainer.addChild(descriptionBackground);
        tempContainer.addChild(descriptionText);

        this.manager.addPopupCloseButton(tempContainer);
        this.manager.popupContainer.addChild(tempContainer);
    }

    updateBankerSellAssets(data: { assets: Array<SoldAssetToPayBanker>; liabilities: Array<IssuedLiabilityToPayBanker>; }) {
        if (this.updateBankerSellTable) {
            this.updateBankerSellTable(data);
        }
    }

    async displayBankerSellAssets(targetPlayer: Player, cashDue: number, onPayCallback: (amount: number) => void, onSelectCallback: (index: number) => void, onUnselectCallback: (index: number) => void, onSelectLiablityCallback: (index: number) => void, onUnselectLiablityCallback: (index: number) => void) {
        const tempContainer = this.manager.createPopupBase();

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

        const assetsValueRef: { text?: Text } = {};
        addRow("Assets Value", "0 Gold", assetsValueRef);

        const liabilitiesValueRef: { text?: Text } = {};
        addRow("Liabilities Value", "0 Gold", liabilitiesValueRef);

        line = new Graphics().moveTo(0, rowY).lineTo(250, rowY).stroke({ width: 2, color: 0xffffff });
        breakdownContainer.addChild(line);
        rowY += 10;

        const resultingCashRef: { text?: Text } = {};
        addRow("Resulting Cash", `${targetPlayer.cash - cashDue} Gold`, resultingCashRef);

        const bgPadding = 20;
        const breakdownBg = new Graphics()
            .roundRect(-bgPadding, -bgPadding, 250 + bgPadding * 2, rowY + bgPadding * 2, 10)
            .fill(0x323232)
            .stroke({ width: 2, color: 0x000000 });

        const tableContainer = new Container();
        tableContainer.addChild(breakdownBg);
        tableContainer.addChild(breakdownContainer);
        tableContainer.position.set(40, 110);
        tempContainer.addChild(tableContainer);

        this.updateBankerSellTable = (data) => {
            let assetValue = 0;
            let liablityValue = 0;
            if (data.assets) {
                data.assets.forEach((item) => assetValue += item.market_value);
            }
            if (data.liabilities) {
                data.liabilities.forEach((item) => liablityValue += item.liability.value);
            }
            if (assetsValueRef.text) assetsValueRef.text.text = `${assetValue} Gold`;
            if (resultingCashRef.text) resultingCashRef.text.text = `${targetPlayer.cash + assetValue + liablityValue - cashDue} Gold`;
        };

        const titleText = new Text({
            text: `Select Assets to sell for market value`,
            style: { fill: '#ffffff', fontSize: 24, fontFamily: 'MyFont' }
        });
        titleText.anchor.set(0.5);
        titleText.position.set(this.manager.app.screen.width / 2, 100);
        tempContainer.addChild(titleText);

        const cardScale = 0.25;
        const cardWidth = 590 * cardScale;
        const spacing = 20;
        const totalWidth = (targetPlayer.assetList.length * cardWidth) + ((targetPlayer.assetList.length - 1) * spacing);
        const startX = this.manager.app.screen.width / 2 - totalWidth / 2 + cardWidth / 2;
        const startY = this.manager.app.screen.height - 250;

        const selectedIndices: number[] = [];
        const cardSprites: { sprite: Sprite, originalPos: { x: number, y: number }, index: number }[] = [];

        const updateSelectedPositions = () => {
            const totalSelWidth = (selectedIndices.length * cardWidth) + ((selectedIndices.length - 1) * spacing);
            const selStartX = this.manager.app.screen.width / 2 - totalSelWidth / 2 + cardWidth / 2;

            selectedIndices.forEach((originalIndex, i) => {
                const cardObj = cardSprites.find(c => c.index === originalIndex);
                if (cardObj) {
                    cardObj.sprite.position.set(selStartX + i * (cardWidth + spacing), this.manager.app.screen.height / 2);
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

            sprite.on('mousedown', () => {
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
        payButton.view.position.set(this.manager.app.screen.width / 2 - 100, this.manager.app.screen.height - 170);
        tempContainer.addChild(payButton.view);

        const backButton = new FancyButton({
            text: "Back",
            width: 200,
            height: 60,
            onPress: () => {
                if (tempContainer.parent) tempContainer.parent.removeChild(tempContainer);
                this.playerTargetedByBanker(targetPlayer, cashDue, true, onPayCallback, onSelectCallback, onUnselectCallback, onSelectLiablityCallback, onUnselectLiablityCallback,);
            }
        });
        backButton.view.position.set(this.manager.app.screen.width / 2 - (backButton.view.width / 2), this.manager.app.screen.height - 100);
        tempContainer.addChild(backButton.view);
        this.manager.popupContainer.addChild(tempContainer);
    }

    async displayBankerIssueLiabilities(targetPlayer: Player, cashDue: number, onPayCallback: (amount: number) => void, onSelectCallback: (index: number) => void, onUnselectCallback: (index: number) => void, onSelectLiablityCallback: (index: number) => void, onUnselectLiablityCallback: (index: number) => void) {
        const tempContainer = this.manager.createPopupBase();

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

        const assetsValueRef: { text?: Text } = {};
        addRow("Assets Value", "0 Gold", assetsValueRef);

        const liabilitiesValueRef: { text?: Text } = {};
        addRow("Liabilities Value", "0 Gold", liabilitiesValueRef);

        const line = new Graphics().moveTo(0, rowY).lineTo(250, rowY).stroke({ width: 2, color: 0xffffff });
        breakdownContainer.addChild(line);
        rowY += 10;

        const resultingCashRef: { text?: Text } = {};
        addRow("Resulting Cash", `${targetPlayer.cash - cashDue} Gold`, resultingCashRef);

        const bgPadding = 20;
        const breakdownBg = new Graphics()
            .roundRect(-bgPadding, -bgPadding, 250 + bgPadding * 2, rowY + bgPadding * 2, 10)
            .fill(0x323232)
            .stroke({ width: 2, color: 0x000000 });

        const tableContainer = new Container();
        tableContainer.addChild(breakdownBg);
        tableContainer.addChild(breakdownContainer);
        tableContainer.position.set(40, 110);
        tempContainer.addChild(tableContainer);

        this.updateBankerSellTable = (data) => {
            let assetValue = 0;
            let liablityValue = 0;
            if (data.assets) {
                data.assets.forEach((item) => assetValue += item.market_value);
            }
            if (data.liabilities) {
                data.liabilities.forEach((item) => liablityValue += item.liability.value);
            }
            if (liabilitiesValueRef.text) liabilitiesValueRef.text.text = `${liablityValue} Gold`;
            if (resultingCashRef.text) resultingCashRef.text.text = `${targetPlayer.cash + assetValue + liablityValue - cashDue} Gold`;
        };

        const titleText = new Text({
            text: `Issue Liabilities (Due: ${cashDue} Gold)`,
            style: { fill: '#ffffff', fontSize: 24, fontFamily: 'MyFont' }
        });
        titleText.anchor.set(0.5);
        titleText.position.set(this.manager.app.screen.width / 2, 100);
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
        const startX = this.manager.app.screen.width / 2 - totalWidth / 2 + cardWidth / 2;
        const startY = this.manager.app.screen.height - 250;

        const selectedIndices: number[] = [];
        const cardSprites: { sprite: Sprite, originalPos: { x: number, y: number }, index: number }[] = [];

        const updateSelectedPositions = () => {
            const totalSelWidth = (selectedIndices.length * cardWidth) + ((selectedIndices.length - 1) * spacing);
            const selStartX = this.manager.app.screen.width / 2 - totalSelWidth / 2 + cardWidth / 2;

            selectedIndices.forEach((originalIndex, i) => {
                const cardObj = cardSprites.find(c => c.index === originalIndex);
                if (cardObj) {
                    cardObj.sprite.position.set(selStartX + i * (cardWidth + spacing), this.manager.app.screen.height / 2);
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

            sprite.on('mousedown', () => {
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
        payButton.view.position.set(this.manager.app.screen.width / 2 - 100, this.manager.app.screen.height - 170);
        tempContainer.addChild(payButton.view);

        const backButton = new FancyButton({
            text: "Back",
            width: 200,
            height: 60,
            onPress: () => {
                if (tempContainer.parent) tempContainer.parent.removeChild(tempContainer);
                this.playerTargetedByBanker(targetPlayer, cashDue, true, onPayCallback, onSelectCallback, onUnselectCallback, onSelectLiablityCallback, onUnselectLiablityCallback);
            }
        });
        backButton.view.position.set(this.manager.app.screen.width / 2 - (backButton.view.width / 2), this.manager.app.screen.height - 100);
        tempContainer.addChild(backButton.view);
        this.manager.popupContainer.addChild(tempContainer);
    }

    async terminatedCreditCharacter(character: Character, localPlayer: Player) {
        let description = character.name;
        if (character === localPlayer.character) {
            description += "\nYou have been terminated";
        }

        const { container: tempContainer } = await this.manager.createStandardPopupContent(
            "./miscellaneous/BankerIcon.png",
            "The Banker terminated...",
            description,
            character.iconPath
        );

        this.manager.addPopupCloseButton(tempContainer);
        this.manager.popupContainer.addChild(tempContainer);
    }

    async youAreTerminatingSomeone(characters: Character[], perk: string, onSelectCallback: (charToTerminate: Character) => void) {
        const tempContainer = this.manager.createPopupBase();

        const x = this.manager.app.screen.width / 2;
        let y = this.manager.app.screen.height / 2 - 300;

        const texture = await Assets.load("./miscellaneous/BankerIcon.png");
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
            text: 'Banker’s perk',
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
            faceUpCard.on('mousedown', () => {
                onSelectCallback(character);
                if (tempContainer.parent) {
                    tempContainer.parent.removeChild(tempContainer);
                }
            });
            tempContainer.addChild(faceUpCard);

        });
        this.manager.addPopupCloseButton(tempContainer);
        this.manager.popupContainer.addChild(tempContainer);
    }
}
