import { Container, Graphics, Text, Sprite, Assets, FillGradient, ColorMatrixFilter, Application, TextStyle } from 'pixi.js';
import { Input } from '@pixi/ui';
import { FancyButton } from './FancyButton.js';
import AssetCards from "./AssetCards.js";
import LiabilityCards from "./LiabilityCards.js";
import type Player from './Player.js';
import type Character from './Characters.js';
import type {  PlayerScore } from '@shared-types';
import PopUpManager from './UIManager/PopUpManager.js';
import HudManager from './UIManager/HudManager.js';

class UIManager {
    app: Application;
    popUpManager: PopUpManager;
    hudManager: HudManager;
    
    loginContainer = new Container();
    lobbyContainer = new Container();
    mainContainer = new Container();
    pickingContainer = new Container();
    characterContainer = new Container();
    characterOpenContainer = new Container();
    characterCardsContainer = new Container();
    decksContainer = new Container();
    playedCardsContainer = new Container();
    tempCardsContainer = new Container();
    handContainer = new Container();
    elseTurnContainer = new Container();
    popupContainer = new Container();
    resultsContainer = new Container();
    marketContainer = new Container();
    purpleCardsContainer = new Container();
    
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

        this._setupContainers();

        this.popUpManager = new PopUpManager(this.app, this.popupContainer);
        this.hudManager = new HudManager(this.app);
    }

    _setupContainers() {
        const sprites = new Container();
        const backGroundGradient = new Graphics().rect(0, 0, this.app.screen.width , this.app.screen.height).fill(this.getGradient());

        this.app.stage.addChild(backGroundGradient, sprites);

        this.characterContainer.addChild(this.characterCardsContainer);
        this.mainContainer.addChild(this.handContainer, this.playedCardsContainer);
        this.pickingContainer.addChild(this.decksContainer, this.tempCardsContainer);
        
        this.elseTurnContainer.addChild(this.playedCardsContainer);

        sprites.addChild(
            this.loginContainer,
            this.characterContainer,
            this.pickingContainer,
            this.mainContainer,
            this.elseTurnContainer,
            this.lobbyContainer,
            this.statsText,
            this.resultsContainer,
            this.marketContainer,
            this.popupContainer,
            this.purpleCardsContainer
        );

        this.handContainer.sortableChildren = true;
        this.tempCardsContainer.sortableChildren = true;
        this.playedCardsContainer.sortableChildren = true;
    }

    getGradient() {
        return new FillGradient({
            type: 'radial',
            center: { x: 0.5, y: 0.5 },
            innerRadius: 0.15,
            outerCenter: { x: 0.5, y: 0.5 },
            outerRadius: 0.5,
            colorStops: [
                { offset: 0, color: 0x4a4949 },
                { offset: 1, color: 0x252525 },
            ],
        });
    }

    showScreen(screenName: string) {
        this.loginContainer.visible = screenName === 'login';
        this.lobbyContainer.visible = screenName === 'lobby';
        this.characterContainer.visible = screenName === 'character';
        this.mainContainer.visible = screenName === 'main';
        this.pickingContainer.visible = screenName === 'picking';
        this.elseTurnContainer.visible = screenName === 'elseTurn';
        this.purpleCardsContainer.visible = screenName == 'purpleCards'
        this.resultsContainer.visible = screenName === 'results';
        this.marketContainer.visible = screenName === 'main' || screenName === 'elseTurn';
    }

    createNametBox() {
        const inputBox = new Input({
            bg: new Graphics().roundRect(0, 0, 300, 80, 10).fill(0x333333),
            padding: [10, 10, 10, 10],
            textStyle: {
                fontSize: 32,
                fontWeight: 'bold'
            },
            placeholder: "Enter Name:",
        });
        inputBox.position.set(this.app.screen.width  / 2-150, this.app.screen.height / 2 -100);
        this.loginContainer.addChild(inputBox);
        return inputBox;
    }
    createChannelBox(){
        const inputBox = new Input({
            bg: new Graphics().roundRect(0, 0, 300, 80, 10).fill(0x333333),
            padding: [10, 10, 10, 10],
            textStyle: {
                fontSize: 32,
                fontWeight: 'bold'
            },
            placeholder: "Lobby Code:",
        });
        inputBox.position.set(this.app.screen.width / 2-150, this.app.screen.height / 2 +30);
        this.loginContainer.addChild(inputBox);
        return inputBox;
    }
    createJoinButton(onPressCallback: () => void) {
        const joinButton = new FancyButton({
            text: "Join",
            width: 200,
            height: 60,
            onPress: onPressCallback
        });

        joinButton.view.position.set(this.app.screen.width  / 2 - (joinButton.view.width / 2), this.app.screen.height - 100);

        this.loginContainer.addChild(joinButton.view);
    }
    displayGameName(container: Container){
        this.loginContainer.removeChildren();
        const titleText = new Text({
            text: 'The Bottom (on)Line',
            style: { fill: '#ffffff', fontSize: 56, fontFamily: 'MyFont' }
        });
        titleText.anchor.set(0.5,0);
        titleText.position.set(this.app.screen.width  / 2, 20);
        container.addChild(titleText);
    }
    displayLobbyPlayers(players: Player[], onStartGameCallback: () => void) {
        this.lobbyContainer.removeChildren();
        this.displayGameName(this.lobbyContainer);

        players.forEach((player, index) => {
            const playerText = new Text({
                text: player.name,
                style: { fill: '#ffffff', fontSize: 32, fontFamily: 'MyFont' }
            });
            playerText.anchor.set(0.5);
            playerText.position.set(this.app.screen.width  / 2, 180 + index * 40);
            this.lobbyContainer.addChild(playerText);
        });
        this.createStartGameBox(onStartGameCallback);
    }

    createStartGameBox(onPressCallback: () => void) {
        const startGameButton = new FancyButton({
            text: "Start",
            width: 200,
            height: 60,
            onPress: onPressCallback
        });
        startGameButton.view.position.set(this.app.screen.width / 2 - (startGameButton.view.width / 2), this.app.screen.height - 100);
        this.lobbyContainer.addChild(startGameButton.view);
    }

    async createAssetDeck(onPressCallback: () => void) {
        const assetDeck = new AssetCards();
        const assetDeckSprite = await assetDeck.initializeDeckSprite();
        assetDeck.setDeckPosition(this.app.screen.width / 2 - 150, 70);
        assetDeckSprite.on('mousedown', onPressCallback);
        this.decksContainer.addChild(assetDeckSprite);
    }

    async createLiabilityDeck(onPressCallback: () => void) {
        const liabilityDeck = new LiabilityCards();
        const liabilityDeckSprite = await liabilityDeck.initializeDeckSprite();
        liabilityDeck.setDeckPosition(this.app.screen.width / 2 + 150, 70);
        liabilityDeckSprite.on('mousedown', onPressCallback);
        this.decksContainer.addChild(liabilityDeckSprite);
    }

    async displayCharacterSelection(faceUpCharacters: Character[],openCharacters: Character[], onSelectCallback: (_: Character) => void,closedCharacter?: Character) {
        this.characterCardsContainer.removeChildren();
        const spacing = 200;
        const startX = (this.app.screen.width - ((faceUpCharacters.length - 1) * spacing)) / 2;
        const grayscaleFilter = new ColorMatrixFilter();
        grayscaleFilter.grayscale(0.2, true);

        if(closedCharacter != null){
            const texture = await Assets.load(closedCharacter.texturePath);
            const closedCard = new Sprite(texture);
            closedCard.interactive = true;
            closedCard.scale.set(0.3);
            closedCard.anchor.set(0.5);
            closedCard.x = this.app.screen.width / 2;
            closedCard.y = this.app.screen.height / 2-300;

            this.characterCardsContainer.addChild(closedCard);
        }
        
            
            

        faceUpCharacters.forEach(async (character, index) => {
            const texture = await Assets.load(character.texturePath);
            const faceUpCard = new Sprite(texture);
            faceUpCard.interactive = true;
            faceUpCard.scale.set(0.3);
            faceUpCard.anchor.set(0.5);
            
            faceUpCard.x = startX + index * spacing;
            faceUpCard.y = this.app.screen.height / 2;
            faceUpCard.on('mousedown', () => onSelectCallback(character)); // here
            this.characterCardsContainer.addChild(faceUpCard);
            
        });

       
        const openX = (this.app.screen.width - ((openCharacters.length - 1) * spacing)) / 2;
        openCharacters.forEach(async (character, index) =>{
           
            const texture = await Assets.load(character.texturePath);
            const openCard = new Sprite(texture);
            openCard.interactive = true;
            openCard.scale.set(0.3);
            openCard.anchor.set(0.5);
            openCard.filters = [grayscaleFilter];
            openCard.x = openX + index * spacing;
            openCard.y = this.app.screen.height / 2 + 300;
            this.characterCardsContainer.addChild(openCard);
        });
    }

    displayTempCards(player: Player) {
        this.tempCardsContainer.removeChildren();
        const tempCards = player.hand.filter(c => c.isTemporary);

        const cardWidth = 590 * 0.25;
        const cardHeight = 940 * 0.25;
        const spacing = 180;
        const startX = (this.app.screen.width - (player.drawableCards * spacing)) / 2 + spacing / 2;
        const y = this.app.screen.height / 2;

        for (let i = 0; i < player.drawableCards; i++) {
            const backdrop = new Graphics()
                .roundRect(0, 0, cardWidth + 10, cardHeight + 10, 15)
                .stroke({ width: 4, color: 0xCBC28E }) // 0xCBC28E -> gold color
                .fill({ alpha: 0 });
            backdrop.position.set(startX + (i * spacing), y);
            backdrop.pivot.set((cardWidth + 10) / 2, (cardHeight + 10) / 2);
            this.tempCardsContainer.addChild(backdrop);
        }

        tempCards.forEach(card => {
            this.tempCardsContainer.addChild(card.sprite);
            if (card.discardButton) this.tempCardsContainer.addChild(card.discardButton);
        });
        player.positionTempCards();
    }

    async gameEnded(scores: PlayerScore[]) {
        const container = this.resultsContainer;
    
        // Vertical spacing between lines
        const lineHeight = 30;
    
        scores.forEach((score, index) => {
            const playerName = new Text({
                text: `${score.name}: ${score.score}`,
                style: {
                    fill: '#ffffff',
                    fontSize: 18,
                    fontFamily: 'MyFont'
                }
            });
    
            playerName.y = index * lineHeight;
            playerName.anchor.set(0.5, 0.5);
    
            container.addChild(playerName);
        });
    
        container.x = this.app.screen.width / 2;
        container.y = this.app.screen.height / 2;
    }
    
}

export default UIManager;