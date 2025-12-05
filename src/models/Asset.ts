import GeneralCard from './GeneralCard.js'

class Asset extends GeneralCard{
    title: string;
    color: string;
    gold: number;
    silver: number;
    
    ability: string | null = null;
    isTemporary = false;
    
    constructor(title: string, color: string, gold: number, silver: number, ability: string | null, texturePath: string) {
        super(texturePath);
        this.title = title;
        this.color = color;
        this.gold = gold;
        this.silver = silver;
        this.ability = ability;
    }
}

export default Asset;
