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
    async createAsset(cardData: AssetCard) {
        const newCard:Asset = new Asset(
            cardData.title,
            cardData.color,
            cardData.gold_value,
            cardData.silver_value,
            cardData.ability,
            cardData.image_front_url
        );
        await newCard.initializeSprite();
        return newCard
    }
    async createLiability(cardData: LiabilityCard) {
        const newCard: Liability = new Liability(
            cardData.rfr_type,
            cardData.value,
            cardData.image_front_url
        );
        await newCard.initializeSprite();
        return newCard
    }

    async createCard(cardData: EitherAssetLiability) {
        let newCard : Asset | Liability;
        if (cardData.card_type === "asset") {
            const { ...asset } = cardData;
            newCard = await this.createAsset(asset);
        } else //if (cardData.card_type === "liability")
        {
            const { ...liability } = cardData;
            newCard = await this.createLiability(liability);
        }

        return newCard;
    }

    // Plays an assets and updates corresponding values
    playAsset(player: Player, card: Asset) {
        player.gold += card.gold;
        player.silver += card.silver;
        player.assetList.push(card);
        player.positionAssetsToPile();
    }

    // Plays a liability and updates corresponding values
    playLiability(player: Player, card: Asset | Liability) {
        player.liabilityList.push(card);
        player.positionLiabilitiesToPile();
    }

    // Plays the given card by cardData as the given player
    async playCard(player: Player, card: Asset | Liability) {
        // Push card to the correct pile
        if (card instanceof Asset) {
            this.playAsset(player, card);
        } else if (card instanceof Liability) {
            this.playLiability(player, card);
        } else {
            throw "unreachable";
        }
    }

    async rejoinGame() {
        this.networkManager.sendCommand("Resync");
    }

    async playerRejoined(data: Extract<UniqueResponse, {action: "Rejoined"}>['data']) {
        console.log(data);
    }

    // Handles a full rejoin from any situation
    async resync(data: Extract<DirectResponse, {action: "YouResynced"}>['data']) {
        console.log("Received Resync data from server:", data);

        // TODO: Check functionality of initRound with documentation (Oliver)
        // Create the decks (I think?)
        this.initRound();

        // Setup local player
        this.gameState.players = [];
        this.gameState.myId = data.id;
        // TODO: pretty sure this is not set so this.gameState.username! will crash
        const localPlayer = new Player(this.gameState.username!, data.id, this.app);
        localPlayer.reveal = true;
        localPlayer.cash = data.cash;

        this.gameState.players.push(localPlayer);

        // Handle played cards
        for (const cardData of data.assets) {
            const card = (await this.createAsset(cardData))!;
            await this.playAsset(localPlayer, card);
        }
        for (const cardData of data.liabilities) {
            const card = (await this.createLiability(cardData))!;
            await this.playLiability(localPlayer, card);
        }

        // Handle cards in hand
        for (const cardData of data.hand) {
            const card = (await this.createCard(cardData))!;
            localPlayer.addCardToHand(card);

            // Attach event listeners for playing/discarding cards
            this.setupCardInteractions(card);

            // Sync UI
            this.uiManager.handContainer.addChild(card.sprite);
        }

        localPlayer.positionCardsInHand();
        this.uiManager.handContainer.sortChildren(); // Sort initial hand cards
        // Add the other players
        this.initPlayers(data.player_info);
        for (const player_ of data.player_info) {
            const info = player_ as PlayerInfo;
            const otherPlayer = this.gameState.getPlayerById(info.id)!;

            // Set up their data
            const character = this.gameState.characters.find(
                character => character.characterType == info.character
            )!;
            otherPlayer.character = character;

            // Handle already played cards
            for (const asset of info.assets) {
                const card = (await this.createAsset(asset))!;
                await this.playCard(otherPlayer, card);
            }
            for (const liability of info.liabilities) {
                const card = (await this.createLiability(liability))!;
                await this.playCard(otherPlayer, card);
            }

            // Set up their graphics
            otherPlayer.positionAssetsToPile();
            otherPlayer.positionLiabilitiesToPile();
            console.log(otherPlayer);
        };
        if ("SelectingCharacters" in data.phase) {
            this.uiManager.showScreen("character");
            // Get the selection data
            const selecting = data.phase.SelectingCharacters;

            // Set the open characters
            this.gameState.openCharacters = this.gameState.characters.filter(character => selecting.open_characters.includes(character.characterType));

            // If there are selectable characters then assume the player is currently selecting a character
            if (selecting.selectable_characters !== null) {
                this.uiManager.displayCharacterSelection(
                    // Get all the selectable characters
                    this.gameState.characters.filter(character => selecting.selectable_characters?.includes(character.characterType)),
                    // Get all the open characters
                    this.gameState.openCharacters,
                    // Make them clickable
                    (character) => {
                        this.networkManager.sendCommand("SelectCharacter", { "character": character.characterType! });
                        console.log(`Selected character: ${character.characterType}`);
                        this.uiManager.characterCardsContainer.removeChildren();
                    },
                    // Show the closed character if it exists, otherwise pass undefined to indicate no closed character
                    selecting.closed_character ?
                        this.gameState.characters.filter(character => selecting.closed_character?.includes(character.characterType))
                        : undefined);
            }
        }
        if ("PlayingRound" in data.phase) {
            console.log("IN round phase")
            const round = data.phase.PlayingRound;

            const drawableCards = round.draws_n_cards;
            const playableAssets = round.playable_assets.total;
            const playableLiabilities = round.playable_liabilities;
       
            const nextPlayerIndex = this.gameState.players.findIndex(p => p.playerID == round.current_player_id);
            console.log(nextPlayerIndex);

            if (nextPlayerIndex !== -1) {
                this.gameState.setCurrentPlayerIndex(nextPlayerIndex);
                const currentPlayer = this.gameState.getCurrentPlayer();
                const character = this.gameState.characters.find(c => c.characterType === round.player_character);
                if (character) {
                    currentPlayer.character = character;
                } else {
                    console.error(`Character with name ${round.player_character} not found.`);
                }

                currentPlayer.playableAssets = playableAssets;
                currentPlayer.playableLiabilities = playableLiabilities;
                currentPlayer.reveal = true;
                currentPlayer.drawableCards = drawableCards;

                this.uiManager.statsText.text = `${currentPlayer.name}'s turn`; // `${player.name} is ${player.character.name} and is picking cards`;                
                if (currentPlayer.playerID == this.gameState.myId) {
                    if (round.cards_drawn < round.draws_n_cards || round.cards_returned < round.gives_back_n_cards) {
                        console.log("We're playing, " + round.drawn_cards.length);
                        for (const card of round.drawn_cards) {
                            const possibleHand = currentPlayer.hand;
                            console.log(possibleHand);
                            if (possibleHand) {
                                const possibleCard = possibleHand[card];
                                if (possibleCard) {
                                    possibleCard.isTemporary = true;
                                    this.makeCardDiscardable(possibleCard);

                                    this.uiManager.displayTempCards(currentPlayer);
                                    console.log("Turned temporary: " + card);
                                }
                                console.log(possibleCard);
                            }
                        }
                        this.startTurnPlayerVisibilty();
                    } else {
                        this.switchToMainPhase();
                        currentPlayer.positionCardsInHand();
                    }
                } else {
                    console.log("Not our turn, ");
                    this.otherPlayerScreenSetup(currentPlayer);
                }
            }
        // TODO: Add correct turn phase syncing
        }
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
