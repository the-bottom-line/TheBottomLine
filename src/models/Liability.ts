import GeneralCard from './GeneralCard.js'

class Liability extends GeneralCard {
    title: string;
    gold: number;
    
    constructor(title: string, gold: number, texturePath: string) {
        super(texturePath);
        this.title = title;
        this.gold = gold;
    }
}

export default Liability;
