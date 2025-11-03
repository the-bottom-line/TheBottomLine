import { Container, Graphics, Text } from 'pixi.js';
import { Button } from '@pixi/ui';

export class FancyButton extends Button {
    constructor({ text, width = 200, height = 60, onPress }) {
        const cornerRadius = 15;

        const background = new Graphics()
            .roundRect(0, 0, width, height, cornerRadius)
            .fill(0xa68d5e) // Antique Gold
            .stroke({ width: 2, color: 0x000000 }); // Slight black outline

        const buttonText = new Text({
            text,
            style: { fill: '#f2e8d5', fontSize: 24, fontFamily: 'MyFont' }
        });
        buttonText.anchor.set(0.5);
        buttonText.position.set(width / 2, height / 2);

        super(new Container({ children: [background, buttonText] }));

        this.onPress.connect(onPress);
    }
}