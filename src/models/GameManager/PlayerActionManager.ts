import type { Application } from 'pixi.js';
import type GameState from '../GameState.js';
import type UIManager from '../UIManager.js';
import type NetworkManager from '../NetworkManager.js';
import type Player from '../Player.js';
import Asset from '../Asset.js';
import Liability from '../Liability.js';
import type GameManager from '../GameManager.js';
import type { MarketCard } from '@shared-types';

class PlayerActionManager {
    app: Application;
    gameState: GameState;
    uiManager: UIManager;
    networkManager: NetworkManager;
    gameManager: GameManager;

    constructor(gameManager: GameManager) {
        this.gameManager = gameManager;
        this.gameState = gameManager.gameState;
        this.uiManager = gameManager.uiManager;
        this.networkManager = gameManager.networkManager;
        this.app = gameManager.app;
    }

    initLobby() {
        this.uiManager.showScreen('login');
        
        this.uiManager.displayGameName(this.uiManager.loginContainer);
        const nameBox = this.uiManager.createNameBox();
        const channelBox = this.uiManager.createChannelBox();

        const joinGame = () => {
            const username = nameBox.value;
            const channel = channelBox.value;
            if (!username) return;
            this.networkManager.sendCommand("Connect", { "username": username, "channel": channel });
            this.gameState.username = username;
            this.gameState.channel = channel;
            this.uiManager.showScreen('lobby');
        };

        this.uiManager.createJoinButton(joinGame);
        
        /*this.uiManager.debugPurpleCards(
            this.gameState.marketState,
            (color) => { this.networkManager.sendCommand("MinusIntoPlus", { color: color }); },
            (index)=> { this.networkManager.sendCommand("ConfirmAssetAbility",{asset_idx:index}); },
            (index,color) => {this.networkManager.sendCommand("ChangeAssetColor",{ asset_idx: index, color: color }); },
            (index) => {this.networkManager.sendCommand("SilverIntoGold",{asset_idx: index})}
        );*/
    }

    showLocalPlayerPicking(player: Player){
        this.uiManager.showScreen('picking');
        this.uiManager.displayTempCards(player);
        this.uiManager.statsText.text = `${player.name} is ${player.character!.name} and is picking cards`;
        this.uiManager.pickingContainer.addChild(this.uiManager.handContainer);
        player.positionCardsInHand();
    }

    youEndedTurn(){
        const currentPlayer = this.gameState.getCurrentPlayer();
        currentPlayer.hand.forEach(card => {
            card.makeUnplayable();
        });
    }

    updateHandPlayability() {
        const localPlayer = this.gameState.getLocalPlayer();
        if (!localPlayer) return;

        localPlayer.hand.forEach(card => {
            this.setupCardInteractions(card); // Re-attach listeners
            // Determine if the card should be playable
            const canPlayAsset = card instanceof Asset && localPlayer.playableAssets > 0;
            const canPlayLiability = card instanceof Liability && localPlayer.playableLiabilities > 0;
            const canPlay = canPlayAsset || canPlayLiability;

            if (canPlay) {
                card.makePlayable();
            } else {
                card.makeUnplayable();
            }
        });
        localPlayer.positionCardsInHand();
    }

    setupCardInteractions(card: Asset | Liability) {
        const localPlayer = this.gameState.getLocalPlayer()!;

        // Setup click-to-play listener
        card.sprite.removeAllListeners('mousedown'); // Clear old listeners to be safe
        card.sprite.on('mousedown', () => {
            const cardIndex = localPlayer.hand.indexOf(card);
            if (cardIndex !== -1) {
                // Check if the card is actually playable before sending command
                const canPlayAsset = card instanceof Asset && localPlayer.playableAssets > 0 && localPlayer.cash >= card.gold;
                const canPlayLiability = card instanceof Liability && localPlayer.playableLiabilities > 0;

                if (card instanceof Asset) {
                    if (canPlayAsset) this.networkManager.sendCommand("BuyAsset", { card_idx: cardIndex });
                } else if (card instanceof Liability) {                        
                    if (canPlayLiability) this.networkManager.sendCommand("IssueLiability", { card_idx: cardIndex });
                }
            }
        });

        // Setup hover listeners
        card.sprite.on('cardHover', (hoveredCard) => localPlayer.positionCardsInHand(hoveredCard));
        card.sprite.on('cardOut', () => localPlayer.positionCardsInHand());
    }

    makeCardDiscardable(newCard: Asset | Liability){
        const currentPlayer = this.gameState.getCurrentPlayer();
        newCard.sprite.on('cardDiscarded', (discardCard) => {
            const cardIndex = currentPlayer.hand.indexOf(discardCard);
            this.networkManager.sendCommand("PutBackCard", { card_idx: cardIndex });
        });
    }
    
}

export default PlayerActionManager;