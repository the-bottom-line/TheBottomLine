import { Application } from "pixi.js";
import GameManager from "./models/GameManager.js";
import GameState from "./models/GameState.js";
import UIManager from "./models/UIManager.js";
import NetworkManager from "./models/NetworkManager.js";
import dotenv from 'dotenv'; 

(async () => {
    const app = new Application();
    await app.init({
        resizeTo: window,
        autoDensity: true,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
    });

    app.canvas.style.position = "absolute";
    document.body.appendChild(app.canvas);

    dotenv.config();  // Load environment variables from .env file 
    let url = process.env.BOTTOM_ONLINE_BACKEND_URL;
    if (url === undefined){
        url = "http://localhost:3000/websocket"
    }
    const gameState = new GameState();
    const uiManager = new UIManager(app);
    const networkManager = new NetworkManager(url); //192.168.67.151
    const gameManager = new GameManager(gameState, uiManager, networkManager);

    networkManager.setGameManager(gameManager);

    gameManager.playerActionManager.initLobby();
})();    