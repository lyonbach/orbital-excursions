class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    addInPlace(vector) {
        this.x += vector.x;
        this.y += vector.y;
    }

    
    add(vector) {
        return new Vector2(this.x + vector.x, this.y + vector.y);
    }
    
    subtract(vector) {
        return new Vector2(this.x - vector.x, this.y - vector.y);
    }
    
    subtractInPlace(vector) {
        this.x -= vector.x;
        this.y -= vector.y;
    }

    scale(scalar) {
        return new Vector2(this.x * scalar, this.y * scalar);
    }

    scaleInPlace(scalar) {
        this.x *= scalar;
        this.y *= scalar;
    }

    get magnitude() {
        return Math.hypot(this.x, this.y);
    }

    normalize() {
        const length = this.magnitude;
        return length === 0 ? new Vector2() : this.scale(1 / length);
    }

    normalizeInPlace() {
        const length = this.magnitude;
        if (length !== 0) {
            this.scaleInPlace(1 / length);
        }
    }
}


export default Vector2;
