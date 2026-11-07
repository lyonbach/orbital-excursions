import { ShipTypeA } from './ship.js';
import Collision from './collision.js';
import Vector2 from './vector.js';

/**
 * Game class representing the main game logic.
 */
class Game {
    constructor(context, environment) {
        this.context = context;
        this.gameObjects = [];
        this.environment = environment;
    }

    addGameObject(gameObject) {
        this.gameObjects.push(gameObject);
    }

    update(deltaTime) {
        var platform = this.gameObjects[1];
        for (const gameObject of this.gameObjects) {
            if (typeof gameObject.update === 'function') {
                gameObject.update(deltaTime);

                if (gameObject instanceof ShipTypeA) {
                    const ship = gameObject;
                    Collision.sat(ship, platform);
                }
            }
            if (this.environment && typeof this.environment.applyGravity === 'function') {
                this.environment.applyGravity(gameObject, deltaTime);
            }
        }
    }

    render(context) {
        for (const gameObject of this.gameObjects) {
            if (typeof gameObject.render === 'function') {
                gameObject.render(context);
            }
        }
    }

}

export default Game;