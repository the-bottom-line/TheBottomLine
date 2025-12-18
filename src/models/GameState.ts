import Character, { getAllCharacters } from './Characters.js';
import type Player from './Player.ts';
import type { MarketCard } from '@shared-types';

class GameState {
    players: Player[] = [];
    myId?: number;
    username?: string;
    channel?: string;
    currentPlayerIndex = 0;
    characters = getAllCharacters();
    openCharacters: Character[] = [];
    marketState?: MarketCard;
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
    }
    
}

export default GameState;