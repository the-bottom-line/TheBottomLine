import type { Connect, DirectResponse, FrontendRequest, UniqueResponse } from "@shared-types";
import type GameManager from "./GameManager.js";

type NetworkResponse = MessageEvent<string>;
export type Response = DirectResponse | UniqueResponse;

type OutgoingRequest = Connect | FrontendRequest;

// Helper type to extract data for a specific action request
type ExtractData<T extends OutgoingRequest['action']> = Extract<OutgoingRequest, { action: T }> extends { data: infer D } ? D : never;

// Helper type to check if an action has data
type HasData<T extends OutgoingRequest['action']> = Extract<OutgoingRequest, { action: T }> extends { data: any } ? true : false;

type ExtractAction<A extends OutgoingRequest["action"]> =
    Extract<OutgoingRequest, { action: A }>;

type ActionData<A extends OutgoingRequest["action"]> =
    ExtractAction<A> extends { data: infer D } ? D : undefined;


class NetworkManager {
    url: string;
    connection?: WebSocket;
    gameManager?: GameManager;
    
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
        let invokedCommand = this.gameManager!.commandList[parsedMessage.action];
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