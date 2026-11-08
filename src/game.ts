// import { Ship } from './ship.js';
import { Ship, Platform } from './gameObject.js';
import Collision from './collision.js';

import type { Environment } from './environment.js';
import type Vector2 from './vector.js';
import type { Renderable, Updatable } from './types.js';


interface GameEntity extends Renderable {
    velocity?: Vector2;
    update?: Updatable['update'];
}

class Game {
    context: CanvasRenderingContext2D;
    gameObjects: GameEntity[] = [];
    environment: Environment | null;

    private platform: Platform | null = null;

    constructor(
        context: CanvasRenderingContext2D,
        environment: Environment | null = null
    ) {
        this.context = context;
        this.environment = environment;
    }

    addGameObject(gameObject: GameEntity): void {
        this.gameObjects.push(gameObject);

        if (gameObject instanceof Platform) {
            this.platform = gameObject;
        }
    }

    update(deltaTime: number): void {
        for (const gameObject of this.gameObjects) {
            if (this.environment !== null) {
                this.environment.applyGravity(gameObject, deltaTime);
            }

            if (gameObject.update !== undefined) {
                gameObject.update(deltaTime);
            }

            if (gameObject instanceof Ship && this.platform !== null) 
            {
                let collision = Collision.sat(gameObject, this.platform);
                if (collision !== null) {
                    console.debug("Collision result:", collision);
                    Collision.resolveAgainstStatic(
                        gameObject,
                        collision,
                        0.1,  // restitution
                        0.5   // friction GATHER THESE VALUES FROM THE COLLISION RESULT OR SETTINGS FIXME
                    );
                }
            }
        }
    }

    render(context: CanvasRenderingContext2D): void {
        for (const gameObject of this.gameObjects) {
            gameObject.render(context);
        }
    }
}

export default Game;
