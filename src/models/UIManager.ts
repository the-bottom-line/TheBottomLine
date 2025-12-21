import { Container, Graphics, Text, Sprite, Assets, FillGradient, ColorMatrixFilter, Application } from 'pixi.js';
import { Input } from '@pixi/ui';
import { FancyButton } from './FancyButton.js';
import Asset from "./Asset.js";
import Player from './Player.js';
import type Character from './Characters.js';
import type {  Color, PlayerScore,MarketCard } from '@shared-types';
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
    errorContainers: Container[] = [];
    
    
    constructor(app: Application) {
        this.app = app;

        this._setupContainers();

        this.hudManager = new HudManager(this.app);
        this.popUpManager = new PopUpManager(this.app, this.popupContainer, this.hudManager);
    }

    async _setupContainers() {
        const sprites = new Container();
        let backgroundDisplay: Sprite | Graphics;
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

        const titleText = new Text({
            text: "The Bottom (on)Line",
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
        this.lobbyContainer.addChild(bg, titleText);
        


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
                text: channel ? channel : player.playerID.toString(),
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

    async displayCharacterSelection(openCharacters: Character[], onSelectCallback: (_: Character) => void,faceUpCharacters?: Character[],closedCharacter?: Character,player?:Player) {
        this.characterCardsContainer.removeChildren();
        const spacing = 100;

        if (closedCharacter != null) {
            await this.popUpManager.characterPopups.announceClosedCharacter(closedCharacter);
        }
        if(!faceUpCharacters && player){
            this.displayPlayerChoosingMessage(this.characterCardsContainer, `${player.name} is choosing their character`);
        }
        if(faceUpCharacters){
            const startX = (this.app.screen.width - ((faceUpCharacters.length - 1) * spacing)) / 2;
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
            const yOffset = -Math.pow(distanceFromMid / maxDistance, 2) * -50;
            faceUpCard.y = this.app.screen.height / 2 + yOffset;
            faceUpCard.on('mousedown', () => onSelectCallback(character)); 
            this.characterCardsContainer.addChild(faceUpCard);
            
        });
        }
        
        

        if (openCharacters && openCharacters.length > 0) {
            let spacing = 150;

            openCharacters.forEach(async (character, index) =>{                
                const texture = await Assets.load(character.texturePath);
                const openCard = new Sprite(texture);
                openCard.interactive = false;
                openCard.scale.set(0.2);
                openCard.anchor.set(0.5);
                openCard.x = this.app.screen.width / 2 - 75 + index * spacing;
                openCard.y = this.app.screen.height / 2 - 300;
                this.characterCardsContainer.addChild(openCard);
            });

            const infoText = new Text({
                text: "These characters are not available this round",
                style: { fill: '#ffffff', fontSize: 18, fontFamily: 'MyFont', align: 'center' }
            });
            infoText.anchor.set(0.5);
            infoText.position.set(this.app.screen.width / 2, this.app.screen.height / 2 -190);

            const infoBackground = new Graphics()
                .roundRect(
                    this.app.screen.width / 2 - (infoText.width + 20) / 2,
                    this.app.screen.height / 2 - 410,
                    infoText.width + 20,
                    230,
                    5
                )
                .fill(0x323232)
                .stroke({ width: 2, color: 0x000000 });
        
            this.characterCardsContainer.addChild(infoBackground);
            this.characterCardsContainer.addChild(infoText);
        }
        
    }

    displayTempCards(player: Player) {
        this.hudManager.displayTempCards(player, this.tempCardsContainer, this.app.screen.width, this.app.screen.height);
    }

    displayPurpleCards(player: Player, marketState: MarketCard, minusIntoPlusCall: (color: Color) => void, confirmAssetAbilityCall: (color: number) => void,confirmColorChangeCall: (cardIndex: number, color: Color) => void, silverIntoGoldCall: (index: number) => void) {
        this.hudManager.displayPurpleCards(
            player, 
            this.purpleCardsContainer, 
            marketState, 
            this.app.screen.width, 
            this.app.screen.height, 
            { minusIntoPlusCall, confirmAssetAbilityCall, confirmColorChangeCall, silverIntoGoldCall },
            this.popUpManager
        );
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
                (this.app.screen.height / 2 - (titleText.height / 2)) - padding, 
                titleText.width + (padding * 2),
                titleText.height + (padding * 2),
                15 
            )
            .fill({ color: 0x000000, alpha: 0.5 });

        titleText.position.set(this.app.screen.width / 2 - (titleText.width / 2), this.app.screen.height / 2 - (titleText.height / 2)); 
        container.addChild(bg, titleText);
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