import Player from './Player.js';
import Asset from './Asset.js';
import Liability from './Liability.js';
import { Group } from 'tweedle.js';

/*
Dark Indigo (Walls)	#2a2d3a	A deep, desaturated blue. Great for large backgrounds.
Rich Maroon (Chairs)	#6b3e4b	Warm, dark red/purple. Perfect for accents or UI elements.
Dark Wood (Table)	#4a2c3a	A very dark, rich brown, similar to the chairs but with less red.
Antique Gold (Trim)	#a68d5e	Your main accent color. Use this for borders, highlights, and buttons.
Parchment (UI)	#f2e8d5	A warm, off-white for text and the "place card" backgrounds.
Warm Light (Glow)	#f5e5a6	Use for light sources (like the chandelier) and hover effects.
*/

class GameManager {

    constructor(gameState, uiManager, networkManager) {
        
        this.gameState = gameState;
        this.uiManager = uiManager;
        this.networkManager = networkManager;
        this.app = uiManager.app;

        this.activePopup = null;

        this.uiManager.app.ticker.add(() => {
            Group.shared.update();
        });

        this.gameState.currentPhase = 'lobby';

        window.addEventListener('beforeunload', (event) => {
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
    initLobby() {
        this.uiManager.showScreen('login');
        
        this.uiManager.displayGameName(this.uiManager.loginContainer);
        const nameBox = this.uiManager.createNametBox();
        const channelBox = this.uiManager.createChannelBox();

        const joinGame = () => {
            const username = nameBox.value;
            const channel = channelBox.value;
            if (!username) return;
            this.networkManager.sendCommand("Connect", { "username": username, "channel": channel });
            this.gameState.username = username;
            this.uiManager.showScreen('lobby');
        };

        this.uiManager.createJoinButton(joinGame);

        this.uiManager.showMarket({
            "title": "Stable Market",
            "rfr": 0,
            "mrp": 0,
            "Yellow": "Zero",
            "Blue": "Zero",
            "Green": "Zero",
            "Purple": "Zero",
            "Red": "Zero",
        });
        
    }

    
    startTurnPlayerVisibilty() {
        let player = this.gameState.getCurrentPlayer();

        this.gameState.currentPhase = 'picking';

        if (player.playerID == this.gameState.myId) { // Use player.playerID for comparison
            this.uiManager.anounceCharacter(this.uiManager.pickingContainer,player);
            this.showLocalPlayerPicking(player);
            
        } else {
            this.otherPlayerScreenSetup(player);
            this.uiManager.anounceCharacter(this.uiManager.elseTurnContainer,player);
        }
        this.updateUI();
    }
    showLocalPlayerPicking(player){
        this.uiManager.showScreen('picking');
        this.uiManager.displayTempCards(player);
        this.uiManager.statsText.text = `${player.name} is ${player.character.name} and is picking cards`;
        this.uiManager.pickingContainer.addChild(this.uiManager.handContainer);
        player.positionCardsInHand();

        //this.uiManager.createAssetDeck(() => this.networkManager.sendCommand("DrawCard", { "card_type": "Asset" }));
        //this.uiManager.createLiabilityDeck(() => this.networkManager.sendCommand("DrawCard", { "card_type": "Liability" }));
    }
    otherPlayerScreenSetup(player){
        this.uiManager.showScreen('elseTurn');
        this.uiManager.elseTurnContainer.removeChildren();
        this.uiManager.playedCardsContainer.removeChildren();

        this.otherCards();

        this.uiManager.displayAllPlayerStats(this.gameState.players, this.uiManager.elseTurnContainer, player);
        this.uiManager.displayPlayerCharacter(player, this.uiManager.elseTurnContainer, (character) => {
            this.networkManager.sendCommand("UseAbility", { "target_player_id": player.playerID });
        });
        this.uiManager.displayRevealedCharacters(this.gameState.players, this.uiManager.elseTurnContainer);
    }
    switchToMainPhase() {
        this.uiManager.showScreen('main');

        this.uiManager.mainContainer.removeChildren();
        this.uiManager.handContainer.removeChildren();
        this.uiManager.playedCardsContainer.removeChildren();

        this.uiManager.createNextTurnButton(() => this.networkManager.sendCommand("EndTurn"));
        this.uiManager.displayAllPlayerStats(this.gameState.players, this.uiManager.mainContainer, this.gameState.getCurrentPlayer());

        this.uiManager.displayPlayerCharacter(
            this.gameState.getCurrentPlayer(),
            this.uiManager.mainContainer,
            () => {
                this.networkManager.sendCommand("UseAbility");
            }
        );
        
        this.uiManager.displayRevealedCharacters(this.gameState.players, this.uiManager.mainContainer);

        const currentPlayer = this.gameState.getCurrentPlayer();
        currentPlayer.hand.forEach(card => {
            this.uiManager.handContainer.addChild(card.sprite);
        });

        this.updateHandPlayability();
        
        this.uiManager.statsText.text = `assets:${currentPlayer.playableAssets}, liablities: ${currentPlayer.playableLiabilities}, cash: ${currentPlayer.cash}`;
        this.uiManager.handContainer.sortChildren();
        this.uiManager.displayPlayerPlayedCards(currentPlayer.assetList,currentPlayer.liabilityList);

        this.uiManager.mainContainer.addChild(this.uiManager.handContainer, this.uiManager.playedCardsContainer);
        this.updateUI();
    }
    youEndedTurn(){
        const currentPlayer = this.gameState.getCurrentPlayer();
        currentPlayer.hand.forEach(card => {
            card.makeUnplayable();
        });
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
        this.uiManager.elseTurnContainer.addChild(this.uiManager.playedCardsContainer);
        this.uiManager.displayOtherPlayerHand(assets, liabilities);
        this.uiManager.displayPlayerPlayedCards(currentPlayer.assetList,currentPlayer.liabilityList);
    
    }
    async messageStartGame(data) {
        console.log("Received StartGame data from server:", data);
        
        this.gameState.players = []; 
        this.gameState.myId = data.id;
        let localPlayer = new Player(this.gameState.username, data.id,this.app);
        localPlayer.reveal = true;
        localPlayer.cash = data.cash;

        this.gameState.players.push(localPlayer);

        this.initPlayers(data.player_info);

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
            this.setupCardInteractions(newCard);
                    

            localPlayer.addCardToHand(newCard);
            this.uiManager.handContainer.addChild(newCard.sprite);
        }
        
        localPlayer.positionCardsInHand();
        this.uiManager.handContainer.sortChildren(); // Sort initial hand cards
        this.initRound();
    }

    initPlayers(player_info){
        // Initialize all players from player_info
        for (const player_data of player_info) {
            const player = new Player(player_data.name, player_data.id,this.app);
            player.cash = player_data.cash;
            player.othersHand = player_data.hand;
            this.gameState.players.push(player);
        }
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

    setupCardInteractions(card) {
        const localPlayer = this.gameState.getLocalPlayer();

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
    makeCardDiscardable(newCard){
        const currentPlayer = this.gameState.getCurrentPlayer();
        newCard.sprite.on('cardDiscarded', (discardCard) => {
            const cardIndex = currentPlayer.hand.indexOf(discardCard);
            this.networkManager.sendCommand("PutBackCard", { card_idx: cardIndex });
                /*this.uiManager.tempCardsContainer.removeChild(discardedCard.sprite);
                this.uiManager.tempCardsContainer.removeChild(discardedCard.discardButton);
                currentPlayer.tempHand.splice(cardIndex, 1);
                currentPlayer.positionTempCards();*/

                /*if (currentPlayer.tempHand.length === currentPlayer.maxKeepCards) {
                    // When the number of cards in temp hand equals the max cards to keep,
                    // it implies the player has made their choice.
                    // We can now inform the server which cards are being kept.
                    const keptCardIndices = currentPlayer.tempHand.map(card => currentPlayer.hand.length + currentPlayer.tempHand.indexOf(card));
                    this.networkManager.sendCommand("PutBackCard", { kept_card_indices: keptCardIndices });
                }*/
            
        });
    }
    async youDrewCard(data) {
        console.log("You Drew Card:", data);
        const cardData = data.card;
        const currentPlayer = this.gameState.getCurrentPlayer();
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

        newCard.isTemporary = true;
        this.setupCardInteractions(newCard); // Sets up the click and hover events
        this.makeCardDiscardable(newCard);

        currentPlayer.addCardToHand(newCard);
        this.uiManager.displayTempCards(currentPlayer);

        if (data.can_draw_cards === false && data.can_give_back_cards === false) {
            currentPlayer.hand.forEach(card => {
                card.isTemporary = false;
                this.uiManager.handContainer.addChild(card.sprite);
                this.switchToMainPhase();
                if (card.discardButton) {
                    this.uiManager.tempCardsContainer.removeChild(card.discardButton);
                }
            });
            // After moving cards, if there are no more to draw, switch to the main phase.
            if (currentPlayer.drawableCards === 0) {
                this.switchToMainPhase();
            }
            //this.youPutBackCard({ kept_cards: [] }); // Passing empty array to avoid errors, as cards are already moved.
        }
    }
    async drewCard(data){
        const currentPlayer = this.gameState.getCurrentPlayer();
        if (currentPlayer && currentPlayer.playerID !== this.gameState.myId) {
            console.log("Drew Card:", data);
            currentPlayer.othersHand.push(data.card_type);
            this.otherCards();
        }
    }
    youPutBackCard(data) {
        const localPlayer = this.gameState.getLocalPlayer();
        if (!localPlayer) return;
        
        const cardIndex = data.card_idx;
        const card = localPlayer.hand[cardIndex];
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
            this.switchToMainPhase();
        }
      
    }
    putBackCard(data){
        const currentPlayer = this.gameState.getPlayerById(data.player_id);
        
        
        if (currentPlayer && currentPlayer.playerID != this.gameState.myId) {
            console.log("Other player put back a card:", data);

            currentPlayer.othersHand.splice(currentPlayer.othersHand.indexOf(data.card_type),1)
            this.otherPlayerScreenSetup(currentPlayer);
        }
    }
    newPlayer(data) {
        this.uiManager.showScreen('lobby');
        //this.uiManager.statsText.text = `${data.usernames.length} / 4 Players`;
        this.gameState.players = []; 

        data.usernames.forEach((username, index) => {
            const player = new Player(username, index,this.app);
            this.gameState.players.push(player);
        });
        this.uiManager.displayLobbyPlayers(this.gameState.players, () => {
            this.networkManager.sendCommand("StartGame");
        });
        
    }

    chairmanSelectCharacter(data){ 
        this.uiManager.showScreen("character");
        this.gameState.resetForNewRound();

        const currentPlayer = this.gameState.getPlayerById(data.chairman_id); 
        this.uiManager.statsText.text = `${currentPlayer.name} is choosing their character`;
        currentPlayer.isChaiman = true;
        console.log("Received selectable characters:", data);

        this.gameState.openCharacters = this.gameState.characters.filter(character =>
            data.open_characters.includes(character.textureName)
        );
        

        if (currentPlayer.playerID === this.gameState.myId) {
            this.gameState.faceUpCharacters = this.gameState.characters.filter(character =>
                data.selectable_characters.includes(character.textureName)
            );
            let closedCharacter = this.gameState.characters.filter(character =>
                data.closed_character.includes(character.textureName)
            );
            console.log(closedCharacter);

            this.uiManager.displayCharacterSelection(
                this.gameState.faceUpCharacters,
                this.gameState.openCharacters,
                (character) => {
                    this.networkManager.sendCommand("SelectCharacter", { "character": character.textureName });
                    console.log(`Selected character: ${character.textureName}`);
                    this.uiManager.characterCardsContainer.removeChildren();
                }, 
                closedCharacter);
        }
        
        

    }

    receiveSelectableCharacters(data) {
        this.uiManager.showScreen('character');
        if(data.currently_picking_id == null){ // is this still nececery?
            return;
        }
        console.log("Received selectable characters:", data);
        
        const currentPlayer = this.gameState.getPlayerById(data.currently_picking_id);
        this.uiManager.statsText.text = `${currentPlayer.name} is choosing their character`;
        if (currentPlayer.playerID === this.gameState.myId) {
            this.gameState.faceUpCharacters = this.gameState.characters.filter(character =>
                data.selectable_characters.includes(character.textureName)
            );

            this.uiManager.displayCharacterSelection(this.gameState.faceUpCharacters, this.gameState.openCharacters, (character) => {
                this.networkManager.sendCommand("SelectCharacter", { "character": character.textureName });
                console.log(`Selected character: ${character.textureName}`);
                this.uiManager.characterCardsContainer.removeChildren();
            });
        } else {
            console.log("Not player's turn for character selection.");
           
        }
    }
    youSelectedCharacter(data) {
        // This function might be used to confirm your character selection
        const localPlayer = this.gameState.getLocalPlayer();
        if (localPlayer) {
            localPlayer.character = this.gameState.characters.find(c => c.textureName === data.character);
            console.log(`Local player ${localPlayer.name} selected ${localPlayer.character.name}`);
        }
    }
    turnStarts(data) {
        console.log("Received TurnStart data from server:", data);

        const drawableCards = data.draws_n_cards;
        const recieveCash = data.player_turn_cash;
        const playableAssets = data.playable_assets.total;
        const playableLiabilities = data.playable_liabilities;
       
        const nextPlayerIndex = this.gameState.players.findIndex(p => p.playerID == data.player_turn);

        if (nextPlayerIndex !== -1) {
            this.gameState.setCurrentPlayerIndex(nextPlayerIndex);
            const currentPlayer = this.gameState.getCurrentPlayer();
            const character = this.gameState.characters.find(c => c.textureName === data.player_character);
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

            this.uiManager.statsText.text = `${currentPlayer.name}'s turn`; // `${player.name} is ${player.character.name} and is picking cards`;
            
            
            this.startTurnPlayerVisibilty();

        } else {
            console.error(`Player with ID ${data.player_turn} not found.`);
        }
      
    }
   
    youBoughtAsset(data){
        const player = this.gameState.getLocalPlayer();
        if (!player) return;

        const card = player.hand.find(c => c.title === data.asset.title && c.gold === data.asset.gold_value && c.silver === data.asset.silver_value);
        if (!card) return;

        const cardIndex = player.hand.indexOf(card);
        if (cardIndex === -1) return;
        if (data.market_change) {
            this.uiManager.showMarket(data.market_change.new_market);
        }

        player.cash -= card.gold;
        player.gold += card.gold;
        player.silver += card.silver;
        player.assetList.push(card);
        player.hand.splice(cardIndex, 1);
        player.playableAssets--;

        player.positionCardsInHand();
        player.positionAssetsToPile();
        this.uiManager.addCardToPlayedContainer(card);
        
        this.updateHandPlayability();
        this.uiManager.statsText.text = `assets:${player.playableAssets}, liablities: ${player.playableLiabilities}, cash: ${player.cash}`;
        this.updateUI();
      
    }
    async boughtAsset(data){
        if (data.market_change) {
            this.uiManager.showMarket(data.market_change.new_market);
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
            player.othersHand.splice(assetIndex,1);
            //this.uiManager.playedCardsContainer.addChild(newCard.sprite); // make this into a function 
            this.otherCards();
            this.uiManager.displayAllPlayerStats(this.gameState.players, this.uiManager.elseTurnContainer, this.gameState.getCurrentPlayer());
            this.updateUI();
            this.networkManager.notifyComman
        }
    }
    youIssuedLiability(data){
        const player = this.gameState.getLocalPlayer();
        if (!player) return;

        const card = player.hand.find(c => c.title === data.liability.rfr_type && c.gold === data.liability.value);
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
        this.uiManager.addCardToPlayedContainer(card);
        
        this.updateHandPlayability();
        this.uiManager.statsText.text = `assets:${player.playableAssets}, liablities: ${player.playableLiabilities}, cash: ${player.cash}`;
        
        this.updateUI();
       
    }
    youRedeemedLiability(data){
        const player = this.gameState.getLocalPlayer();
        if (!player) return;
        
        const card = player.liabilityList[data.liability_idx];
        if (!card) return;

        player.cash -= card.gold;
        player.liabilityList.splice(data.liability_idx, 1);
        player.playableLiabilities--;

        player.positionLiabilitiesToPile();
        
        this.updateHandPlayability();
        this.uiManager.statsText.text = `assets:${player.playableAssets}, liablities: ${player.playableLiabilities}, cash: ${player.cash}`;
        
        this.updateUI();
    }
    redeemedLiability(data){
        const player = this.gameState.getCurrentPlayer();
        if (player && player.playerID !== this.gameState.myId) {
            const liability = player.liabilityList[data.liability_idx];
            player.liabilityList.splice(data.liability_idx, 1); // remove liability from player
            player.cash -= liability.gold;
            
            player.positionLiabilitiesToPile();
            this.otherCards();
            this.updateUI();
            
        }
    }
    async issuedLiability(data){
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
            player.positionLiabilitiesToPile();
            player.othersHand.splice(liabilityIndex,1);
            //this.uiManager.playedCardsContainer.addChild(newCard.sprite); // make this a function like displayOtherPlayerHand
            this.otherCards();
            this.updateUI();
            
        }
    }

    async youAreFiringSomeone(data) {
            let characters = this.gameState.characters.filter(character => data.characters.includes(character.textureName));

            this.activePopup = await this.uiManager.StakeholdersPerk(
                this.uiManager.mainContainer, // Or the active container
                characters,
                (charToFire) => this.networkManager.sendCommand("FireCharacter", { "character": charToFire.textureName }));
    }
    youFiredCharacter(data){
        if (this.activePopup) {
            this.activePopup.destroy({ children: true });
            this.activePopup = null;
        }

        this.switchToMainPhase();
    }
    firedCharacter(data){
        const localPlayer = this.gameState.getLocalPlayer();
        let character = this.gameState.characters.find(character => data.character.includes(character.textureName));
        this.uiManager.firedCharacter(character,localPlayer)
    }
    youCharacterAbility(data){
        let character = this.gameState.characters.find(character => data.character.includes(character.textureName));
        let perk = data.perk;
        this.uiManager.youCharacterAbility(character,perk)
    }
    youAreDivesting(data){
        console.log("You are divesting:", data.options);

        
        const divestmentTargets = data.options.map(option => {
            const player = this.gameState.getPlayerById(option.player_id);
            if (!player) return null;
            
            const divestibleAssets = [];
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
        }).filter(target => target && target.assets.length > 0);
        console.log(divestmentTargets)
        this.uiManager.youAreDivesting(
            this.uiManager.mainContainer,
            divestmentTargets,
            (playerID,cardID) => {
                    this.networkManager.sendCommand("DivestAsset", { "target_player_id": playerID,"card_idx":cardID });
                    console.log("Here")
                }
        );
    }
    youDivestedAnAsset(data){
        if (this.activePopup) {
            this.activePopup.destroy({ children: true });
            this.activePopup = null;
        }

        this.switchToMainPhase();
    }
    youAreTerminatingSomeone(data){

    }
    youRegulatorOptions(data){
        console.log(data);
        let options = data.options;
        let perk = data.perk;
        this.uiManager.youRegulatorOptions(
            this.uiManager.mainContainer,
            options,perk,
            this.gameState,
            (playerID)=>{
                this.networkManager.sendCommand("SwapWithPlayer", { "target_player_id": playerID });
                    //this.activePopup.destroy({ children: true });
                    this.activePopup = null;
                    this.switchToMainPhase();
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
    async swapedWithPlayer(data){
        console.log("swapedWithPlayer:", data);
        if (this.activePopup) {
            this.activePopup.destroy({ children: true });
            this.activePopup = null;
        }

        reg = this.gameState.players.find(p, p.playerID === data.regulator_id);
        tar = this.gameState.players.find(p, p.playerID === data.target_id);
        let temphand = reg.hand;
        reg.hand = tar.hand;
        tar.hand = temphand;
        
        this.switchToMainPhase();
    }

    async youSwapPlayer(data){
        console.log("youSwapPlayer:", data);
        if (this.activePopup) {
            this.activePopup.destroy({ children: true });
            this.activePopup = null;
        }

        await this._updateHandFromServer(data.new_cards);
        this.switchToMainPhase();
    }
    async regulatorSwapedYourCards(data){
        console.log("regulatorSwapedYourCards:", data);
        // This function is called on the player whose cards were taken.
        // We'll update their hand with the new cards they received.
        await this._updateHandFromServer(data.new_cards);

        const regulatorPlayer = this.gameState.getCurrentPlayer();

        // Show a notification that the swap happened.
        // The popup will appear on the main screen if it's your turn,
        // or the 'else turn' screen if it's not.
        const container = this.gameState.myId === regulatorPlayer.playerID
            ? this.uiManager.mainContainer
            : this.uiManager.elseTurnContainer;
        if (this.gameState.myId !== regulatorPlayer.playerID) {
            this.uiManager.displayRegulatorSwapNotification(container, regulatorPlayer);
        }
    }
    youSwapDeck(data) {
        console.log("youSwapDeck:", data);
        if (this.activePopup) {
            this.activePopup.destroy({ children: true });
            this.activePopup = null;
        }
    
        const localPlayer = this.gameState.getLocalPlayer();
        if (!localPlayer) return;
    
        // Set how many cards the player needs to draw and switch to the picking screen.
        localPlayer.drawableCards = data.cards_to_draw;
        this.uiManager.showScreen('picking');
        this.uiManager.statsText.text = `Your turn: Draw ${localPlayer.drawableCards} cards.`;
        this.uiManager.displayTempCards(localPlayer);
        this.uiManager.pickingContainer.addChild(this.uiManager.handContainer);
        localPlayer.positionCardsInHand();
    }
    swapedWithDeck(data){
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
            this.otherCards();
        }
    }

    async _updateHandFromServer(newCardsData) {
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
            this.setupCardInteractions(newCard);
            localPlayer.addCardToHand(newCard);
            this.uiManager.handContainer.addChild(newCard.sprite);
        }
    }

    /**
    * @param {Object} data - The data received from the server.
    * @param {Object.<number, number>} data.scores - Map of playerid (integers) to scores (numbers).
    */
    gameEnded(data) {
        const names = this.gameState.players.map(p => p.name);
        
        // const scores = data.scores;
        console.log("Game ended!");
        
        const scores = Object.entries(data.scores).map(([id, score]) => {
            
            const player = this.gameState.getPlayerById(parseInt(id));
            console.log(`${player.name}: ${scores[id]}`);
          
            return {
                name: player.name,
                score
            }
        });
        
        this.uiManager.showScreen('results');
        
        this.uiManager.gameEnded(scores, names);
    }
}

export default GameManager;
