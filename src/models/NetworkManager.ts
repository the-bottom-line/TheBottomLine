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
type HasData<T extends OutgoingRequest['action']> = Extract<OutgoingRequest, { action: T }> extends { data: any } ? true : false;

class NetworkManager {
    url: string;
    connection?: WebSocket;
    gameManager?: GameManager;
    commandList?: HandlerMap;
    queue: any[] = [];
    messageInTransit = false;
    attempts = 0;
    timeoutTable = [2, 5, 15, 30, 60];
    recentMessages = new Set();
    
    constructor(url: string) {
        this.url = url;
        this.connect(url);
    }

    setGameManager(gameManager: GameManager) {
        this.gameManager = gameManager;
        this.commandList = {
            Error: _ => { },
            PlayersInLobby: r => this.gameManager!.newPlayer(r.data),
            StartGame: r => this.gameManager!.messageStartGame(r.data),
            SelectingCharacters: r => this.gameManager!.chairmanSelectCharacter(r.data),
            SelectedCharacter: r => this.gameManager!.receiveSelectableCharacters(r.data),
            TurnStarts: r => this.gameManager!.turnStarts(r.data),
            DrewCard: r => this.gameManager!.drewCard(r.data),
            PutBackCard: r => this.gameManager!.putBackCard(r.data),
            BoughtAsset: r => this.gameManager!.boughtAsset(r.data),
            IssuedLiability: r => this.gameManager!.issuedLiability(r.data),
            RedeemedLiability: r => this.gameManager!.redeemedLiability(r.data),
            ShareholderIsFiring: r => { }, // TODO: implement
            FiredCharacter: r => this.gameManager!.firedCharacter(r.data),
            RegulatorSwapedYourCards: r => this.gameManager!.regulatorSwapedYourCards(r.data),
            SwapedWithPlayer: r => this.gameManager!.swapedWithPlayer(r.data),
            SwapedWithDeck: r => this.gameManager!.swapedWithDeck(r.data),
            AssetDivested: r => { }, // TODO: handle
            TurnEnded: r => { }, // TODO: handle
            GameEnded: r => this.gameManager!.gameEnded(r.data),
            YouStartedGame: r => { }, // TODO: handle
            YouSelectedCharacter: r => this.gameManager!.youSelectedCharacter(r.data),
            YouFiredCharacter: r => this.gameManager!.youFiredCharacter(r.data),
            YouRegulatorOptions: r => this.gameManager!.youRegulatorOptions(r.data),
            YouSwapDeck: r => this.gameManager!.youSwapDeck(r.data),
            YouSwapPlayer: r => this.gameManager!.youSwapPlayer(r.data),
            YouAreDivesting: r => this.gameManager!.youAreDivesting(r.data),
            YouDrewCard: r => this.gameManager!.youDrewCard(r.data),
            YouPutBackCard: r => this.gameManager!.youPutBackCard(r.data),
            YouCharacterAbility: r => this.gameManager!.youCharacterAbility(r.data),
            YouBoughtAsset: r => this.gameManager!.youBoughtAsset(r.data),
            YouIssuedLiability: r => this.gameManager!.youIssuedLiability(r.data),
            YouAreFiringSomeone: r => this.gameManager!.youAreFiringSomeone(r.data),
            YouDivestedAnAsset: r => this.gameManager!.youDivestedAnAsset(r.data),
            YouAreTerminatingSomeone: r => this.gameManager!.youAreTerminatingSomeone(r.data),
            YouRedeemedLiability: r => this.gameManager!.youRedeemedLiability(r.data),
            YouEndedTurn: r => this.gameManager!.youEndedTurn(),
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
            let timeout = this.timeoutTable[this.attempts]!;
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

    // Couples a received message to corresponding command,
    // Echoes and otherwise ignores the received command if not found
    handleMessage(msg: NetworkResponse) {
        let parsedMessage: DirectResponse | UniqueResponse = JSON.parse(msg.data);
        let invokedCommand = this.commandList![parsedMessage.action];
        // TODO: probably make type-safe somehow. I couldn't figure it out in a reasonable amount
        // of time
        invokedCommand(parsedMessage as any);
    }

    // Attempts to send a message, if connection is closed will store messages in queue
    // Will discard duplicate messages or messages sent before a response has been returned by the server
    sendMessage(data: any) {
        if (this.connection!.readyState == WebSocket.OPEN) {
            // Catch and reject duplicate messages
            if (this.messageInTransit || this.recentMessages.has(data)) {
                console.error("Rejected duplicate message: " + data);
                return;
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
        let packet = {
            "action": command,
            "data": args[0],
        };
        let jsonData = JSON.stringify(packet, null, 0);
        console.log(jsonData);
        this.sendMessage(jsonData);
    }
}

export default NetworkManager;