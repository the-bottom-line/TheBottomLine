import { Assets, FillGradient, Graphics, Sprite, type Application } from "pixi.js";

export default async function makeHand(app: Application) {
    let backgroundDisplay: Sprite | Graphics;
    try {
        const texture = await Assets.load('./miscellaneous/lobbybg.png');
        const bgSprite = new Sprite(texture);

        const texW = 1557;//size of the lobbybg image
        const texH = 1036;

        const scale = Math.max(
        app.screen.width / texW,
        app.screen.height / texH
        );

        bgSprite.scale.set(scale);

        bgSprite.position.set(
        (app.screen.width - bgSprite.width) / 2,
        (app.screen.height - bgSprite.height) / 3
        );

        backgroundDisplay = bgSprite;
    } catch (err) {
        console.error("Failed to find lobby Background image")
        backgroundDisplay = new Graphics().rect(0, 0, app.screen.width, app.screen.height).fill(getGradient());
    }

    return backgroundDisplay;
}

function getGradient() {
    return new FillGradient({
        type: 'radial',
        center: { x: 0.5, y: 0.5 },
        innerRadius: 0.15,
        outerCenter: { x: 0.5, y: 0.5 },
        outerRadius: 0.5,
        colorStops: [
            { offset: 0, color: 0x4a4949 },
            { offset: 1, color: 0x252525 },
        ],
    });
}