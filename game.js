import { ShipTypeA } from './ship.js';

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