import { GRAVITY_EARTH, GRAVITY_MOON, GASC } from './constants.js';

import type Vector2 from './vector.js';
import type { Renderable } from './types.js';

interface GravityTarget extends Renderable {
    velocity?: Vector2;
}

class Environment {
    gravity: Vector2;

    constructor(gravity: Vector2) {
        this.gravity = gravity;
    }

    applyGravity(gameObject: GravityTarget, deltaTime: number): void {
        if (gameObject.velocity !== undefined) {
            gameObject.velocity.addInPlace(
                this.gravity.scale(GASC * deltaTime)
            );
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
