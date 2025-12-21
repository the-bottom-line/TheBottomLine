import { Container, Graphics, Text, Sprite, Assets } from 'pixi.js';
import { FancyButton } from '../../FancyButton.js';
import type Player from '../../Player.js';
import type { Color, MarketCard } from '@shared-types';
import type PopUpManager from '../PopUpManager.js';

export class MarketPopups {
    private manager: PopUpManager;
    private updateRnDMarketCallback?: (market: MarketCard) => void;
    private updateEndGameScoreCallback?: (name: string, score: number) => void;
    private endGameScoresContainer?: Container;

    constructor(manager: PopUpManager) {
        this.manager = manager;
    }

    updateRnDMarket(market: MarketCard) {
        if (this.updateRnDMarketCallback) this.updateRnDMarketCallback(market);
    }

    updateEndGameScore(name: string, score: number) {
        if (this.updateEndGameScoreCallback) this.updateEndGameScoreCallback(name, score);
    }

    displayRnDPopup(marketState: MarketCard, onSelectCallback: (color: Color) => void, confirmAssetAbilityCall: (index: number) => void, cardIndex: number) {
        const tempContainer = this.manager.createPopupBase();

        const width = 420;
        const height = 100;

        const marketContent = new Container();
        marketContent.x = (this.manager.app.screen.width - width) / 2;
        marketContent.y = (this.manager.app.screen.height - height) / 2;

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
        const circleY = height / 2;
        const spacing = 80;
        const totalCircleWidth = (colors.length - 1) * spacing;
        const startX = (width - totalCircleWidth) / 2;

        const statusIndicators: Record<string, Text> = {};
        colors.forEach((colorInfo, index) => {
            const circleX = startX + index * spacing;
            const circle = new Graphics()
                .circle(0, 0, circleRadius)
                .fill(this.manager.hudManager.getColorHex(colorInfo.name))
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
        confirmButton.view.position.set(this.manager.app.screen.width / 2 - (confirmButton.view.width / 2), this.manager.app.screen.height - 180);
        tempContainer.addChild(confirmButton.view);

        tempContainer.addChild(marketContent);
        this.manager.addPopupCloseButton(tempContainer);

        this.manager.popupContainer.addChild(tempContainer);


    }

    displayPilotPlantPopup(localPlayer: Player, confirmColorChangeCall: (cardIndex: number, color: Color,) => void, confirmAssetAbilityCall: (index: number) => void, cardIndex: number) {
        const tempContainer = this.manager.createPopupBase();

        let selectedCardIndex = -1;
        const cardOutlines: Graphics[] = [];

        const totalAssetsWidth = (localPlayer.assetList.length) * 200;
        const startX = (window.innerWidth - totalAssetsWidth) / 2;
        const startY = window.innerHeight / 2;
        localPlayer.assetList.forEach(async (asset, index) => {
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

            card.on('pointerdown', () => {
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
            { name: 'Yellow', color: 0xEBB324 },
            { name: 'Blue', color: 0x73A9D9 },
            { name: 'Green', color: 0xAD3A25 },
            { name: 'Purple', color: 0x6E5DAA },
            { name: 'Red', color: 0xAD3A25 },
        ];

        const centerX = (window.innerWidth - totalAssetsWidth) / 2 + totalAssetsWidth;
        const centerY = window.innerHeight / 2;
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
                .fill(colors[index]!.color!);

            if (isSelected) {
                g.stroke({ width: 5, color: 0xFFFFFF });
                if (selectedCardIndex > 0) {
                    confirmColorChangeCall(selectedCardIndex, colors[selectedIndex]!.name as Color);
                }



            }
        };

        for (let i = 0; i < segments; i++) {
            const segment = new Graphics();
            drawSegment(segment, i, false);

            segment.eventMode = 'static';
            segment.cursor = 'pointer';
            segment.on('pointerdown', () => {
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
        confirmButton.view.position.set(this.manager.app.screen.width / 2 - (confirmButton.view.width / 2), this.manager.app.screen.height - 180);
        tempContainer.addChild(confirmButton.view);

        this.manager.addPopupCloseButton(tempContainer);

        this.manager.popupContainer.addChild(tempContainer);
    }

    displayApplicationLabPopup(localPlayer: Player, silverIntoGoldCall: (index: number) => void, confirmAssetAbilityCall: (index: number) => void, cardIndex: number) {
        const tempContainer = this.manager.createPopupBase();

        const selectedCardIndex = -1;
        const cardOutlines: Graphics[] = [];

        const totalAssetsWidth = (localPlayer.assetList.length - 1) * 200;
        const startX = (window.innerWidth - totalAssetsWidth) / 2;
        const startY = window.innerHeight / 2;
        localPlayer.assetList.forEach(async (asset, index) => {
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

            card.on('pointerdown', () => {
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
        confirmButton.view.position.set(this.manager.app.screen.width / 2 - (confirmButton.view.width / 2), this.manager.app.screen.height - 180);
        tempContainer.addChild(confirmButton.view);

        this.manager.addPopupCloseButton(tempContainer);

        this.manager.popupContainer.addChild(tempContainer);
    }

    displayEndGameScores(scores: { name: string, score: number }[]) {
        this.manager.popupContainer.removeChildren();
        this.endGameScoresContainer = new Container();

        const x = 40; // here
        let y = 110;

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

        bg.roundRect(10, 10, 250, y, 10).fill(0x000000).stroke({ width: 2, color: 0xffffff }).alpha = 0.5;

        this.manager.popupContainer.addChild(this.endGameScoresContainer);

        this.updateEndGameScoreCallback = (name, newScore) => {
            if (scoreTexts[name]) {
                scoreTexts[name].text = newScore.toFixed(2);
            }
        };
    }

    getEndGameScoresContainer() {
        return this.endGameScoresContainer;
    }
}
