import Vector2 from './vector.js';

const GLOBAL_ACCLERATION_SCALE_COEFFICIENT = 0.001;

const GRAVITY_EARTH = new Vector2(0, 9.81);
const GRAVITY_MOON = new Vector2(0, 1.62);

export { 
    GRAVITY_EARTH,
    GRAVITY_MOON,
    GLOBAL_ACCLERATION_SCALE_COEFFICIENT as GASC
};

