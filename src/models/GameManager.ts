import Player from './Player.js';
import Asset from './Asset.js';
import Liability from './Liability.js';
import { Group } from 'tweedle.js';
import type GameState from './GameState.js';
import type UIManager from './UIManager.js';
import type NetworkManager from './NetworkManager.js';
import type { Application, Container } from 'pixi.js';
import type { EitherAssetLiability, PlayerInfo } from '@shared-types';
import PlayerActionManager from './GameManager/PlayerActionManager.js';
import ServerEventManager from './GameManager/ServerEventManager.js';

export type DivestmentAsset = {
    asset: Asset,
    cost: number,
    isDivestable: boolean,
};

export type DivestmentTarget = {
    player: Player;
    assets: DivestmentAsset[];
};

class GameManager {
    app: Application;
    gameState: GameState;
    uiManager: UIManager;
    networkManager: NetworkManager;
    playerActionManager: PlayerActionManager;
    serverEventManager: ServerEventManager;
    
    activePopup: Container | null = null;

    constructor(gameState: GameState, uiManager: UIManager, networkManager: NetworkManager) {
        
        this.gameState = gameState;
        this.uiManager = uiManager;
        this.networkManager = networkManager;
        this.app = uiManager.app;

        this.playerActionManager = new PlayerActionManager(this);
        this.serverEventManager = new ServerEventManager(this);

        this.uiManager.app.ticker.add(() => {
            Group.shared.update();
        });

        this.gameState.currentPhase = 'lobby';

        window.addEventListener('beforeunload', () => {
            console.log("call a function before reloading");
        });
    }

    async initRound() {
        await this.uiManager.createAssetDeck(() => this.networkManager.sendCommand("DrawCard", { "card_type": "Asset" }));
        await this.uiManager.createLiabilityDeck(() => this.networkManager.sendCommand("DrawCard", { "card_type": "Liability" }));
        
        /*this.uiManager.draftOverlay.clear().rect(0, 0, this.uiManager.app.screen.width, this.uiManager.app.screen.height).fill({ color: 0x000000, alpha: 0.7 });

        this.uiManager.characterContainer.addChildAt(this.uiManager.draftOverlay, 0);
        this.uiManager.draftOverlay.visible = true;*/

        this.gameState.players.forEach(p => {
            p.character = null;
            p.reveal = false;
            p.playableAssets = 1;
            p.playableLiabilities = 1;
        });
    }  

    
    startTurnPlayerVisibilty() {
        const player = this.gameState.getCurrentPlayer();

        this.gameState.currentPhase = 'picking';

        if (player.playerID == this.gameState.myId) { // Use player.playerID for comparison
            this.uiManager.popUpManager.anounceCharacter(player);
            this.playerActionManager.showLocalPlayerPicking(player);
            
        } else {
            this.otherPlayerScreenSetup(player);
            this.uiManager.popUpManager.anounceCharacter(player);
        }
        this.updateUI();
    }
    otherPlayerScreenSetup(player: Player){
        this.uiManager.showScreen('elseTurn');
        this.uiManager.elseTurnContainer.removeChildren();
        this.uiManager.playedCardsContainer.removeChildren();

        this.otherCards();

        this.updateAllPlayerStats();
        this.uiManager.hudManager.displayPlayerCharacter(player, this.uiManager.elseTurnContainer, () => {
            //this.networkManager.sendCommand("UseAbility");
        });
        this.uiManager.hudManager.displayRevealedCharacters(this.gameState.players, this.uiManager.elseTurnContainer);
    }
    updateAllPlayerStats(){
        const currentPlayer = this.gameState.getCurrentPlayer();
        const localPlayer = this.gameState.getLocalPlayer();
        const container = currentPlayer.playerID === this.gameState.myId ? this.uiManager.mainContainer : this.uiManager.elseTurnContainer;
        this.uiManager.hudManager.displayAllPlayerStats(this.gameState.players, container, currentPlayer,localPlayer);
    }
    switchToMainPhase() {
        this.uiManager.showScreen('main');

        this.uiManager.mainContainer.removeChildren();
        this.uiManager.handContainer.removeChildren();
        this.uiManager.playedCardsContainer.removeChildren();

        this.uiManager.hudManager.createNextTurnButton(() => this.networkManager.sendCommand("EndTurn"), this.uiManager.mainContainer);
        this.uiManager.hudManager.displayAllPlayerStats(this.gameState.players, this.uiManager.mainContainer, this.gameState.getCurrentPlayer(),this.gameState.getLocalPlayer());
        

        this.uiManager.hudManager.displayPlayerCharacter(
            this.gameState.getCurrentPlayer(),
            this.uiManager.mainContainer,
            () => {
                this.networkManager.sendCommand("UseAbility");
            }
        );
        
        this.uiManager.hudManager.displayRevealedCharacters(this.gameState.players, this.uiManager.mainContainer);

        const currentPlayer = this.gameState.getCurrentPlayer();
        currentPlayer.hand.forEach(card => {
            this.uiManager.handContainer.addChild(card.sprite);
        });

        this.playerActionManager.updateHandPlayability();
        
        //this.uiManager.statsText.text = `assets:${currentPlayer.playableAssets}, liablities: ${currentPlayer.playableLiabilities}, cash: ${currentPlayer.cash}`;
        this.uiManager.handContainer.sortChildren();
        this.uiManager.hudManager.displayPlayerPlayedCards(currentPlayer.assetList,currentPlayer.liabilityList, this.uiManager.playedCardsContainer);

        this.uiManager.mainContainer.addChild(this.uiManager.handContainer, this.uiManager.playedCardsContainer);
        this.updateUI();
    }
    updateUI() {
        const currentPlayer = this.gameState.getCurrentPlayer();

        this.gameState.players.forEach(player => {
            
            player.hand.forEach(card => {
                if (card.sprite) card.sprite.visible = false;
            });
            player.assetList.forEach(card => {
                if (card.sprite) card.sprite.visible = true;
            });
            player.liabilityList.forEach(card => {
                if (card.sprite) card.sprite.visible = true;
            });
        });

        if (currentPlayer.playerID === this.gameState.myId) {
            currentPlayer.hand.forEach(card => {
                if (card.sprite) card.sprite.visible = true;
            });
        }
       
    }

    
    async otherCards() {
        const currentPlayer = this.gameState.getCurrentPlayer();

        const othersHand = currentPlayer.othersHand;
        const assets = othersHand.filter(cardType => cardType == 'Asset');
        const liabilities = othersHand.filter(cardType => cardType == 'Liability');
        this.uiManager.elseTurnContainer.addChild(this.uiManager.playedCardsContainer); // This remains as it's managing container structure
        this.uiManager.hudManager.displayOtherPlayerHand(assets, liabilities, this.uiManager.elseTurnContainer);
        this.uiManager.hudManager.displayPlayerPlayedCards(currentPlayer.assetList,currentPlayer.liabilityList, this.uiManager.playedCardsContainer);
    
    }

    initPlayers(player_info: PlayerInfo[]){
        // Initialize all players from player_info
        for (const player_data of player_info) {
            const player = new Player(player_data.name, player_data.id,this.app);
            player.cash = player_data.cash;
            player.othersHand = player_data.hand;
            this.gameState.players.push(player);
        }
    }

    async _updateHandFromServer(newCardsData: EitherAssetLiability[]) {
        const localPlayer = this.gameState.getLocalPlayer();
        if (!localPlayer) return;

        // Clear current hand
        localPlayer.hand.forEach(card => card.sprite.destroy());
        localPlayer.hand = [];

        // The hand container should be cleared before adding new cards.
        this.uiManager.handContainer.removeChildren();

        for (const cardData of newCardsData) {
            let newCard;
            if (cardData.card_type === "asset") {
                newCard = new Asset(
                    cardData.title,
                    cardData.color,
                    cardData.gold_value,
                    cardData.silver_value,
                    cardData.ability,
                    cardData.image_front_url
                );
            } else { // liability
                newCard = new Liability(
                    cardData.rfr_type,
                    cardData.value,
                    cardData.image_front_url
                );
            }
            await newCard.initializeSprite();
            this.playerActionManager.setupCardInteractions(newCard);
            localPlayer.addCardToHand(newCard);
            this.uiManager.handContainer.addChild(newCard.sprite);
        }
    }

}

export default GameManager;
