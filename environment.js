import { GRAVITY_EARTH, GASC } from './constants.js';

class Environment {
    constructor(gravity) {
        this.gravity = gravity;
    }

    applyGravity(gameObject) {
        if (typeof gameObject.velocity !== 'undefined') {
            gameObject.velocity.addInPlace(this.gravity.scale(GASC));
        }
    }
}

class Earth extends Environment {
    constructor() {
        super(GRAVITY_EARTH);
    }
}


export { Environment, Earth };
