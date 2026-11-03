/**
 * Game class representing the main game logic.
 */
class Game {
    constructor() {
        this.gameObjects = [];
    }

    addGameObject(gameObject) {
        this.gameObjects.push(gameObject);
    }

    update() {
        for (const gameObject of this.gameObjects) {
            if (typeof gameObject.update === 'function') {
                gameObject.update();
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