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
        this.popupContainer = new Container();

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

       

        this._setupContainers();
    }

    _setupContainers() {
        const sprites = new Container();
        const backGroundGradient = new Graphics().rect(0, 0, window.innerWidth, window.innerHeight).fill(this.getGradient());

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

    displayAllPlayerStats(players, container, currentPlayer) { // here
        
        players.forEach(async (player, playerIndex) => {
            const texture = await Assets.load(player.reveal ? player.character.iconPath : "./miscellaneous/noneCharacter.png");
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

        assets.forEach(card => {
            this.playedCardsContainer.addChild(card.sprite);
        });
        liabilities.forEach(card => {
            this.playedCardsContainer.addChild(card.sprite);
        });
    }
    async displayPlayerCharacter(player, container, onIconClick) { // here
        if (!player?.character) return;

        const tempContainer = new Container();
        container.addChild(tempContainer);

        const texture = await Assets.load(player.character.iconPath);
        const characterIcon = new Sprite(texture);
        if (onIconClick) {
            characterIcon.interactive = true;
            characterIcon.cursor = 'pointer';
            characterIcon.on('mousedown', () => onIconClick(player.character));
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
        tempContainer.position.set((tempContainer.width / 2) + 50, window.innerHeight - 80);
    }

    async anounceCharacter(container, player) {
        const tempContainer = this._createPopupBase();
        let x = window.innerWidth / 2;
        let y = window.innerHeight / 2-120;

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
            text: player.character.name,
            style: { fill: '#ffffff', fontSize: 18, fontFamily: 'MyFont' }
        });
        characterText.anchor.set(0, 0.5);
        characterText.position.set(x-140, y);
        const playerText = new Text({
            text: player.name,
            style: { fill: '#CBC28E', fontSize: 18, fontFamily: 'MyFont' }
        });
        playerText.anchor.set(0, 0.5);
        playerText.position.set(x-140, y+20);

        texture = await Assets.load(player.character.iconPath);
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
        tempContainer.addChild(playerText);
        tempContainer.addChild(characterIcon);

        this._addPopupCloseButton(tempContainer);
        
        container.addChild(tempContainer);
    }

    async StakeholdersPerk(container, characters, onSelectCallback) {
        const tempContainer = this._createPopupBase();
        let x = window.innerWidth / 2;
        let y = window.innerHeight / 2-300;

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

        return tempContainer;
    }

    async firedCharacter(character, localPlayer) {
        const tempContainer = this._createPopupBase();
        let x = window.innerWidth / 2;
        let y = window.innerHeight / 2-120;

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

        this.elseTurnContainer.addChild(tempContainer);
    }

    async youCharacterAbility(character, perk) {
        const tempContainer = this._createPopupBase();
        let x = window.innerWidth / 2;
        let y = window.innerHeight / 2-50;

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

        this.mainContainer.addChild(tempContainer);
    }
    async youAreDivesting(container, divestmentTargets,onSelectCallback){
        
        const tempContainer = this._createPopupBase();
        let x = window.innerWidth / 2;
        let y = window.innerHeight / 2-250;



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
        let startX = window.innerWidth / 2 - (columnWidth * playerCount) / 2;
        
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

        container.addChild(tempContainer);

        return tempContainer;
    }
    
    async youRegulatorOptions(container,options,perk,gameState,onSelectCallback){
        const tempContainer = this._createPopupBase();
        let x = window.innerWidth / 2;
        let y = window.innerHeight / 2-250;

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
        let startX = window.innerWidth / 2 - (columnWidth * playerCount) / 2;

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
            cardBack.on('mousedown', () => onSelectCallback(player.playerID));
               
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
            cardBack.on('mousedown', () => onSelectCallback(player.playerID));
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
        orText.position.set(window.innerWidth/2, 600);
        tempContainer.addChild(orText);

        const deckButton = new FancyButton({
            text: "TRADE WITH DECK",
            width: 250,
            height: 60,
            
        });
        deckButton.view.position.set((window.innerWidth-deckButton.view.width)/2, 650);
        tempContainer.addChild(deckButton.view);



        this._addPopupCloseButton(tempContainer, () => {
            // Example of how to trigger an action. Here, just closing.
            // onSelectCallback(null); // Or some default action
        });

        container.addChild(tempContainer);
    }

    
    _createPopupBase() {
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

    _addPopupCloseButton(popupContainer, onOkCallback) {
        const okButton = new FancyButton({
            text: "OK",
            width: 200,
            height: 60,
            onPress: () => {
                if (onOkCallback) {
                    onOkCallback();
                } else if (popupContainer.parent) {
                    popupContainer.parent.removeChild(popupContainer);
                }
            }
        });
        okButton.view.position.set(this.app.screen.width / 2 - (okButton.view.width / 2), this.app.screen.height - 100);
        popupContainer.addChild(okButton.view);
    }
}

export default UIManager;