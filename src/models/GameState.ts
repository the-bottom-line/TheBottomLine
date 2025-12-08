import Character, { getAllCharacters } from './Characters.js';
import type Player from './Player.ts';



class GameState {
    players: Player[] = [];
    myId?: number;
    username?: string;
    currentPlayerIndex = 0;
    characters = getAllCharacters();
    faceUpCharacters: Character[] = [];
    openCharacters: Character[] = [];
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
        // TODO: think about whether this should throw upon failure
        return this.getPlayerById(this.myId!)!;
    }

    resetForNewRound() {
        // TODO: move to Player.reset()
        this.players.forEach(p => {
            p.character = null;
            p.reveal = false;
            p.isChaiman = false;
            p.playableAssets = 1;
            p.playableLiabilities = 1;
            p.maxTempCards = 3;
            p.maxKeepCards = 2;
            
        });
        this.faceUpCharacters = [];
    }
}

export default GameState;