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

    update() {

        // TEMPORARY
        var platform = this.gameObjects[1];

        for (const gameObject of this.gameObjects) {
            if (typeof gameObject.update === 'function') {
                gameObject.update();

                if (gameObject instanceof ShipTypeA) {

                    const ship = gameObject;
                    const platformAABB = platform.getAABB();
                    const shipAABB = ship.getAABB();
                    const isColliding = !(
                        shipAABB.maxX < platformAABB.minX ||
                        shipAABB.minX > platformAABB.maxX ||
                        shipAABB.maxY < platformAABB.minY ||
                        shipAABB.minY > platformAABB.maxY
                    );
                    if (isColliding) {
                        // We apply here the sat algorithm for collision response
                        Collision.sat(ship, platform, this.context);  // FIXME REMOVE CONTEXT PARAMETER LATER
                    }
                }
            }
            if (this.environment && typeof this.environment.applyGravity === 'function') {
                this.environment.applyGravity(gameObject);
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