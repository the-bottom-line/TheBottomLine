import type { Connect, DirectResponse, FrontendRequest, UniqueResponse } from "@shared-types";
import type GameManager from "./GameManager.js";

type NetworkResponse = MessageEvent<string>;
export type IncomingResponse = DirectResponse | UniqueResponse;

type Action = IncomingResponse["action"];

// Build a handler map that MUST contain all actions
type HandlerMap = {
    [A in Action]: (resp: Extract<IncomingResponse, { action: A }>) => void;
};

type OutgoingRequest = Connect | FrontendRequest;

// Helper type to extract data for a specific action request
type ExtractData<T extends OutgoingRequest['action']> = Extract<OutgoingRequest, { action: T }> extends { data: infer D } ? D : never;

// Helper type to check if an action has data
type HasData<T extends OutgoingRequest['action']> = Extract<OutgoingRequest, { action: T }> extends { data: ExtractData<T> } ? true : false;

class NetworkManager {
    url: string;
    connection?: WebSocket;
    gameManager?: GameManager;
    commandList?: HandlerMap;
    queue: string[] = [];
    messageInTransit = false;
    attempts = 0;
    timeoutTable = [2, 5, 15, 30, 60];
    recentMessages = new Set();
    
    constructor(url: string) {
        this.url = url;
        this.connect(url);
    }

    setGameManager(gameManager: GameManager) {
        this.gameManager = gameManager!;
        this.commandList = {
            Error: r => this.gameManager!.serverEventManager.error(r.data),
            YouJoinedGame: r => this.joinSuccess(r.data),
            YouRejoined: _ => this.gameManager!.serverEventManager.rejoinGame(),
            Rejoined: r => this.gameManager!.serverEventManager.playerRejoined(r.data),
            YouResynced: r => this.gameManager!.serverEventManager.resync(r.data),
            PlayersInLobby: r => this.gameManager!.serverEventManager.newPlayer(r.data),
            StartGame: r => this.gameManager!.serverEventManager.messageStartGame(r.data),
            SelectingCharacters: r => this.gameManager!.serverEventManager.chairmanSelectCharacter(r.data),
            SelectedCharacter: r => this.gameManager!.serverEventManager.receiveSelectableCharacters(r.data),
            TurnStarts: r => this.gameManager!.serverEventManager.turnStarts(r.data),
            DrewCard: r => this.gameManager!.serverEventManager.drewCard(r.data),
            PutBackCard: r => this.gameManager!.serverEventManager.putBackCard(r.data),
            BoughtAsset: r => this.gameManager!.serverEventManager.boughtAsset(r.data),
            IssuedLiability: r => this.gameManager!.serverEventManager.issuedLiability(r.data),
            RedeemedLiability: r => this.gameManager!.serverEventManager.redeemedLiability(r.data),
            ShareholderIsFiring: _ => { }, // TODO: implement
            FiredCharacter: r => this.gameManager!.serverEventManager.firedCharacter(r.data),
            RegulatorSwappedYourCards: r => this.gameManager!.serverEventManager.regulatorSwappedYourCards(r.data),
            SwappedWithPlayer: r => this.gameManager!.serverEventManager.swappedWithPlayer(r.data),
            SwappedWithDeck: r => this.gameManager!.serverEventManager.swappedWithDeck(r.data),
            AssetDivested: r => this.gameManager!.serverEventManager.assetDivested(r.data),
            TurnEnded: () => { }, // TODO: handle
            GameEnded: r => this.gameManager!.serverEventManager.gameEnded(r.data),
            YouStartedGame: () => { }, // TODO: handle
            YouSelectedCharacter: r => this.gameManager!.serverEventManager.youSelectedCharacter(r.data),
            YouFiredCharacter: r => this.gameManager!.serverEventManager.youFiredCharacter(r.data),
            YouRegulatorOptions: r => this.gameManager!.serverEventManager.youRegulatorOptions(r.data),
            YouSwapDeck: r => this.gameManager!.serverEventManager.youSwapDeck(r.data), // Fix: Added '!' for definite assignment
            YouSwapPlayer: r => this.gameManager!.serverEventManager.youSwapPlayer(r.data),
            YouAreDivesting: r => this.gameManager!.serverEventManager.youAreDivesting(r.data),
            YouDrewCard: r => this.gameManager!.serverEventManager.youDrewCard(r.data),
            YouPutBackCard: r => this.gameManager!.serverEventManager.youPutBackCard(r.data),
            YouCharacterAbility: r => this.gameManager!.serverEventManager.youCharacterAbility(r.data),
            YouBoughtAsset: r => this.gameManager!.serverEventManager.youBoughtAsset(r.data),
            YouIssuedLiability: r => this.gameManager!.serverEventManager.youIssuedLiability(r.data),
            YouAreFiringSomeone: r => this.gameManager!.serverEventManager.youAreFiringSomeone(r.data),
            YouDivestedAnAsset: r => this.gameManager!.serverEventManager.youDivestedAnAsset(r.data),
            YouAreTerminatingSomeone: r => this.gameManager!.serverEventManager.youAreTerminatingSomeone(r.data), // Fix: Added '!' for definite assignment
            YouRedeemedLiability: r => this.gameManager!.serverEventManager.youRedeemedLiability(r.data),
            YouEndedTurn: _ => this.gameManager!.playerActionManager.youEndedTurn(),
            YouMinusedIntoPlus: r => this.gameManager!.serverEventManager.youMinusedIntoPlus(r.data),
            MinusedIntoPlus: r => this.gameManager!.serverEventManager.minusedIntoPlus(r.data),
            YouSilveredIntoGold: () => { }, // TODO: handle
            YouChangedAssetColor: () => { }, // TODO: handle
            YouConfirmedAssetAbility: () => { }, // TODO: handle
            SilveredIntoGold: _ => { }, // TODO: handle
            ChangedAssetColor: _ => { }, // TODO: handle 
            ConfirmedAssetAbility: _ => { }, // TODO: handle
            YouTerminateCreditCharacter: _ => { }, // TODO: handle
            SelectedCardsBankerTarget: _ => { }, // TODO: handle
            YouSelectCardBankerTarget: r => this.gameManager!.serverEventManager.youSelectCardBankerTarget(r.data),
            TerminatedCreditCharacter: r => this.gameManager!.serverEventManager.terminatedCreditCharacter(r.data),
            PlayerTargetedByBanker: r => this.gameManager!.serverEventManager.playerTargetedByBanker(r.data),
            YouPaidBanker: r => this.gameManager!.serverEventManager.youPaidBanker(r.data),
            PlayerPaidBanker: r => this.gameManager!.serverEventManager.playerPaidBanker(r.data),
            PlayerGotBonusCash: r => this.gameManager!.serverEventManager.playerGotBonusCash(r.data),
            YouBonusCash: r => this.gameManager!.serverEventManager.youBonusCash(r.data),
        };
    }
    

    // Sets up the connection with to Websocket the websocket at url
    connect(url: string) {
        console.log("Attempting to connect to server...");
        this.connection = new WebSocket(url);

        // Incoming message protocol
        this.connection.addEventListener('message', (msg: NetworkResponse) => {
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
            const timeout = this.timeoutTable[this.attempts]!;
            console.warn("Connection has closed, retrying after " + timeout + " seconds...");
            setTimeout(() => this.connect(this.url), 1000 * timeout);
            if (this.attempts < this.timeoutTable.length - 1) {
                this.attempts += 1;
            }
        })
    }

    // Sends all messages stored in queue
    flushQueue() {
        this.queue.forEach(msg => {this.connection!.send(msg);});
        this.queue = [];
    }
    
    // helper function that provides type-safe wrapper around calling a command from the
    // `commandList`. Can't really figure out a way to just use one function.
    callHandler<A extends Action>(
        action: A,
        message: IncomingResponse
    ): void {
        const handler = this.commandList![action];
        handler(message as Extract<IncomingResponse, { action: A }>);
    }

    handleMessage(msg: NetworkResponse) {
        const parsedMessage: IncomingResponse = JSON.parse(msg.data);
        this.callHandler(parsedMessage.action, parsedMessage)
    }

    // Attempts to send a message, if connection is closed will store messages in queue
    // Will discard duplicate messages or messages sent before a response has been returned by the server
    sendMessage(data: string) {
        if (this.connection!.readyState == WebSocket.OPEN) {
            // Catch and reject duplicate messages
            if (this.recentMessages.has(data)) {
                console.warn("Rejected duplicate message: " + data);
                return;
            }
            if (this.messageInTransit) {
                console.warn("Previous message still in transit...");
            }

            this.messageInTransit = true;
            this.recentMessages.add(data);
            this.connection!.send(data);
        } else {
            this.queue.push(data);
        }
    }
    
    sendCommand<T extends OutgoingRequest['action']>(
        command: T,
        ...args: HasData<T> extends true ? [data: ExtractData<T>] : [data?: never]
    ): void {
        const packet = {
            "action": command,
            "data": args[0],
        };
        const jsonData = JSON.stringify(packet, null, 0);
        console.log(jsonData);
        this.sendMessage(jsonData);
    }

    // Handles a successful join and sets up a cookie containing the returned information
    joinSuccess(data: Extract<DirectResponse, { action: "YouJoinedGame" }>['data']) {
        console.log(data)
    }
}

export default NetworkManager;