import Character, { getAllCharacters } from './Characters.js';
import type Player from './Player.ts';



export interface MarketState {
    title: string;
    rfr: number;
    mrp: number;
    Yellow: string;
    Blue: string;
    Green: string;
    Purple: string;
    Red: string;
    image_front_url: string;
    image_back_url: string;
}

class GameState {
    players: Player[] = [];
    myId?: number;
    username?: string;
    channel?: string;
    currentPlayerIndex = 0;
    characters = getAllCharacters();
    faceUpCharacters: Character[] = [];
    openCharacters: Character[] = [];
    marketState?: MarketState;
    currentPhase = 'lobby';

    setCurrentPlayerIndex(index: number) {
        if (index >= 0 && index < this.players.length) {
            this.currentPlayerIndex = index;
        }
    }

    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex]!;
    }

    getPlayerById(id: number) {
        return this.players.find(p => p.playerID === id);
    }

    getLocalPlayer() {
        return this.getPlayerById(this.myId!)!;
    }

    resetForNewRound() {
        this.players.forEach(p => {
            p.resetForNewRound();
        });
        this.faceUpCharacters = [];
    }
    
}

export default GameState;