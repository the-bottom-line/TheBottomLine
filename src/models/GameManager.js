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
    }
    startTurnPlayerVisibilty() {
        let player = this.gameState.getCurrentPlayer();

        this.gameState.currentPhase = 'picking';

        if (player.playerID == this.gameState.myId) { // Use player.playerID for comparison
            this.showLocalPlayerPicking(player);
        } else {
            this.otherPlayerScreenSetup();
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
    otherPlayerScreenSetup(){
        this.uiManager.showScreen('elseTurn');
        this.uiManager.elseTurnContainer.removeChildren();
        this.uiManager.playedCardsContainer.removeChildren();

        this.otherCards();

        this.uiManager.displayAllPlayerStats(this.gameState.players, this.uiManager.elseTurnContainer, this.gameState.getCurrentPlayer());
        this.uiManager.displayPlayerCharacter(this.gameState.getCurrentPlayer(),this.uiManager.elseTurnContainer );
        this.uiManager.displayRevealedCharacters(this.gameState.players, this.uiManager.elseTurnContainer);
    }
    switchToMainPhase() {
        this.uiManager.showScreen('main');

        this.uiManager.mainContainer.removeChildren();
        this.uiManager.handContainer.removeChildren();
        this.uiManager.playedCardsContainer.removeChildren();

        this.uiManager.createNextTurnButton(() => this.networkManager.sendCommand("EndTurn"));
        this.uiManager.displayAllPlayerStats(this.gameState.players, this.uiManager.mainContainer, this.gameState.getCurrentPlayer());
        this.uiManager.displayPlayerCharacter(this.gameState.getCurrentPlayer(),this.uiManager.mainContainer);
        this.uiManager.displayRevealedCharacters(this.gameState.players, this.uiManager.mainContainer);

        const currentPlayer = this.gameState.getCurrentPlayer();
        currentPlayer.hand.forEach(card => {
            card.makePlayable();
            this.uiManager.handContainer.addChild(card.sprite);
        });
        currentPlayer.positionCardsInHand();
        
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
        let localPlayer = new Player(this.gameState.username, data.id);
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
            this.makeCardPlayable(newCard);
                    

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
            const player = new Player(player_data.name, player_data.id);
            player.cash = player_data.cash;
            player.othersHand = player_data.hand;
            this.gameState.players.push(player);
        }
    }
    makeCardPlayable(newCard){
        const localPlayer = this.gameState.getLocalPlayer();
        /*if (newCard.sprite.eventNames().includes('cardPlayed')) {
            return; // Prevent adding duplicate listeners
        }*/

        newCard.sprite.on('mousedown', () => { 
                const cardIndex = localPlayer.hand.indexOf(newCard); // Assuming localPlayer is accessible
                if (cardIndex !== -1) {
                    if (newCard instanceof Asset) {
                        this.networkManager.sendCommand("BuyAsset", { card_idx: cardIndex });
                    } else if (newCard instanceof Liability) {                        
                        this.networkManager.sendCommand("IssueLiability", { card_idx: cardIndex });
                    }
                    // The server will send back a message to update the UI
                }
            });
        this.makeCardHoverable(newCard,localPlayer);
    }
    makeCardHoverable(card,player){
        card.sprite.on('cardHover', (hoveredCard) => {
            player.positionCardsInHand(hoveredCard);
        });
        card.sprite.on('cardOut', () => {
            player.positionCardsInHand();
        });
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
        this.makeCardPlayable(newCard);
        this.makeCardDiscardable(newCard);

        currentPlayer.addCardToHand(newCard);
        this.uiManager.displayTempCards(currentPlayer);

        if (data.can_draw_cards === false && data.can_give_back_cards === false) {
            currentPlayer.hand.forEach(card => {
                card.isTemporary = false;
                this.uiManager.handContainer.addChild(card.sprite);
                if (card.discardButton) {
                    this.uiManager.tempCardsContainer.removeChild(card.discardButton);
                }
            });
            //this.youPutBackCard({ kept_cards: [] }); // Passing empty array to avoid errors, as cards are already moved.
        }
    }
    async drewCard(data){
        const currentPlayer = this.gameState.getCurrentPlayer();
        if (currentPlayer && currentPlayer.playerID !== this.gameState.myId) {
            console.log("Drew Card:", data);
            currentPlayer.othersHand.push(data.card_type);
        }
    }
    youPutBackCard(data) {
        const localPlayer = this.gameState.getLocalPlayer();
        if (!localPlayer) return;
        
        const cardIndex = data.card_idx;
        const card = localPlayer.hand[cardIndex];
        console.log(localPlayer.hand, card);
        this.uiManager.tempCardsContainer.removeChild(card.sprite);
        localPlayer.hand.splice(cardIndex,1);


        if (data.can_draw_cards === false && data.can_give_back_cards === false) {
            localPlayer.hand.forEach(card => {
                card.isTemporary = false;
                this.uiManager.handContainer.addChild(card.sprite);
                if (card.discardButton) {
                    this.uiManager.tempCardsContainer.removeChild(card.discardButton);
                }
            });
        }
        this.switchToMainPhase();
    }
    putBackCard(data){
        const currentPlayer = this.gameState.getPlayerById(data.player_id);
        
        
        if (currentPlayer && currentPlayer.playerID != this.gameState.myId) {
            console.log("Other player put back a card:", data);

            currentPlayer.othersHand.splice(currentPlayer.othersHand.indexOf(data.card_type),1)
            this.otherPlayerScreenSetup();
        }
    }
    newPlayer(data) {
        this.uiManager.showScreen('lobby');
        //this.uiManager.statsText.text = `${data.usernames.length} / 4 Players`;
        this.gameState.players = []; 

        data.usernames.forEach((username, index) => {
            const player = new Player(username, index);
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

            this.uiManager.displayCharacterSelection(this.gameState.faceUpCharacters,this.gameState.openCharacters,
                 (character) => {
                this.networkManager.sendCommand("SelectCharacter", { "character": character.textureName });
                console.log(`Selected character: ${character.textureName}`);
                this.uiManager.characterCardsContainer.removeChildren();
            }, closedCharacter);
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

            currentPlayer.playableAssets = 1;
            currentPlayer.playableLiabilities = 1;
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

        player.cash -= card.gold;
        player.gold += card.gold;
        player.silver += card.silver;
        player.assetList.push(card);
        player.hand.splice(cardIndex, 1);
        player.playableAssets--;

        player.positionCardsInHand();
        player.positionAssetsToPile();
        this.uiManager.playedCardsContainer.addChild(card.sprite);
        this.uiManager.displayAllPlayerStats(this.gameState.players, this.uiManager.mainContainer, this.gameState.getCurrentPlayer());
        this.uiManager.statsText.text = `assets:${player.playableAssets}, liablities: ${player.playableLiabilities}, cash: ${player.cash}`;
        this.updateUI();
    }
    async boughtAsset(data){
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
        this.uiManager.playedCardsContainer.addChild(card.sprite);
        this.uiManager.statsText.text = `assets:${player.playableAssets}, liablities: ${player.playableLiabilities}, cash: ${player.cash}`;
        
        this.updateUI();
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

}

export default GameManager;