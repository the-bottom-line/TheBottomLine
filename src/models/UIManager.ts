import { Container, Graphics, Text, Sprite, Assets, FillGradient, ColorMatrixFilter, Application, TextStyle } from 'pixi.js';
import { Input } from '@pixi/ui';
import { FancyButton } from './FancyButton.js';
import AssetCards from "./AssetCards.js";
import Asset from "./Asset.js";
import LiabilityCards from "./LiabilityCards.js";
import Player from './Player.js';
import type Character from './Characters.js';
import type {  Color, PlayerScore,MarketCard } from '@shared-types';
import PopUpManager from './UIManager/PopUpManager.js';
import HudManager from './UIManager/HudManager.js';
import GameState from './GameState.js';

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
    errorContainers: Container[] = [];
    
    /*statsText = new Text({
        text: '',
        style: {
            fill: '#ffffff',
            fontSize: 36,
            fontFamily: 'MyFont',
        }
    });*/
    
    constructor(app: Application) {
        this.app = app;

        //this.statsText.anchor.set(0.5);
        //this.statsText.position.set(this.app.screen.width / 2, 30);

        this._setupContainers();

        this.hudManager = new HudManager(this.app);
        this.popUpManager = new PopUpManager(this.app, this.popupContainer, this.hudManager);
    }

    async _setupContainers() {
        const sprites = new Container();
        let backgroundDisplay: any;
        try {
            const texture = await Assets.load('./miscellaneous/lobbybg.png');
            const bgSprite = new Sprite(texture);

            const texW = 1557;//size of the lobbybg image
            const texH = 1036;

            const scale = Math.max(
            this.app.screen.width / texW,
            this.app.screen.height / texH
            );

            bgSprite.scale.set(scale);

            bgSprite.position.set(
            (this.app.screen.width - bgSprite.width) / 2,
            (this.app.screen.height - bgSprite.height) / 3
            );

            backgroundDisplay = bgSprite;
        } catch (err) {
            console.error("Failed to find lobby Background image")
            backgroundDisplay = new Graphics().rect(0, 0, this.app.screen.width, this.app.screen.height).fill(this.getGradient());
        }

        this.app.stage.addChild(backgroundDisplay, sprites);

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
            //this.statsText,
            this.resultsContainer,
            this.marketContainer,
            this.purpleCardsContainer,
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
        this.purpleCardsContainer.visible = screenName == 'purpleCards'
        this.resultsContainer.visible = screenName === 'results';
        this.marketContainer.visible = screenName === 'main' || screenName === 'elseTurn';
    }
    
    createNameBox() {
        const inputBox = new Input({
            bg: new Graphics().roundRect(0, 0, 300, 80, 10).fill(0xD9D9D9),
            padding: [10, 10, 10, 10],
            textStyle: {
                fontSize: 32,
                fontWeight: 'bold',
                fill: '#878787'
            },
            placeholder: "Enter Name:",
        });
        inputBox.position.set(this.app.screen.width  / 2-150, this.app.screen.height / 2 -150);
        this.loginContainer.addChild(inputBox);
        return inputBox;
    }

    createChannelBox(){
        const inputBox = new Input({
            bg: new Graphics().roundRect(0, 0, 300, 80, 10).fill(0xD9D9D9),
            padding: [10, 10, 10, 10],
            textStyle: {
                fontSize: 32,
                fontWeight: 'bold',
                fill: '#878787'
            },
            placeholder: "Lobby Code:",
        });
        inputBox.position.set(this.app.screen.width / 2-150, this.app.screen.height / 2 -20);
        this.loginContainer.addChild(inputBox);
        return inputBox;
    }
    
    createJoinButton(onPressCallback: () => void) {
        const joinButton = new FancyButton({
            text: "Join",
            width: 300,
            height: 80,
            fontSize: 48,
            onPress: onPressCallback
        });
        
        joinButton.view.position.set(this.app.screen.width  / 2 - (joinButton.view.width / 2), this.app.screen.height / 2 + 100);

        this.loginContainer.addChild(joinButton.view);
    }
    
    displayGameName(container: Container){
        container.removeChildren();
        
        const titleText = new Text({
            text: 'The Bottom (on)Line',
            style: { fill: '#ffffff', fontSize: 56, fontFamily: 'MyFont' }
        });

        const bgText = new Graphics()
                .roundRect((this.app.screen.width / 2 - (titleText.width / 2))-25,75 ,  titleText.width + 50,  titleText.height + 50, 15)
                .fill({ color: 0x000000, alpha: 0.5 });


       titleText.position.set(this.app.screen.width / 2 - (titleText.width / 2), 100);
       container.addChild(bgText, titleText);
    }
    async displayLobbyPlayers(players: Player[], onStartGameCallback: () => void, channel?: string) {
        this.lobbyContainer.removeChildren();
        this.displayPlayerChoosingMessage(this.lobbyContainer,"The Bottom (on)Line")
        //this.displayGameName(this.lobbyContainer);


        let nameplateTexture;
        try {
            nameplateTexture = await Assets.load('./miscellaneous/nameplate.svg');
        } catch (err) {
            nameplateTexture = null;
        }//laad nameplate foto

        players.forEach((player, index) => {
            const y = this.app.screen.height /1.43 + index ;
            const x = this.app.screen.width / 4 + index * 155;

            if (nameplateTexture) {
                const icon = new Sprite(nameplateTexture);
                icon.anchor.set(0.5);
                icon.scale.set(0.6); 
                icon.x = x ;
                icon.y = y;
                icon.width = 120;
                icon.height = 180;
                this.lobbyContainer.addChild(icon);
            }

            const playerText = new Text({
                text: player.name,
                style: { fill: '#ffffff', fontSize: 32, fontFamily: 'MyFont' }
            });
            playerText.anchor.set(0.5);
            playerText.position.set(x, y - 120);
            this.lobbyContainer.addChild(playerText);
            
            const lobbycode = new Text({
                text: channel ? channel : player.playerID.toString(), // here
                style: { fill: '#ffffff', fontSize: 32, fontFamily: 'MyFont' }
            })
            lobbycode.anchor.set(0.5);
            lobbycode.position.set(x, y + 47);
            this.lobbyContainer.addChild(lobbycode);
        });

        this.createStartGameBox(onStartGameCallback);
    }

    createStartGameBox(onPressCallback: () => void) {
        const startGameButton = new FancyButton({
            text: "Start",
            width: 270,
            height: 80,
            fontSize: 48, // Added this line to make the font bigger
            onPress: onPressCallback,
        });
        startGameButton.view.position.set(this.app.screen.width - (startGameButton.view.width) - 50, this.app.screen.height - (this.app.screen.height / 7));
        this.lobbyContainer.addChild(startGameButton.view);
    }


    //-------------------------------------------------------------------------------------------------------------------

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

    //-----------------------------------------------------------------------------------------------------------------------

    async displayCharacterSelection(faceUpCharacters: Character[],openCharacters: Character[], onSelectCallback: (_: Character) => void,closedCharacter?: Character) {
        this.characterCardsContainer.removeChildren();
        const spacing = 100;
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
            faceUpCard.rotation = (Math.PI / -2) * 0.3+ (index * (Math.PI / (faceUpCharacters.length - 1)))* 0.3;
            faceUpCard.zIndex = index;

            
            faceUpCard.x = startX + index * spacing;
            const midIndex = (faceUpCharacters.length - 1) / 2;
            const distanceFromMid = Math.abs(index - midIndex);
            const maxDistance = midIndex;
            const yOffset = -Math.pow(distanceFromMid / maxDistance, 2) * -50; // Adjust for height difference at the sides
            faceUpCard.y = this.app.screen.height / 2 + yOffset;
            faceUpCard.on('mousedown', () => onSelectCallback(character)); 
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

    //-----------------------------------------------------------------------------------------------------------------------------------------

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

    displayPurpleCards(player: Player, marketState: MarketCard, minusIntoPlusCall: (color: Color) => void, confirmAssetAbilityCall: (color: number) => void,confirmColorChangeCall: (cardIndex: number, color: Color) => void, silverIntoGoldCall: (index: number) => void) {
        this.purpleCardsContainer.removeChildren();
        player.assetList.filter(card => card.ability)
        let cards = player.assetList.filter(card => card.ability);
        const title = new Text({
            text: 'End Game Abilities',
            style: { fill: '#ffffff', fontSize: 48, fontFamily: 'MyFont' }
        });
        title.anchor.set(0.5);
        title.position.set(this.app.screen.width /2, 100);
        this.purpleCardsContainer.addChild(title);

        const spacing = 250;
        const startX = (this.app.screen.width - ((cards.length - 1) * spacing)) / 2;
        const y = this.app.screen.height / 2;

        cards.forEach((card, index) => {
            if (card.sprite) {
                card.sprite.position.set(startX + index * spacing, y);
                this.purpleCardsContainer.addChild(card.sprite);
                if(card.title == "R&D Lab"){
                    card.sprite.interactive = true;
                    card.sprite.cursor = 'pointer';
                    card.sprite.on('mousedown', () => {
                        this.popUpManager.displayRnDPopup(marketState, minusIntoPlusCall, confirmAssetAbilityCall, player.assetList.indexOf(card));
                    });
                }
                else if( card.title == "Pilot Plant"){
                    card.sprite.interactive = true;
                    card.sprite.cursor = 'pointer';
                    card.sprite.on('mousedown', () => {
                        this.popUpManager.displayPilotPlantPopup(player,confirmColorChangeCall,confirmAssetAbilityCall, player.assetList.indexOf(card));
                    });
                }
                else if( card.title == "Application Lab"){
                    card.sprite.interactive = true;
                    card.sprite.cursor = 'pointer';
                    card.sprite.on('mousedown', () => {
                        this.popUpManager.displayApplicationLabPopup(player,silverIntoGoldCall,confirmAssetAbilityCall, player.assetList.indexOf(card));
                    });
                }

            }
        });

    }
    displayPlayerChoosingMessage(container: Container, message: string) {
        container.removeChildren(); // Clear previous content in the container

        const titleText = new Text({
            text: message,
            style: { fill: '#ffffff', fontSize: 56, fontFamily: 'MyFont' }
        });

        // Calculate background dimensions based on text and padding
        const padding = 25;
        const bg = new Graphics()
            .roundRect(
                (this.app.screen.width / 2 - (titleText.width / 2)) - padding,
                75, 
                titleText.width + (padding * 2),
                titleText.height + (padding * 2),
                15 
            )
            .fill({ color: 0x000000, alpha: 0.5 });

        titleText.position.set(this.app.screen.width / 2 - (titleText.width / 2), 100); 
        container.addChild(bg, titleText);
    }
    async createDummyPlayerWithPurpleCards(app: Application) {
            const player = new Player("Dummy", 1, app); // This line is causing the error
            const cardsData = [
                
                { title: "Application Lab", path: "assets/applicationLab_4-2.webp",ability: "Application" },
                { title: "Pilot Plant", path: "assets/pilotPlant_5-1.webp",ability: "Pilot" },
                { title: "R&D Lab", path: "assets/rndLab_3-3.webp",ability: "R&D" },
                { title: "Water Treatment", path: "assets/waterTreatment_2-2.webp",ability: '' }
            ];
    
            for (const data of cardsData) {
                const card = new Asset(data.title, "Purple", 0, 0, data.ability, data.path);
                const texture = await Assets.load(card.texturePath);
                card.sprite = new Sprite(texture);
                card.sprite.scale.set(0.25);
                card.sprite.anchor.set(0.5);
                player.assetList.push(card);
            }
            return player;
        }
    async debugPurpleCards(marketState: MarketCard, minusIntoPlusCall: (color: Color) => void, confirmAssetAbilityCall: (index: number) => void, confirmColorChangeCall: (cardIndex: number, color: Color) => void, silverIntoGoldCall: (index: number) => void) {
        let player = await this.createDummyPlayerWithPurpleCards(this.app);

        this.displayPurpleCards(player, marketState, minusIntoPlusCall,confirmAssetAbilityCall, confirmColorChangeCall,silverIntoGoldCall);
        this.showScreen('purpleCards');
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