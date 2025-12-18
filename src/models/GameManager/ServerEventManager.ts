import { Container, Graphics, Text, TextStyle, Ticker, type Application } from 'pixi.js';
import type GameState from '../GameState.js';
import type UIManager from '../UIManager.js';
import type NetworkManager from '../NetworkManager.js';
import type { DirectResponse, UniqueResponse } from '@shared-types';
import Character from '../Characters.js';
import Player from '../Player.js';
import Asset from '../Asset.js';
import Liability from '../Liability.js';
import type GameManager from '../GameManager.js';
import type { DivestmentTarget } from '../GameManager.js';
import type { IncomingResponse } from '../NetworkManager.js';

class ServerEventManager {
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

    async messageStartGame(data: Extract<UniqueResponse, { action: "StartGame" }>['data']) {
        console.log("Received StartGame data from server:", data);
        
        this.gameState.players = []; 
        this.gameState.myId = data.id;
        this.gameState.marketState = data.initial_market;
        const localPlayer = new Player(this.gameState.username!, data.id,this.app);
        localPlayer.reveal = true;
        localPlayer.cash = data.cash;

        this.gameState.players.push(localPlayer);

        this.gameManager.initPlayers(data.player_info);
         this.uiManager.hudManager.showMarket(this.gameState.marketState , this.uiManager.marketContainer);

        this.gameManager.updateUI();
        if (!localPlayer) {
            console.error("Could not find the local player in server data!");
            return;
        }

        for (const cardData of data.hand) {
            let newCard;
            if (cardData.card_type == "asset") {
                newCard = new Asset(
                    cardData.title,
                    cardData.color,
                    cardData.gold_value,
                    cardData.silver_value,
                    cardData.ability,
                    cardData.image_front_url
                );
            } else {
                newCard = new Liability(
                    cardData.rfr_type,
                    cardData.value,
                    cardData.image_front_url
                );
            }
            await newCard.initializeSprite();

            // Attach event listeners for playing/discarding cards
            this.gameManager.playerActionManager.setupCardInteractions(newCard);
                    

            localPlayer.addCardToHand(newCard);
            this.uiManager.handContainer.addChild(newCard.sprite);
        }
        
        localPlayer.positionCardsInHand();
        this.uiManager.handContainer.sortChildren(); // Sort initial hand cards
        this.gameManager.initRound();
    }

    async youDrewCard(data: Extract<DirectResponse, { action: "YouDrewCard" }>['data']) {
        console.log("You Drew Card:", data);
        const cardData = data.card;
        const currentPlayer = this.gameState.getCurrentPlayer();
        let newCard: Asset | Liability;

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

        newCard.isTemporary = true;
        this.gameManager.playerActionManager.setupCardInteractions(newCard); // Sets up the click and hover events
        this.gameManager.playerActionManager.makeCardDiscardable(newCard);

        currentPlayer.addCardToHand(newCard);
        this.uiManager.displayTempCards(currentPlayer);

        if (data.can_draw_cards === false && data.can_give_back_cards === false) {
            currentPlayer.hand.forEach(card => {
                card.isTemporary = false;
                this.uiManager.handContainer.addChild(card.sprite);
                this.gameManager.switchToMainPhase();
                if (card.discardButton) {
                    this.uiManager.tempCardsContainer.removeChild(card.discardButton);
                }
            });
          
            if (currentPlayer.drawableCards === 0) {
                this.gameManager.switchToMainPhase();
            }
            //this.youPutBackCard({ kept_cards: [] }); // Passing empty array to avoid errors, as cards are already moved.
        }
    }

    async drewCard(data: Extract<UniqueResponse, { action: "DrewCard" }>['data']){
        const currentPlayer = this.gameState.getCurrentPlayer();
        if (currentPlayer && currentPlayer.playerID !== this.gameState.myId) {
            console.log("Drew Card:", data);
            currentPlayer.othersHand.push(data.card_type);
            this.gameManager.otherCards();
        }
    }

    youPutBackCard(data: Extract<DirectResponse, { action: "YouPutBackCard" }>['data']) {
        const localPlayer = this.gameState.getLocalPlayer();
        if (!localPlayer) return;
        
        const cardIndex = data.card_idx;
        const card = localPlayer.hand[cardIndex]!;
        console.log(localPlayer.hand, card);
        this.uiManager.tempCardsContainer.removeChild(card.sprite, card.discardButton);
        localPlayer.hand.splice(cardIndex,1);

        //this.uiManager.displayTempCards(localPlayer);
        if (data.can_draw_cards === false && data.can_give_back_cards === false) {
            localPlayer.hand.forEach(card => {
                card.isTemporary = false;
                this.uiManager.handContainer.addChild(card.sprite);
                if (card.discardButton) {
                    this.uiManager.tempCardsContainer.removeChild(card.discardButton);
                }
            });
            this.gameManager.switchToMainPhase();
        }
      
    }

    putBackCard(data: Extract<UniqueResponse, { action: "PutBackCard" }>['data']){
        const currentPlayer = this.gameState.getPlayerById(data.player_id);
        
        
        if (currentPlayer && currentPlayer.playerID != this.gameState.myId) {
            console.log("Other player put back a card:", data);

            currentPlayer.othersHand.splice(currentPlayer.othersHand.indexOf(data.card_type),1)
            this.gameManager.otherPlayerScreenSetup(currentPlayer);
        }
    }
    
    error(data: Extract<DirectResponse, { action: "Error" }>['data']) {
        const padding = 12;
        const gap = 8;
        const fadeDelayMs = 2000;
        const fadeDurationMs = 500;
    
        const popup = new Container();
        popup.eventMode = 'static';
        popup.cursor = 'pointer';
    
        // === TEXT ===
        const text = new Text({
            text: data.message,
            style: new TextStyle({
                fill: 0xffffff,
                fontSize: 14,
                wordWrap: true,
                wordWrapWidth: 280,
            }),
        });
    
        text.position.set(padding, padding);
    
        // === BACKGROUND ===
        const bg = new Graphics()
            .roundRect(
                0,
                0,
                text.width + padding * 2,
                text.height + padding * 2,
                8
            )
            .fill(0xcc3333);
    
        popup.addChild(bg, text);
    
        // === POSITIONING ===
        const repositionErrors = () => {
            let y = 16;
            for (const err of this.uiManager.errorContainers) {
                err.x = this.app.screen.width - err.width - 16;
                err.y = y;
                y += err.height + gap;
            }
        };
    
        this.uiManager.errorContainers.push(popup);
        repositionErrors();
    
        this.app.stage.addChild(popup);
    
        // === DISMISS FUNCTION ===
        const dismiss = () => {
            if (!popup.parent) return;
    
            const idx = this.uiManager.errorContainers.indexOf(popup);
            if (idx !== -1) this.uiManager.errorContainers.splice(idx, 1);
    
            popup.destroy({ children: true });
            repositionErrors();
        };
    
        // === CLICK TO DISMISS ===
        popup.on('pointertap', dismiss);
    
        // === FADE OUT ===
        let elapsed = 0;
        const ticker = new Ticker();
    
        ticker.add(() => {
            elapsed += ticker.deltaMS;
    
            if (elapsed > fadeDelayMs) {
                const fadeElapsed = elapsed - fadeDelayMs;
                popup.alpha = Math.max(
                    0,
                    1 - fadeElapsed / fadeDurationMs
                );
    
                if (popup.alpha === 0) {
                    ticker.stop();
                    ticker.destroy();
                    dismiss();
                }
            }
        });
    
        ticker.start();
    }

    newPlayer(data: Extract<UniqueResponse, { action: "PlayersInLobby" }>['data']) {
        this.uiManager.showScreen('lobby');
        //this.uiManager.statsText.text = `${data.usernames.length} / 4 Players`;
        this.gameState.players = []; 

        data.usernames.forEach((username, index) => {
            const player = new Player(username, index,this.app);
            this.gameState.players.push(player);
        });
        this.uiManager.displayLobbyPlayers(
            this.gameState.players,
            () => { this.networkManager.sendCommand("StartGame"); },
            this.gameState.channel,
        );
        
    }

    chairmanSelectCharacter(data: Extract<UniqueResponse, { action: "SelectingCharacters" }>['data']){ 
        this.uiManager.showScreen("character");
        this.gameState.resetForNewRound();

        const chairmanPlayer = this.gameState.getPlayerById(data.chairman_id)!;
        //`${localPlayer.name} is choosing their character`;
        chairmanPlayer.isChaiman = true;
        console.log("Received selectable characters:", data);

        this.gameState.openCharacters = this.gameState.characters.filter(character =>
            data.open_characters.includes(character.characterType)
        );
        
        let faceUpCharacters:Character[] | undefined;
        
        const selectable_characters = data.selectable_characters;
        if (selectable_characters) {
            faceUpCharacters = this.gameState.characters.filter(character =>
                selectable_characters.includes(character.characterType)
            );
        }
        let closedCharacter: Character | undefined;
        
        const closed_character = data.closed_character;
        if (closed_character) {
            closedCharacter = this.gameState.characters.find(character =>
                closed_character.includes(character.characterType)
            )!;
        }

        this.uiManager.displayCharacterSelection(
            this.gameState.openCharacters,
            (character) => {
                this.networkManager.sendCommand("SelectCharacter", { "character": character.characterType! });
                this.uiManager.characterCardsContainer.removeChildren();
            }, 
            faceUpCharacters,
            closedCharacter,
            chairmanPlayer
        );
        
    }

    receiveSelectableCharacters(data: Extract<UniqueResponse, { action: "SelectedCharacter" }>['data']) {
        this.uiManager.showScreen('character');
        if(data.currently_picking_id == null){ // is this still nececery?
            return;
        }
        console.log("Received selectable characters:", data);
        
        const currentPlayer = this.gameState.getPlayerById(data.currently_picking_id)!;
        this.uiManager.displayPlayerChoosingMessage(this.uiManager.characterCardsContainer, `${currentPlayer.name} is choosing their character`);
        //`${currentPlayer.name} is choosing their character`;
        let faceUpCharacters: Character[] | undefined;
        const selectable_characters = data.selectable_characters;
        if (selectable_characters) {
            faceUpCharacters = this.gameState.characters.filter(character =>
                selectable_characters.map(c => c.toString()).includes(character.characterType)
            );
        }

        this.uiManager.displayCharacterSelection(
            this.gameState.openCharacters, 
            (character) => { 
                this.networkManager.sendCommand("SelectCharacter", { "character": character.characterType! });
                this.uiManager.characterCardsContainer.removeChildren();
            },
            faceUpCharacters, 
            undefined,
            currentPlayer

        );
        
    }

    youSelectedCharacter(data: Extract<DirectResponse, { action: "YouSelectedCharacter" }>['data']) {
        // This function might be used to confirm your character selection
        const localPlayer = this.gameState.getLocalPlayer();
        if (localPlayer) {
            localPlayer.character = this.gameState.characters.find(c => c.characterType === data.character)!;
            console.log(`Local player ${localPlayer.name} selected ${localPlayer.character.name}`);
        }
    }

    turnStarts(data: Extract<UniqueResponse, { action: "TurnStarts" }>['data']) {
        console.log("Received TurnStart data from server:", data);

        const drawableCards = data.draws_n_cards;
        const recieveCash = data.player_turn_cash;
        const playableAssets = data.playable_assets.total;
        const playableLiabilities = data.playable_liabilities;
       
        const nextPlayerIndex = this.gameState.players.findIndex(p => p.playerID == data.player_turn);

        if (nextPlayerIndex !== -1) {
            this.gameState.setCurrentPlayerIndex(nextPlayerIndex);
            const currentPlayer = this.gameState.getCurrentPlayer();
            const character = this.gameState.characters.find(c => c.characterType === data.player_character);
            if (character) {
                currentPlayer.character = character;
            } else {
                console.error(`Character with name ${data.player_character} not found.`);
            }

            currentPlayer.playableAssets = playableAssets;
            currentPlayer.playableLiabilities = playableLiabilities;
            currentPlayer.cash += recieveCash;
            currentPlayer.reveal = true;
            currentPlayer.drawableCards = drawableCards;

            //this.uiManager.statsText.text = `${currentPlayer.name}'s turn`; // `${player.name} is ${player.character.name} and is picking cards`;
            
            
            this.gameManager.startTurnPlayerVisibilty();
            this.gameManager.updateUI();

        } else {
            console.error(`Player with ID ${data.player_turn} not found.`);
        }
      
    }

    youBoughtAsset(data: Extract<DirectResponse, { action: "YouBoughtAsset" }>['data']){
        const player = this.gameState.getLocalPlayer();
        if (!player) return;

        const card = player.hand.filter(c => c instanceof Asset).find(c => c.title === data.asset.title && c.gold === data.asset.gold_value && c.silver === data.asset.silver_value);
        if (!card) return;

        const cardIndex = player.hand.indexOf(card);
        if (cardIndex === -1) return;
        if (data.market_change) {
            this.uiManager.hudManager.showMarket(data.market_change.new_market, this.uiManager.marketContainer);
        }

        player.cash -= card.gold;
        player.gold += card.gold;
        player.silver += card.silver;
        player.assetList.push(card);
        player.hand.splice(cardIndex, 1);
        player.playableAssets--;

        player.positionCardsInHand();
        player.positionAssetsToPile();
        this.uiManager.hudManager.addCardToPlayedContainer(card, this.uiManager.playedCardsContainer);
        
        this.gameManager.playerActionManager.updateHandPlayability(); // This already calls updateUI
        this.gameManager.updateAllPlayerStats();
        //this.uiManager.statsText.text = `assets:${player.playableAssets}, liablities: ${player.playableLiabilities}, cash: ${player.cash}`;
        this.gameManager.updateUI();
      
    }

    async boughtAsset(data: Extract<UniqueResponse, { action: "BoughtAsset" }>['data']){
        if (data.market_change) {
            this.uiManager.hudManager.showMarket(data.market_change.new_market, this.uiManager.marketContainer);
        }
        const player = this.gameState.getCurrentPlayer();
        if (player && player.playerID !== this.gameState.myId) {
            const assetIndex = player.othersHand.indexOf('Asset');

            const cardData = data.asset;
            const newCard = new Asset(
                cardData.title,
                cardData.color,
                cardData.gold_value,
                cardData.silver_value,
                cardData.ability,
                cardData.image_front_url
            );
            await newCard.initializeSprite();
            player.assetList.push(newCard);
            player.positionAssetsToPile();
            player.cash -= newCard.gold;
            player.othersHand.splice(assetIndex,1);
            //this.uiManager.playedCardsContainer.addChild(newCard.sprite); // make this into a function 
            this.gameManager.otherCards(); // This already calls updateUI
            this.gameManager.updateAllPlayerStats();
            this.gameManager.updateUI();
            
        }
    }

    youIssuedLiability(data: Extract<DirectResponse, { action: "YouIssuedLiability" }>['data']){
        const player = this.gameState.getLocalPlayer();
        if (!player) return;

        const card = player.hand.filter(c => c instanceof Liability).find(c => c.title === data.liability.rfr_type && c.gold === data.liability.value);
        if (!card) return;

        const cardIndex = player.hand.indexOf(card);
        if (cardIndex === -1) return;

        player.cash += card.gold;
        player.liabilityList.push(card);
        player.hand.splice(cardIndex, 1);
        player.playableLiabilities--;

        player.positionCardsInHand();
        player.positionLiabilitiesToPile();
        card.sprite.on('mousedown', () => {
            this.networkManager.sendCommand("RedeemLiability", { liability_idx:player.liabilityList.indexOf(card) })
        });
        this.uiManager.hudManager.addCardToPlayedContainer(card, this.uiManager.playedCardsContainer);
        this.gameManager.updateAllPlayerStats();
        this.gameManager.playerActionManager.updateHandPlayability(); // This already calls updateUI
        //this.uiManager.statsText.text = `assets:${player.playableAssets}, liablities: ${player.playableLiabilities}, cash: ${player.cash}`;
        
        this.gameManager.updateUI();
       
    }

    youRedeemedLiability(data: Extract<DirectResponse, { action: "YouRedeemedLiability" }>['data']){
        const player = this.gameState.getLocalPlayer();
        if (!player) return;
        
        const card = player.liabilityList[data.liability_idx];
        if (!card) return;

        this.uiManager.hudManager.removeCardFromPlayedContainer(card, this.uiManager.playedCardsContainer);

        player.cash -= card.gold;
        player.liabilityList.splice(data.liability_idx, 1);
        player.playableLiabilities--;
        
        this.gameManager.playerActionManager.updateHandPlayability(); // This already calls updateUI
        this.gameManager.updateAllPlayerStats();
        //this.uiManager.statsText.text = `assets:${player.playableAssets}, liablities: ${player.playableLiabilities}, cash: ${player.cash}`;
        
        player.positionLiabilitiesToPile();
        this.gameManager.updateUI();    
    }

    redeemedLiability(data: Extract<UniqueResponse, { action: "RedeemedLiability" }>['data']){
        const player = this.gameState.getCurrentPlayer();
        if (player && player.playerID !== this.gameState.myId) {
            const liability = player.liabilityList[data.liability_idx]!;
            player.liabilityList.splice(data.liability_idx, 1); // remove liability from player
            player.cash -= liability.gold;
            this.gameManager.updateAllPlayerStats();
            player.positionLiabilitiesToPile(); // This already calls updateUI
            this.gameManager.otherCards();
            this.gameManager.updateUI();
            
        }
    }

    async issuedLiability(data: Extract<UniqueResponse, { action: "IssuedLiability" }>['data']){
        const player = this.gameState.getCurrentPlayer();
        if (player && player.playerID !== this.gameState.myId) {
            const liabilityIndex = player.othersHand.indexOf('Liability');
            
            const cardData = data.liability;
            const newCard = new Liability(
                cardData.rfr_type,
                cardData.value,
                cardData.image_front_url
            );
            await newCard.initializeSprite();
            player.liabilityList.push(newCard);
            player.cash += newCard.gold;
            player.positionLiabilitiesToPile();
            player.othersHand.splice(liabilityIndex,1);
            //this.uiManager.playedCardsContainer.addChild(newCard.sprite); // make this a function like displayOtherPlayerHand // This already calls updateUI
            this.gameManager.otherCards();
            this.gameManager.updateAllPlayerStats();
            this.gameManager.updateUI();
            
        }
    }

    async youAreFiringSomeone(data: Extract<DirectResponse, { action: "YouAreFiringSomeone" }>['data']) {
        const characters = this.gameState.characters.filter(character => data.characters.includes(character.characterType));

            this.gameManager.activePopup = await this.uiManager.popUpManager.StakeholdersPerk(
                characters,
                (charToFire) => this.networkManager.sendCommand("FireCharacter", { "character": charToFire.characterType! }));
    }

    youFiredCharacter(_data: Extract<DirectResponse, { action: "YouFiredCharacter" }>['data']){
        if (this.gameManager.activePopup) {
            this.gameManager.activePopup.destroy({ children: true });
            this.gameManager.activePopup = null;
        }

        this.gameManager.switchToMainPhase();
    }

    firedCharacter(data: Extract<UniqueResponse, { action: "FiredCharacter" }>['data']){
        const localPlayer = this.gameState.getLocalPlayer();
        const character = this.gameState.characters.find(character => data.character == character.characterType)!;
        this.uiManager.popUpManager.firedCharacter(character,localPlayer)
    }
    
    terminatedCreditCharacter(data: Extract<UniqueResponse, { action: "TerminatedCreditCharacter" }>['data']){
        const targetPlayer = this.gameState.getPlayerById(data.player_id);
        const character = this.gameState.characters.find(character => data.character == character.characterType)!;
        const localPlayer = this.gameState.getLocalPlayer();

        if (targetPlayer) {
            this.uiManager.popUpManager.terminatedCreditCharacter(character, targetPlayer, localPlayer.playerID === targetPlayer.playerID);
        }
    }

    playerTargetedByBanker(data: Extract<UniqueResponse, { action: "PlayerTargetedByBanker" }>['data']){
        const targetPlayer = this.gameState.getPlayerById(data.player_turn);
        const localPlayer = this.gameState.getLocalPlayer();

        if (targetPlayer) {
            this.uiManager.popUpManager.playerTargetedByBanker(
                targetPlayer, 
                data.cash_to_be_paid, 
                localPlayer.playerID === targetPlayer.playerID,
                (amount) => this.networkManager.sendCommand("PayBanker", {cash: amount}),
                (index) => this.networkManager.sendCommand("SelectAssetToDivest",{asset_id: index}),
                (index) => this.networkManager.sendCommand("UnselectAssetToDivest",{asset_id: index}),
                (index) => this.networkManager.sendCommand("SelectLiabilityToIssue",{liability_id: index}),
                (index) => this.networkManager.sendCommand("UnselectLiabilityToIssue",{liability_id: index})
            );
        }
    }

    youSelectCardBankerTarget(data: Extract<DirectResponse, {action: "YouSelectCardBankerTarget"}>['data']) {
        this.uiManager.popUpManager.updateBankerSellAssets(data);
    }

    youPaidBanker(data: Extract<DirectResponse, { action: "YouPaidBanker" }>['data']) {
        const localPlayer = this.gameState.getLocalPlayer();
        const banker = this.gameState.getPlayerById(data.banker_id);
        const amountPaid = data.paid_amount; 

        if (localPlayer) {
            localPlayer.cash = data.your_new_cash;
            
            data.sold_assets.forEach(item => {
                if (item.asset_idx >= 0 && item.asset_idx < localPlayer.assetList.length) {
                    localPlayer.assetList.splice(item.asset_idx, 1);
                }
            });
            localPlayer.positionAssetsToPile();

            data.issued_liabilities.forEach(item => {
                if (item.card_idx >= 0 && item.card_idx < localPlayer.hand.length) {
                    
                    const newLiability = new Liability(
                        item.liability.rfr_type,
                        item.liability.value,
                        item.liability.image_front_url
                    );
                  
                    newLiability.initializeSprite();

                    
                    localPlayer.liabilityList.push(newLiability);
                    
                    localPlayer.hand.splice(item.card_idx, 1);
                   
                    this.uiManager.hudManager.addCardToPlayedContainer(newLiability, this.uiManager.playedCardsContainer);
                    localPlayer.positionLiabilitiesToPile(); // This already calls updateUI
                }
            });
            }
        
        if (banker) {
            banker.cash = data.new_banker_cash;
        }
        
        //this.uiManager.statsText.text = `assets:${localPlayer.playableAssets}, liablities: ${localPlayer.playableLiabilities}, cash: ${localPlayer.cash}`; // This already calls updateUI
        this.gameManager.updateAllPlayerStats();
        this.gameManager.updateUI();
        

        if (banker) {
            this.uiManager.popUpManager.displayBankerPaymentNotification(localPlayer, banker, amountPaid, banker.playerID === this.gameState.myId, true, data.sold_assets, data.issued_liabilities);
        }
    }

    async playerPaidBanker(data: Extract<UniqueResponse, { action: "PlayerPaidBanker" }>['data']) {
        const targetPlayer = this.gameState.getPlayerById(data.player_id);
        const banker = this.gameState.getPlayerById(data.banker_id);
        const amountPaid = data.paid_amount;
        

        if (targetPlayer) {
            targetPlayer.cash = data.new_target_cash;

            const soldAssets = data.sold_assets;
            const issuedLiabilities = data.issued_liabilities;
                    
            soldAssets.forEach((asset) => {
                if (asset.asset_idx >= 0 && asset.asset_idx < targetPlayer.assetList.length) {
                    targetPlayer.assetList.splice(asset.asset_idx, 1);
                }
            });
            targetPlayer.positionAssetsToPile();
            // This already calls updateUI
            for (const item of issuedLiabilities) {
                const cardData = item.liability;
                const newCard = new Liability(
                    cardData.rfr_type,
                    cardData.value,
                    cardData.image_front_url
                );
                await newCard.initializeSprite();
                targetPlayer.liabilityList.push(newCard);

                const liabilityIndex = targetPlayer.othersHand.indexOf('Liability');
                if (liabilityIndex > -1) {
                    targetPlayer.othersHand.splice(liabilityIndex, 1);
                }
            }
            
            targetPlayer.positionLiabilitiesToPile(); // This already calls updateUI
            // For remote players, we remove the liability from their abstract hand count
            this.gameManager.otherCards();
                
            
        }
        if (banker) {
            banker.cash = data.new_banker_cash;
        }
        this.gameManager.updateAllPlayerStats();
        this.gameManager.updateUI(); 

        if (targetPlayer && banker) {
            this.uiManager.popUpManager.displayBankerPaymentNotification(targetPlayer, banker, amountPaid, banker.playerID === this.gameState.myId, targetPlayer.playerID === this.gameState.myId,data.sold_assets,data.issued_liabilities,);
        }
    }

    youMinusedIntoPlus(data: Extract<DirectResponse, { action: "YouMinusedIntoPlus" }>['data']) {
        this.gameState.marketState = data.new_market;
        this.uiManager.popUpManager.updateRnDMarket(data.new_market);
        
        const localPlayer = this.gameState.getLocalPlayer();
        if (localPlayer) {
            this.uiManager.popUpManager.updateEndGameScore(localPlayer.name, data.new_score);
        }
    }
    minusedIntoPlus(data: Extract<IncomingResponse, { action: "MinusedIntoPlus" }>['data']) {
        let playerID = data.player_id;
        let score = data.new_score;

    }

    youCharacterAbility(data: Extract<DirectResponse, { action: "YouCharacterAbility" }>['data']){
        const character = this.gameState.characters.find(character => data.character == character.characterType)!;
        const perk = data.perk;
        this.uiManager.popUpManager.youCharacterAbility(character,perk)
    }

    youAreDivesting(data: Extract<DirectResponse, { action: "YouAreDivesting" }>['data']){
        console.log("You are divesting:", data.options);

        
        const divestmentTargets: DivestmentTarget[] = data.options.map(option => {
            // now throws error when frontend gives back invalid player id
            const player = this.gameState.getPlayerById(option.player_id)!;
            
            const divestibleAssets: { asset: Asset, cost: number }[] = [];
            // TODO: coordinate with backend to actually get the data you want without needing this
            // conversion
            option.assets.forEach(divestOption => {
                const playerAsset = player.assetList.find(pa =>
                    pa.title === divestOption.asset.title &&
                    pa.gold === divestOption.asset.gold_value &&
                    pa.silver === divestOption.asset.silver_value
                );
                if (playerAsset) {
                    // We'll show all assets and let the UI handle interactiveness based on cost/rules if needed later.
                    divestibleAssets.push({ asset: playerAsset, cost: divestOption.divest_cost });
                }
            });

            return { player, assets: divestibleAssets };
        }).filter(target => target.assets.length > 0);
        console.log(divestmentTargets)
        this.uiManager.popUpManager.youAreDivesting(
            divestmentTargets,
            (playerID,cardID) => {
                    this.networkManager.sendCommand("DivestAsset", { "target_player_id": playerID,"card_idx":cardID });
                  
                }
        );
    }

    youDivestedAnAsset(_data: Extract<DirectResponse, { action: "YouDivestedAnAsset" }>['data']){
        if (this.gameManager.activePopup) {
            this.gameManager.activePopup.destroy({ children: true });
            this.gameManager.activePopup = null;
        }
        this.gameManager.switchToMainPhase();
    }

    async youAreTerminatingSomeone(data: Extract<DirectResponse, { action: "YouAreTerminatingSomeone" }>['data']){
        //data:"{\"action\":\"YouAreTerminatingSomeone\",\"data\":{\"characters\":[\"CEO\",\"CFO\",\"CSO\",\"HeadRnD\"],\"character\":\"Banker\",\"perk\":\"You can force a player to give you cash based on the amount of different color assets they have +1\"}}"
        const characters = this.gameState.characters.filter(character => data.characters.includes(character.characterType));
        let perk = data.perk
        
            this.uiManager.popUpManager.youAreTerminatingSomeone(
                characters,
                perk,
                (charToTerminate) => this.networkManager.sendCommand("TerminateCreditCharacter", { "character": charToTerminate.characterType! })
            );
    }

    youRegulatorOptions(data: Extract<DirectResponse, { action: "YouRegulatorOptions" }>['data']){ 
        console.log(data);
        const options = data.options;
        const perk = data.perk;
        this.uiManager.popUpManager.youRegulatorOptions(
            options,perk,
            this.gameState,
            (playerID)=>{
                this.networkManager.sendCommand("SwapWithPlayer", { "target_player_id": playerID });
                    //this.activePopup.destroy({ children: true });
                    this.gameManager.activePopup = null;
                    this.gameManager.switchToMainPhase();
            },
            (card_idxs) => {
                const localPlayer = this.gameState.getLocalPlayer();
                // Sort indices in descending order to avoid messing up indices as we splice
                card_idxs.sort((a, b) => b - a); 
                
                card_idxs.forEach(idx => {
                    const card = localPlayer.hand[idx];
                    if (card && card.sprite) {
                        card.sprite.destroy();
                        localPlayer.hand.splice(idx, 1);
                    }
                });
                this.networkManager.sendCommand("SwapWithDeck", { "card_idxs": card_idxs });
            }
            
        );
        
    }

    async swappedWithPlayer(data: Extract<UniqueResponse, { action: "SwappedWithPlayer" }>['data']){
        console.log("swapedWithPlayer:", data);
        if (this.gameManager.activePopup) {
            this.gameManager.activePopup.destroy({ children: true });
            this.gameManager.activePopup = null;
        }
    
        // The target of the swap has a specific handler (`regulatorSwapedYourCards`)
        // that will correctly update all state from their perspective.
        // We exit early to prevent this broadcast handler from interfering.
        if (data.target_id === this.gameState.myId) {
            return;
        }
    
        const regulator = this.gameState.players.find(p => p.playerID === data.regulator_id)!;
        const target = this.gameState.players.find(p => p.playerID === data.target_id)!;
        const temphand = regulator.othersHand;
        regulator.othersHand = target.othersHand;
        target.othersHand = temphand;
        
        // For spectators, refresh the view of the current player.
        // The regulator's own UI is updated by `youSwapPlayer`.
        if (this.gameState.myId !== regulator.playerID) {
            this.uiManager.popUpManager.displayPlayerSwapNotification(target);
            this.gameManager.otherPlayerScreenSetup(regulator);
        }
    }

    async youSwapPlayer(data: Extract<DirectResponse, { action: "YouSwapPlayer" }>['data']){
        console.log("youSwapPlayer:", data);
        if (this.gameManager.activePopup) {
            this.gameManager.activePopup.destroy({ children: true });
            this.gameManager.activePopup = null;
        }

        await this.gameManager._updateHandFromServer(data.new_cards);
        
        const localPlayer = this.gameState.getLocalPlayer();
        this.uiManager.popUpManager.displayYouSwappedNotification(localPlayer);

        this.gameManager.switchToMainPhase();
    }

    async regulatorSwappedYourCards(data: Extract<UniqueResponse, { action: "RegulatorSwappedYourCards" }>['data']){ 
        console.log("RegulatorSwappedYourCards:", data);
        
        const localPlayer = this.gameState.getLocalPlayer(); // This is the target player
        const regulatorPlayer = this.gameState.getCurrentPlayer();

        if (!localPlayer || !regulatorPlayer) return;

       
        const localPlayerOldHandRepresentation = localPlayer.hand.map(card => card instanceof Asset ? 'Asset' : 'Liability');
        regulatorPlayer.othersHand = localPlayerOldHandRepresentation;

        // 2. Update our actual hand with the new cards from the server.
        await this.gameManager._updateHandFromServer(data.new_cards);

        // 3. Update our own public-facing `othersHand` to match our new hand.
        localPlayer.othersHand = localPlayer.hand.map(card => card instanceof Asset ? 'Asset' : 'Liability');

        // 4. Update the UI.
        if (this.gameState.myId !== regulatorPlayer.playerID) {
            
            this.uiManager.popUpManager.displayRegulatorSwapNotification(this.gameState.getLocalPlayer());

            // The player whose cards were swapped is on the 'elseTurn' screen.
            // Refresh the screen to show the regulator's new hand count.
            this.gameManager.otherPlayerScreenSetup(regulatorPlayer);
        }
    }

    youSwapDeck(data: Extract<DirectResponse, { action: "YouSwapDeck" }>['data']) {
        console.log("youSwapDeck:", data);
        if (this.gameManager.activePopup) {
            this.gameManager.activePopup.destroy({ children: true });
            this.gameManager.activePopup = null;
        }
    
        const localPlayer = this.gameState.getLocalPlayer();
        if (!localPlayer) return;
    
        // Set how many cards the player needs to draw and switch to the picking screen.
        localPlayer.drawableCards = data.cards_to_draw;
        this.uiManager.showScreen('picking');
        //this.uiManager.statsText.text = `Your turn: Draw ${localPlayer.drawableCards} cards.`;
        this.uiManager.displayTempCards(localPlayer);
        this.uiManager.pickingContainer.addChild(this.uiManager.handContainer);
        localPlayer.positionCardsInHand();
    }

    swappedWithDeck(data: Extract<UniqueResponse, { action: "SwappedWithDeck" }>['data']){
        const currentPlayer = this.gameState.getCurrentPlayer();
        if (currentPlayer && currentPlayer.playerID !== this.gameState.myId) {
            console.log("Regulator swapped with deck:", data);

            for (let i = 0; i < data.asset_count; i++) {
                const assetIndex = currentPlayer.othersHand.indexOf('Asset');
                if (assetIndex > -1) {
                    currentPlayer.othersHand.splice(assetIndex, 1);
                }
            }

            for (let i = 0; i < data.liability_count; i++) {
                const liabilityIndex = currentPlayer.othersHand.indexOf('Liability');
                if (liabilityIndex > -1) {
                    currentPlayer.othersHand.splice(liabilityIndex, 1);
                }
            }
            this.gameManager.otherCards();
        }
    }

    gameEnded(data: Extract<UniqueResponse, { action: "GameEnded" }>['data']) {
        
        console.log("Game ended!", data.scores);
        const player = this.gameState.getLocalPlayer();
        const marketState = this.gameState.marketState!;
        const score = data.scores;
        console.log(player.assetList);

        this.uiManager.displayPurpleCards(player, marketState,
            (color) => { this.networkManager.sendCommand("MinusIntoPlus", { color: color }); },
            (index) => { this.networkManager.sendCommand("ConfirmAssetAbility",{asset_idx:index}); },
            (index,color) => {this.networkManager.sendCommand("ChangeAssetColor",{ asset_idx: index, color: color }); },
            (index) => {this.networkManager.sendCommand("SilverIntoGold",{asset_idx: index})}
        );
        
        this.uiManager.popUpManager.displayEndGameScores(data.scores);
        this.uiManager.showScreen('purpleCards');
        
        //this.uiManager.gameEnded(data.scores);
    }
}

export default ServerEventManager;