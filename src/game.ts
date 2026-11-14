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
        if (!Number.isFinite(deltaTime) || deltaTime < 0) { return; }
        const maximumStep = 1 / 240;
        const maxiumFrameTime = 0.1;

        const frameTime = Math.min(deltaTime, maxiumFrameTime);
        const stepCount = Math.ceil(frameTime / maximumStep);
        const stepTime = frameTime / stepCount;

        for (let i = 0; i < stepCount; i++) {
            this.updatePhysics(stepTime);
        }
    }

    private updatePhysics(deltaTime: number): void {
        for (const gameObject of this.gameObjects) {
            if (this.environment !== null) {
                this.environment.applyGravity(gameObject, deltaTime);
            }

            if (gameObject instanceof Ship && this.platform !== null) {
                gameObject.applyLandingGearSuspension(this.platform, deltaTime);
                console.debug("HERE");
            }

            if (gameObject.update !== undefined){
                gameObject.update(deltaTime);
            }

            // Collision response (hull only)
            if (gameObject instanceof Ship && this.platform !== null) {
                const collision = Collision.sat(gameObject, this.platform);
                if (collision !== null) {
                    Collision.resolveAgainstStatic(gameObject, collision, 0.1, 0.5);
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
