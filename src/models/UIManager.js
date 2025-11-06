import { Container, Graphics, Text, Sprite, Assets, FillGradient, ColorMatrixFilter } from 'pixi.js';
import { Input } from '@pixi/ui';
import { FancyButton } from './FancyButton.js';
import AssetCards from "./AssetCards.js";
import LiabilityCards from "./LiabilityCards.js";

class UIManager {
    constructor(app) {
        this.app = app;

        this.loginContainer = new Container();
        this.lobbyContainer = new Container();
        this.mainContainer = new Container();
        this.pickingContainer = new Container();
        this.characterContainer = new Container();
        this.characterOpenContainer = new Container();
        this.characterCardsContainer = new Container();
        this.decksContainer = new Container();
        this.playedCardsContainer = new Container();
        this.tempCardsContainer = new Container();
        this.handContainer = new Container();
        this.elseTurnContainer = new Container();

        this.statsText = new Text({
            text: '',
            style: {
                fill: '#ffffff',
                fontSize: 36,
                fontFamily: 'MyFont',
            }
        });
        this.statsText.anchor.set(0.5);
        this.statsText.position.set(window.innerWidth / 2, 30);

        this.draftOverlay = new Graphics()
            .rect(0, 0, this.app.screen.width, this.app.screen.height)
            .fill({ color: 0x000000, alpha: 0.7 });
        this.draftOverlay.visible = false;

        this._setupContainers();
    }

    _setupContainers() {
        const sprites = new Container();
        const backGroundGradient = new Graphics().rect(0, 0, window.innerWidth, window.innerHeight).fill(this.getGradient());

        this.app.stage.addChild(backGroundGradient, sprites);

        this.characterContainer.addChild(this.characterCardsContainer);
        this.mainContainer.addChild(this.handContainer, this.playedCardsContainer);
        this.pickingContainer.addChild(this.decksContainer, this.tempCardsContainer);
        this.characterContainer.addChildAt(this.draftOverlay, 0);
        this.elseTurnContainer.addChild(this.playedCardsContainer);

        sprites.addChild(
            this.loginContainer,
            this.characterContainer,
            this.pickingContainer,
            this.mainContainer,
            this.elseTurnContainer,
            this.lobbyContainer,
            this.statsText
        );

        this.handContainer.sortableChildren = true;
        this.tempCardsContainer.sortableChildren = true;
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

    showScreen(screenName) {
        this.loginContainer.visible = screenName === 'login';
        this.lobbyContainer.visible = screenName === 'lobby';
        this.characterContainer.visible = screenName === 'character';
        this.mainContainer.visible = screenName === 'main';
        this.pickingContainer.visible = screenName === 'picking';
        this.elseTurnContainer.visible = screenName === 'elseTurn';
        this.draftOverlay.visible = screenName === 'character';

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
        inputBox.position.set(window.innerWidth / 2-150, window.innerHeight / 2 -100);
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
        inputBox.position.set(window.innerWidth / 2-150, window.innerHeight / 2 +30);
        this.loginContainer.addChild(inputBox);
        return inputBox;
    }
    createJoinButton(onPressCallback) {
        const joinButton = new FancyButton({
            text: "Join",
            width: 200,
            height: 60,
            onPress: onPressCallback
        });

        joinButton.view.position.set(window.innerWidth / 2 - (joinButton.view.width / 2), window.innerHeight - 100);

        this.loginContainer.addChild(joinButton.view);
    }
    displayGameName(container){
        this.loginContainer.removeChildren();
        const titleText = new Text({
            text: 'The Bottom (on)Line',
            style: { fill: '#ffffff', fontSize: 56, fontFamily: 'MyFont' }
        });
        titleText.anchor.set(0.5,0);
        titleText.position.set(window.innerWidth / 2, 20);
        container.addChild(titleText);
    }
    displayLobbyPlayers(players, onStartGameCallback) {
        this.lobbyContainer.removeChildren();
        this.displayGameName(this.lobbyContainer);

        players.forEach((player, index) => {
            const playerText = new Text({
                text: player.name,
                style: { fill: '#ffffff', fontSize: 32, fontFamily: 'MyFont' }
            });
            playerText.anchor.set(0.5);
            playerText.position.set(window.innerWidth / 2, 180 + index * 40);
            this.lobbyContainer.addChild(playerText);
        });
        this.createStartGameBox(onStartGameCallback);
    }

    createStartGameBox(onPressCallback) {
        const startGameButton = new FancyButton({
            text: "Start",
            width: 200,
            height: 60,
            onPress: onPressCallback
        });
        startGameButton.view.position.set(window.innerWidth / 2 - (startGameButton.view.width / 2), window.innerHeight - 100);
        this.lobbyContainer.addChild(startGameButton.view);
    }

    createNextTurnButton(onPressCallback) {
        const nextButton = new FancyButton({
            text: "End Turn",
            width: 200,
            height: 60,
            onPress: onPressCallback
        });
        nextButton.view.position.set(window.innerWidth - 150 - (nextButton.view.width / 2), window.innerHeight - 100);
        this.mainContainer.addChild(nextButton.view);
    }

    async createAssetDeck(onPressCallback) {
        const assetDeck = new AssetCards();
        const assetDeckSprite = await assetDeck.initializeDeckSprite();
        assetDeck.setDeckPosition(window.innerWidth / 2 - 150, 70);
        assetDeckSprite.on('mousedown', onPressCallback);
        this.decksContainer.addChild(assetDeckSprite);
    }

    async createLiabilityDeck(onPressCallback) {
        const liabilityDeck = new LiabilityCards();
        const liabilityDeckSprite = await liabilityDeck.initializeDeckSprite();
        liabilityDeck.setDeckPosition(window.innerWidth / 2 + 150, 70);
        liabilityDeckSprite.on('mousedown', onPressCallback);
        this.decksContainer.addChild(liabilityDeckSprite);
    }


    displayCharacterSelection(faceUpCharacters,openCharacters, onSelectCallback,closedCharacter) {
        this.characterCardsContainer.removeChildren();
        const spacing = 200;
        const startX = (window.innerWidth - ((faceUpCharacters.length - 1) * spacing)) / 2;
        const grayscaleFilter = new ColorMatrixFilter();
        grayscaleFilter.grayscale(0.2, true);

        if(closedCharacter != null){
            closedCharacter.forEach(async character=>{
                let texture = await Assets.load(character.texturePath);
                let closedCard = new Sprite(texture);
                closedCard.interactive = true;
                closedCard.scale.set(0.3);
                closedCard.anchor.set(0.5);
                closedCard.x = window.innerWidth / 2;
                closedCard.y = window.innerHeight / 2-300;

                this.characterCardsContainer.addChild(closedCard);
            });
        }
        
            
            

        faceUpCharacters.forEach(async (character, index) => {
            const texture = await Assets.load(character.texturePath);
            const faceUpCard = new Sprite(texture);
            faceUpCard.interactive = true;
            faceUpCard.scale.set(0.3);
            faceUpCard.anchor.set(0.5);
            
            faceUpCard.x = startX + index * spacing;
            faceUpCard.y = window.innerHeight / 2;
            faceUpCard.on('mousedown', () => onSelectCallback(character)); // here
            this.characterCardsContainer.addChild(faceUpCard);
            
        });

       
        const openX = (window.innerWidth - ((openCharacters.length - 1) * spacing)) / 2;
        openCharacters.forEach(async (character, index) =>{
            console.log(character.name);
            const texture = await Assets.load(character.texturePath);
            const openCard = new Sprite(texture);
            openCard.interactive = true;
            openCard.scale.set(0.3);
            openCard.anchor.set(0.5);
            openCard.filters = [grayscaleFilter];
            openCard.x = openX + index * spacing;
            openCard.y = window.innerHeight / 2 + 300;
            this.characterCardsContainer.addChild(openCard);
        });
    }

    displayAllPlayerStats(players, container, currentPlayer) {
        
        players.forEach(async (player, playerIndex) => {
            const texture = await Assets.load(player.reveal ? player.character.iconPath : "./miscellaneous/noneCharacter.png");
            const characterIcon = new Sprite(texture);
            const x = 30 + playerIndex * 60;
            characterIcon.position.set(x, 30);
            characterIcon.width = 50;
            characterIcon.height = 55.7;
            characterIcon.anchor.set(0.5);
            container.addChild(characterIcon);

            //289

            if (player === currentPlayer) {
                const outline = new Graphics()
                    .circle(0, 0, 27)
                    .stroke({ width: 5, color: 0xCBC28E });
                outline.position.set(x,32.5);
                container.addChild(outline);
                container.addChild(characterIcon); // ensure icon is on top of outline
            }


            player.assetList.forEach((card, cardIndex) => {
                const rect = new Graphics()
                    .roundRect(x - 20, 60 + cardIndex * 30, 20, 20, 50)
                    .fill(card.color);
                container.addChild(rect);
            });
        });
    }

async displayRevealedCharacters(players, container) {

        const sortedPlayerList = [...players].sort((a, b) => {
            const aIsRevealed = a.reveal && a.character;
            const bIsRevealed = b.reveal && b.character;

            if (aIsRevealed && bIsRevealed) {
               
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
            characterCard.x = window.innerWidth - 100;
            characterCard.y = y;
            characterCard.scale.set(0.15);
            characterCard.anchor.set(0.5);
            characterCard.rotation = 90 * Math.PI / 180;
            container.addChild(characterCard);

            index++;
        }
    }

    displayTempCards(player) {
        this.tempCardsContainer.removeChildren();
        const tempCards = player.hand.filter(c => c.isTemporary);

        const cardWidth = 590 * 0.25;
        const cardHeight = 940 * 0.25;
        const spacing = 180;
        const startX = (window.innerWidth - (player.drawableCards * spacing)) / 2 + spacing / 2;
        const y = window.innerHeight / 2;

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

    async displayOtherPlayerHand(assets, liabilities) {        
        const baseY = window.innerHeight - 100;
        const spacing = 60;
    
        // Hide all cards first
        this.elseTurnContainer.children.forEach(child => {
            if (child.isCardBack) child.visible = false;
        });
    
        const totalAssetsWidth = (assets.length - 1) * spacing;
        const assetsStartX = window.innerWidth / 2 - totalAssetsWidth - 100;
        const assetBackTexture = await Assets.load("./assets/asset_back.webp");
    
        for (let i = 0; i < assets.length; i++) {
            let cardBack = this.elseTurnContainer.children.find(c => c.isCardBack && c.cardType === 'Asset' && !c.visible);
            if (!cardBack) {
                cardBack = new Sprite(assetBackTexture);
                cardBack.scale.set(0.25);
                cardBack.anchor.set(0.5);
                cardBack.isCardBack = true;
                cardBack.cardType = 'Asset';
                this.elseTurnContainer.addChild(cardBack);
            }
            cardBack.visible = true;
            cardBack.x = assetsStartX + i * spacing;
            cardBack.y = baseY;
        }
    
        const totalLiabilitiesWidth = (liabilities.length > 0 ? liabilities.length - 1 : 0) * spacing;
        const liabilitiesStartX = window.innerWidth / 2 + 100 + totalLiabilitiesWidth;
        const liabilityBackTexture = await Assets.load("liabilities/liability_back.webp");
    
        for (let i = 0; i < liabilities.length; i++) {
            let cardBack = this.elseTurnContainer.children.find(c => c.isCardBack && c.cardType === 'Liability' && !c.visible);
            if (!cardBack) {
                cardBack = new Sprite(liabilityBackTexture);
                cardBack.scale.set(0.25);
                cardBack.anchor.set(0.5);
                cardBack.isCardBack = true;
                cardBack.cardType = 'Liability';
                this.elseTurnContainer.addChild(cardBack);
            }
            cardBack.visible = true;
            cardBack.x = liabilitiesStartX - i * spacing;
            cardBack.y = baseY;
        }
        
        
        
    }
    async displayPlayerPlayedCards(assets, liabilities){
        this.playedCardsContainer.removeChildren();
        const texture = await Assets.load('./miscellaneous/cardBackdrop.svg');
        const cardBackdrop = Sprite.from(texture);
        cardBackdrop.width = 250;
        cardBackdrop.height = 250;
        cardBackdrop.anchor.set(0.5);
        cardBackdrop.position.set(window.innerWidth / 2, window.innerHeight / 2 - 10);
        
        this.playedCardsContainer.addChild(cardBackdrop);
        
        assets.forEach(card =>{
            this.playedCardsContainer.addChild(card.sprite);
        });
        liabilities.forEach(card =>{
            this.playedCardsContainer.addChild(card.sprite);
        });
    }
    async displayPlayerCharacter(player,container) {
        if (!player?.character) return;

        const tempContainer = new Container();
        container.addChild(tempContainer);

        const texture = await Assets.load(player.character.iconPath);
        const characterIcon = new Sprite(texture);
        characterIcon.scale.set(0.25);
        characterIcon.anchor.set(0.5, 1);
        tempContainer.addChild(characterIcon);

        const nameText = new Text({
            text: player.character.name,
            style: {
                fill: '#f2e8d5', // Parchment
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
        tempContainer.position.set((tempContainer.width / 2) + 50, window.innerHeight - 80);
    }
    
}

export default UIManager;