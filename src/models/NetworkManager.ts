class NetworkManager {
    constructor(url) {
        this.url = url;
        this.queue = [];
        this.messageInTransit = false;
        this.gameManager = null;
        this.commandList = {};
        this.connect(url);
        this.attempts = 0;
        this.timeoutTable = [2, 5, 15, 30, 60];
        this.recentMessages = new Set();
    }

    setGameManager(gameManager) {
        this.gameManager = gameManager;
        this.commandList = {
            "StartGame" : this.gameManager.messageStartGame.bind(this.gameManager),
            "PlayersInLobby" : this.gameManager.newPlayer.bind(this.gameManager),
            "SelectingCharacters": this.gameManager.chairmanSelectCharacter.bind(this.gameManager),
            "YouDrewCard": this.gameManager.youDrewCard.bind(this.gameManager),
            "DrewCard": this.gameManager.drewCard.bind(this.gameManager),
            "YouPutBackCard": this.gameManager.youPutBackCard.bind(this.gameManager),
            "PutBackCard": this.gameManager.putBackCard.bind(this.gameManager),
            "SelectedCharacter" : this.gameManager.receiveSelectableCharacters.bind(this.gameManager),
            "YouSelectedCharacter": this.gameManager.youSelectedCharacter.bind(this.gameManager),
            "TurnStarts": this.gameManager.turnStarts.bind(this.gameManager),
            "YouBoughtAsset": this.gameManager.youBoughtAsset.bind(this.gameManager),
            "BoughtAsset":this.gameManager.boughtAsset.bind(this.gameManager),
            "YouIssuedLiability":this.gameManager.youIssuedLiability.bind(this.gameManager),
            "IssuedLiability":this.gameManager.issuedLiability.bind(this.gameManager),
            "YouRedeemedLiability":this.gameManager.youRedeemedLiability.bind(this.gameManager),
            "RedeemedLiability":this.gameManager.redeemedLiability.bind(this.gameManager),
            "YouEndedTurn": this.gameManager.youEndedTurn.bind(this.gameManager),
            "YouAreFiringSomeone": this.gameManager.youAreFiringSomeone.bind(this.gameManager),
            "YouFiredCharacter": this.gameManager.youFiredCharacter.bind(this.gameManager),
            "FiredCharacter": this.gameManager.firedCharacter.bind(this.gameManager),
            "YouCharacterAbility": this.gameManager.youCharacterAbility.bind(this.gameManager),
            "YouAreDivesting":this.gameManager.youAreDivesting.bind(this.gameManager),
            "YouDivestedAnAsset": this.gameManager.youDivestedAnAsset.bind(this.gameManager),
            "YouAreTerminatingSomeone": this.gameManager.youAreTerminatingSomeone.bind(this.gameManager),
            "YouRegulatorOptions":this.gameManager.youRegulatorOptions.bind(this.gameManager),
            "YouSwapPlayer":this.gameManager.youSwapPlayer.bind(this.gameManager),
            "SwapedWithPlayer":this.gameManager.swapedWithPlayer.bind(this.gameManager),  
            "RegulatorSwapedYourCards":this.gameManager.regulatorSwapedYourCards.bind(this.gameManager),
            "YouSwapDeck": this.gameManager.youSwapDeck.bind(this.gameManager),
            "SwapedWithDeck": this.gameManager.swapedWithDeck.bind(this.gameManager),
            "GameEnded": this.gameManager.gameEnded.bind(this.gameManager)
        };
    }

    // Sets up the connection with to Websocket the websocket at url
    connect(url) {
        console.log("Attempting to connect to server...");
        this.connection = new WebSocket(url);

        // Incoming message protocol
        this.connection.addEventListener('message', (msg) => {
            console.log(msg);
            this.messageInTransit = false;
            this.recentMessages.clear();
            this.handleMessage(msg);
        });

        // Connection opened protocol
        this.connection.addEventListener("open", () => {
            console.log("Connected");
            this.attempts = 0;

            this.flushQueue();
        });

        // Connection closed protocol
        this.connection.addEventListener("close", () => {
            let timeout = this.timeoutTable[this.attempts];
            console.warn("Connection has closed, retrying after " + timeout + " seconds...");
            setTimeout(() => this.connect(this.url), 1000 * timeout);
            if (this.attempts < this.timeoutTable.length - 1) {
                this.attempts += 1;
            }
        })
    }

    // Sends all messages stored in queue
    flushQueue() {
        this.queue.forEach(msg => {this.connection.send(msg);});
        this.queue = [];
    }

    // Couples a received message to corresponding command,
    // Echoes and otherwise ignores the received command if not found
    handleMessage(msg) {
        let parsedMessage = JSON.parse(msg.data);
        let invokedCommand = this.commandList[parsedMessage.action];
        if (invokedCommand) {
            invokedCommand(parsedMessage.data);
        } else {
            console.warn("Unknown command:" + parsedMessage.action);
        }
    }

    // Attempts to send a message, if connection is closed will store messages in queue
    // Will discard duplicate messages or messages sent before a response has been returned by the server
    sendMessage(data) {
        if (this.connection.readyState == WebSocket.OPEN) {
            // Catch and reject duplicate messages
            if (this.messageInTransit || this.recentMessages.has(data)) {
                console.error("Rejected duplicate message: " + data);
                return;
            }

            this.messageInTransit = true;
            this.recentMessages.add(data);
            this.connection.send(data);
        } else {
            this.queue.push(data);
        }
    }

    // Creates a structured message with a given command and data
    sendCommand(command, data) {
        let packet = {
            "action" : command,
            "data" : data
        }
        let jsonData = JSON.stringify(packet, null, 0);
        console.log(jsonData);
        this.sendMessage(jsonData);
    }
}

export default NetworkManager;