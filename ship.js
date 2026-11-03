import Vector2 from './vector.js';
/**
 * Ship class representing a spaceship in the game.
 */
class Ship {
    constructor(position, velocity) {
        this.position = position;
        this.velocity = velocity;
        this.acceleration = new Vector2(0, 0);
    }
}
export default Ship;