import { Container, Graphics, Text, Sprite, Assets, FillGradient, ColorMatrixFilter, Application, TextStyle } from 'pixi.js';
import { Input } from '@pixi/ui';
import { FancyButton } from './FancyButton.js';
import AssetCards from "./AssetCards.js";
import LiabilityCards from "./LiabilityCards.js";
import type Player from './Player.js';
import type Character from './Characters.js';
import type Liability from './Liability.js';
import type Asset from './Asset.js';
import type { Market, PlayerId, PlayerScore, RegulatorSwapPlayer } from '@shared-types';
import type GameState from './GameState.js';

class UIManager {
    app: Application;
    
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

        this._setupContainers();
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
            this.popupContainer
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

    createNextTurnButton(onPressCallback: () => void) {
        const nextButton = new FancyButton({
            text: "End Turn",
            width: 200,
            height: 60,
            onPress: onPressCallback
        });
        nextButton.view.position.set(this.app.screen.width - 150 - (nextButton.view.width / 2), this.app.screen.height - 100);
        this.mainContainer.addChild(nextButton.view);
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


    // TODO: make closedCharacter not list
    displayCharacterSelection(faceUpCharacters: Character[],openCharacters: Character[], onSelectCallback: (_: Character) => void,closedCharacter: Character[]) {
        this.characterCardsContainer.removeChildren();
        const spacing = 200;
        const startX = (this.app.screen.width - ((faceUpCharacters.length - 1) * spacing)) / 2;
        const grayscaleFilter = new ColorMatrixFilter();
        grayscaleFilter.grayscale(0.2, true);

        if(closedCharacter != null){
            closedCharacter.forEach(async (character: Character) =>{
                let texture = await Assets.load(character.texturePath);
                let closedCard = new Sprite(texture);
                closedCard.interactive = true;
                closedCard.scale.set(0.3);
                closedCard.anchor.set(0.5);
                closedCard.x = this.app.screen.width / 2;
                closedCard.y = this.app.screen.height / 2-300;

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

    displayAllPlayerStats(players: Player[], container: Container, currentPlayer: Player) { // here
        
        players.forEach(async (player, playerIndex) => {
            const texture = await Assets.load(player.reveal && player.character ? player.character.iconPath : "./miscellaneous/noneCharacter.png");
            const characterIcon = new Sprite(texture);
            const x = 30 + playerIndex * 70;
            characterIcon.position.set(x, 30);
            characterIcon.width = 50;
            characterIcon.height = 55.7;
            characterIcon.anchor.set(0.5);
            container.addChild(characterIcon);


            if (player === currentPlayer) {
                const outline = new Graphics()
                    .circle(0, 0, 27)
                    .stroke({ width: 5, color: 0xCBC28E });
                outline.position.set(x,32.5);
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


            let colors = ["blue","green","purple","red","yellow"];

            colors.forEach((color, index) =>{
                 const type = new Graphics()
                    .roundRect(x - 30, 80 + index * 30, 20, 20)
                    .fill(color);
                container.addChild(type);

                const assetsOfColor = player.assetList.filter(asset => asset.color.toLowerCase() === color);
                const totalGold = assetsOfColor.reduce((sum, asset) => sum + asset.gold, 0);
                const totalSilver = assetsOfColor.reduce((sum, asset) => sum + asset.silver, 0);

                const gold = new Graphics()
                    .roundRect(x - 10, 80 + index * 30+2.5, 15, 15)
                    .fill("gold");
                container.addChild(gold);

                const playerGold = new Text({
                        text: totalGold.toString(),
                        style: { fill: '#000000ff', fontSize: 12, fontFamily: 'MyFont' }
                    });
                playerGold.anchor.set(0.5);
                playerGold.position.set(x-10+7.5, 80 + index * 30+10);
                container.addChild(playerGold);

                const silver = new Graphics()
                    .roundRect(x + 5, 80 + index * 30+2.5, 15, 15)
                    .fill("silver")
                container.addChild(silver);

                const playersilver = new Text({
                        text: totalSilver.toString(),
                        style: { fill: '#000000ff', fontSize: 12, fontFamily: 'MyFont' }
                    });
                playersilver.anchor.set(0.5);
                playersilver.position.set(x + 5 + 7.5, 80 + index * 30+10);
                container.addChild(playersilver);

            });
            
            /*player.assetList.forEach((card, cardIndex) => {
                const rect = new Graphics()
                    .roundRect(x - 20, 80 + cardIndex * 30, 20, 20, 50)
                    .fill(card.color);
                container.addChild(rect);
            });*/
        });
    }

async displayRevealedCharacters(players: Player[], container: Container) {

        const sortedPlayerList = [...players].sort((a, b) => {
            const aIsRevealed = a.reveal && a.character;
            const bIsRevealed = b.reveal && b.character;

            // TODO: make fix where ts compiler understands _IsRevealed variables
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

    async displayOtherPlayerHand(assets: Asset[], liabilities: Liability[]) {        
        // Remove all previous card backs to prevent ghost cards
        // TODO: fix custom property error or use different way to solve ghosting error
        // const oldCardBacks = this.elseTurnContainer.children.filter(child => child.isCardBack);
        // oldCardBacks.forEach(child => this.elseTurnContainer.removeChild(child));

        const baseY = this.app.screen.height - 100;
        const spacing = 60;
        
        const totalAssetsWidth = (assets.length - 1) * spacing;
        const assetsStartX = this.app.screen.width / 2 - totalAssetsWidth - 100;
        const assetBackTexture = await Assets.load("./assets/asset_back.webp");
    
        for (let i = 0; i < assets.length; i++) {
            const cardBack = new Sprite(assetBackTexture);
            cardBack.scale.set(0.25);
            cardBack.anchor.set(0.5);
            // cardBack.isCardBack = true; // Custom property to identify these sprites
            cardBack.x = assetsStartX + i * spacing;
            cardBack.y = baseY;
            this.elseTurnContainer.addChild(cardBack);
        }
    
        const totalLiabilitiesWidth = (liabilities.length > 0 ? liabilities.length - 1 : 0) * spacing;
        const liabilitiesStartX = this.app.screen.width / 2 + 100 + totalLiabilitiesWidth;
        const liabilityBackTexture = await Assets.load("liabilities/liability_back.webp");
    
        for (let i = 0; i < liabilities.length; i++) {
            const cardBack = new Sprite(liabilityBackTexture);
            cardBack.scale.set(0.25);
            cardBack.anchor.set(0.5);
            // cardBack.isCardBack = true; // Custom property to identify these sprites
            cardBack.x = liabilitiesStartX - i * spacing;
            cardBack.y = baseY;
            this.elseTurnContainer.addChild(cardBack);
        }
    }
    async displayPlayerPlayedCards(assets: Asset[], liabilities: Liability[]){
        this.playedCardsContainer.removeChildren();
        const texture = await Assets.load('./miscellaneous/cardBackdrop.svg');
        const cardBackdrop = Sprite.from(texture);
        cardBackdrop.width = 250;
        cardBackdrop.height = 250;
        cardBackdrop.anchor.set(0.5);
        cardBackdrop.position.set(this.app.screen.width / 2, this.app.screen.height / 2 - 10);
        
        this.playedCardsContainer.addChild(cardBackdrop);

        assets.forEach(card => {
            this.addCardToPlayedContainer(card);
        });
        liabilities.forEach(card => {
            this.addCardToPlayedContainer(card);
        });
    }


    async displayPlayerCharacter(player: Player, container: Container, onIconClick?: (_: Character) => void) { // here
        if (!player?.character) return;

        const tempContainer = new Container();
        container.addChild(tempContainer);

        const texture = await Assets.load(player.character.iconPath);
        const characterIcon = new Sprite(texture);
        if (onIconClick) {
            characterIcon.interactive = true;
            characterIcon.cursor = 'pointer';
            // TODO: verify that players either always have a character when this happens, or that
            // it's okay if this doesn't happen if the player does not have a character
            characterIcon.on('mousedown', () => {
                if (player.character) onIconClick(player.character)
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

    async anounceCharacter(container: Container, player: Player) {
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

        // TODO: verify that it's correct that this does not show at all if the player does not have
        // a character for whatever reason
        if (player.character) {
            const characterText = new Text({
                text: player.character?.name || '',
                style: { fill: '#ffffff', fontSize: 18, fontFamily: 'MyFont' }
            });
            characterText.anchor.set(0, 0.5);
            characterText.position.set(x-140, y);
            
            texture = await Assets.load(player.character.iconPath);
            const characterIcon = new Sprite(texture);
            characterIcon.position.set(x-200, y);
            characterIcon.width = 80;
            characterIcon.height = 90;
            characterIcon.anchor.set(0.5);
            
            tempContainer.addChild(characterText);
            tempContainer.addChild(characterIcon);
        }
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

        this._addPopupCloseButton(tempContainer);
        
        this.popupContainer.addChild(tempContainer);
    }

    async StakeholdersPerk(container: Container, characters: Character[], onSelectCallback: (_: Character) => void) {
        const tempContainer = this._createPopupBase();
        let x = this.app.screen.width / 2;
        let y = this.app.screen.height / 2-300;

        let texture = await Assets.load("./miscellaneous/ShareholderIcon.png"); // here
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
    

        container.addChild(tempContainer);
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
        let x = this.app.screen.width / 2;
        let y = this.app.screen.height / 2-50;

        let texture = await Assets.load(character.iconPath);
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
    async youAreDivesting(container: Container, divestmentTargets: any[] ,onSelectCallback: (playerID: number, cardIndex: number) => void) {
        
        const tempContainer = this._createPopupBase();
        let x = this.app.screen.width / 2;
        let y = this.app.screen.height / 2-250;



        let texture = await Assets.load("./miscellaneous/StakeholderIcon.png"); // here
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

            let playerX = startX + columnWidth / 2;
            let playerY = 450; 

            let name = new Text({
                text: target.player.name,
                style:{fill:"#fff",fontSize:18,fontFamily:"MyFont"}
            });
            name.anchor.set(0.5);
            name.position.set(playerX, playerY);
            tempContainer.addChild(name);

            playerY += 30;

            let totalWidth = target.assets.length * cardWidth + (target.assets.length - 1) * cardSpacing;
            let cardStartX = playerX - totalWidth / 2;

            for(const card of target.assets){
                let tex = await Assets.load(card.asset.texturePath);
                let sprite = new Sprite(tex);
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
    
    async youRegulatorOptions(container: Container, options: RegulatorSwapPlayer[], perk: string, gameState: GameState, onSelectCallback1: (id: PlayerId) => void, onSelectCallback2: (card_idxs: number[]) => void){
        const tempContainer = this._createPopupBase();
        let x = this.app.screen.width / 2;
        let y = this.app.screen.height / 2-250;

        let texture = await Assets.load("./miscellaneous/RegulatorIcon.png"); // here
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

            let playerX = startX + columnWidth / 2;
            let playerY = y + 50;

            const name = new Text({
                text: player.name,
                style: { fill: "#fff", fontSize: 18, fontFamily: "MyFont" }
            });
            name.anchor.set(0.5);
            name.position.set(playerX, playerY);
            tempContainer.addChild(name);
            
            playerY += 30;

            let assetStartX = playerX - (cardWidth / 2) - (cardSpacing / 2);
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

            
            let liabilityStartX = playerX + (cardWidth / 2) + (cardSpacing / 2);
           
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
                container.removeChild(tempContainer);   
                this.displaySwapWithDeckPopup(container, gameState.getLocalPlayer()!, (card_idxs) => {
                    onSelectCallback2(card_idxs); 
                });
            }
        }); 
        deckButton.view.position.set((this.app.screen.width-deckButton.view.width)/2, 650);
        tempContainer.addChild(deckButton.view);



        this._addPopupCloseButton(tempContainer);

        this.popupContainer.addChild(tempContainer);
    }

    async displaySwapWithDeckPopup(container: Container, player: Player, onConfirmCallback: (card_idxs: number[]) => void) {
        const tempContainer = this._createPopupBase();
        let x = this.app.screen.width / 2;
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
        let startX = x - totalWidth / 2 + cardWidth / 2;

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

    async displayRegulatorSwapNotification(container: Container, regulatorPlayer: Player) {
        const tempContainer = this._createPopupBase();
        let x = this.app.screen.width / 2;
        let y = this.app.screen.height / 2 - 150;

        // Regulator Icon
        let texture = await Assets.load("./miscellaneous/RegulatorIcon.png");
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

        const padding = 20;
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

        tempContainer.addChild(darkenBackground);
        return tempContainer;
    }

    _addPopupCloseButton(popupContainer: Container, onOkCallback?: () => void) {
        const okButton = new FancyButton({
            text: "OK",
            width: 200,
            height: 60,
            onPress: () => {
                // Always remove the popup from its parent container
                if (popupContainer.parent) {
                    popupContainer.parent.removeChild(popupContainer);
                }
                if (onOkCallback) {
                    onOkCallback();
                }
            }
        });
        okButton.view.position.set(this.app.screen.width / 2 - (okButton.view.width / 2), this.app.screen.height - 100);
        popupContainer.addChild(okButton.view);
    }
    showMarket(marketData: Market){
        if (!marketData) {
            return;
        }
        
        this.marketContainer.removeChildren();
        
        const width = 320;
        const height = 120;
        const x = (this.app.screen.width - width) / 2;
        const y = 10; // A little padding from the top

        const background = new Graphics()
            .roundRect(0, 0, width, height, 15)
            .fill(0x61594C); // Dark Indigo
        this.marketContainer.position.set(x, y);
        this.marketContainer.addChild(background);

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
        let startX = (width - totalCircleWidth) / 2;

        colors.forEach((colorInfo, index) => {
            const circleX = startX + index * spacing;
            const circle = new Graphics()
                .circle(0, 0, circleRadius)
                .fill(colorInfo.name.toLowerCase())
                .stroke({ width: 2, color: 0x000000 });
            circle.position.set(circleX, circleY); // here
            this.marketContainer.addChild(circle);

            const statusIndicator = new Text({
                text: '',
                style: { 
                    fill: '#000000ff', 
                    fontSize: 30, 
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
            this.marketContainer.addChild(statusIndicator);
        });

        // Separator lines
        const horizontalLine = new Graphics()
            .moveTo(10, height / 2)
            .lineTo(width - 10, height / 2)
            .stroke({ width: 2, color: 0x000000 });
        this.marketContainer.addChild(horizontalLine);

        const verticalLine = new Graphics()
            .moveTo(width / 2, height / 2 + 5)
            .lineTo(width / 2, height - 5)
            .stroke({ width: 2, color: 0x000000 });
        this.marketContainer.addChild(verticalLine);

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
        this.marketContainer.addChild(rfrText);

        const mrpText = new Text({ text: `MRP + ${marketData.mrp}%`, style: textStyle });
        mrpText.anchor.set(0.5);
        mrpText.position.set(width * (2 / 3) + 20, height * 0.75);
        this.marketContainer.addChild(mrpText);
    }

    addCardToPlayedContainer(card: Asset | Liability) {
        card.sprite.zIndex = this._nextPlayedCardZIndex++;
        this.playedCardsContainer.addChild(card.sprite);
    }
}

export default UIManager;