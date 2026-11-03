/**
 * Game class representing the main game logic.
 */
class Game {
    constructor(environment) {
        this.gameObjects = [];
        this.environment = environment;
    }

    addGameObject(gameObject) {
        this.gameObjects.push(gameObject);
    }

    update() {
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