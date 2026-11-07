import { GRAVITY_EARTH, GRAVITY_MOON, GASC } from './constants.js';

class Environment {
    constructor(gravity) {
        this.gravity = gravity;
    }

    applyGravity(gameObject, deltaTime) {
        if (typeof gameObject.velocity !== 'undefined') {
            gameObject.velocity.addInPlace(this.gravity.scale(GASC * deltaTime));
        }
    }
}

class Earth extends Environment {
    constructor() {
        super(GRAVITY_EARTH);
    }
}

class Moon extends Environment {
    constructor() {
        super(GRAVITY_MOON);
    }
}


export { Environment, Earth, Moon };
