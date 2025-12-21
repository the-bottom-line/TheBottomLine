import { Container, Graphics, Text, Sprite, Assets, FillGradient, Application } from 'pixi.js';
import { FancyButton } from '../FancyButton.js';
import type HudManager from './HudManager.js';
import { BankerPopups } from './Popups/BankerPopups.js';
import { RegulatorPopups } from './Popups/RegulatorPopups.js';
import { MarketPopups } from './Popups/MarketPopups.js';
import { CharacterPopups } from './Popups/CharacterPopups.js';

class PopUpManager {
    app: Application;
    popupContainer: Container;
    hudManager: HudManager;

    public bankerPopups: BankerPopups;
    public regulatorPopups: RegulatorPopups;
    public marketPopups: MarketPopups;
    public characterPopups: CharacterPopups;

    constructor(app: Application, popupContainer: Container, hudManager: HudManager) {
        this.app = app;
        this.popupContainer = popupContainer;
        this.hudManager = hudManager;

        this.bankerPopups = new BankerPopups(this);
        this.regulatorPopups = new RegulatorPopups(this);
        this.marketPopups = new MarketPopups(this);
        this.characterPopups = new CharacterPopups(this);
    }

    createPopupBase() {
        this.popupContainer.removeChildren();
        const endGameScoresContainer = this.marketPopups.getEndGameScoresContainer();
        if (endGameScoresContainer) {
            this.popupContainer.addChild(endGameScoresContainer);
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

    addPopupCloseButton(popupContainer: Container) {
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

    async createStandardPopupContent(mainIconPath: string, title: string, description: string,secondaryIconPath:string) {
        const tempContainer = this.createPopupBase();
        const x = this.app.screen.width / 2;
        let y = this.app.screen.height / 2 - 150;

        const mainTexture = await Assets.load(mainIconPath);
        const mainIcon = new Sprite(mainTexture);
        mainIcon.position.set(x, y);
        mainIcon.width = 150;
        mainIcon.height = 180;
        mainIcon.anchor.set(0.5);
        tempContainer.addChild(mainIcon);
        y += 100;

        const titleText = new Text({
            text: title,
            style: { fill: '#ffffff', fontSize: 24, fontFamily: 'MyFont' }
        });
        const titleBgWidth = Math.max(240, titleText.width + 40);
        const titleBackground = new Graphics()
            .roundRect(x - titleBgWidth/2, y - 25, titleBgWidth, 50, 5)
            .fill(0x60584C)
            .stroke({ width: 2, color: 0x000000 });
        
        titleText.anchor.set(0.5);
        titleText.position.set(x, y);
        tempContainer.addChild(titleBackground);
        tempContainer.addChild(titleText);
        y += 70;

        const descText = new Text({
            text: description,
            style: { fill: '#ffffff', fontSize: 18, fontFamily: 'MyFont', align: 'center', wordWrap: true, wordWrapWidth: 400 }
        });
        const descBgWidth = Math.max(350, descText.width + 40);
        const descBackground = new Graphics()
            .roundRect(x - descBgWidth/2, y - descText.height/2 - 10, descBgWidth, descText.height + 20, 5)
            .fill(0x323232)
            .stroke({ width: 2, color: 0x000000 });
        
        descText.anchor.set(0.5);
        descText.position.set(x, y);
        tempContainer.addChild(descBackground);
        tempContainer.addChild(descText);

        const secondaryTexture = await Assets.load(secondaryIconPath);
        const secondaryIcon = new Sprite(secondaryTexture);
        secondaryIcon.position.set(x-350/2, y);
        secondaryIcon.width = 80;
        secondaryIcon.height = 90;
        secondaryIcon.anchor.set(0.5);
        tempContainer.addChild(secondaryIcon);

        return { container: tempContainer, contentY: y };
    }
}

export default PopUpManager;