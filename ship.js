import Vector2 from './vector.js';
import { RUPS } from './constants.js';

/**
 * Abstract base class for spaceship types. JavaScript does not enforce abstract
 * classes, so subclasses must implement update().
 * @abstract
 */
class Ship {
    constructor(position, velocity) {
        this.position = position;
        this.velocity = velocity;
        this.angle = 0.0;
        this.angularVelocity = 0.0;

        this.acceleration = new Vector2(0.0, 0.0);
        this.angularAcceleration = 0.0;
        this.thrust = new Vector2(0.0, 0.0);

        this.angularThrustCapability = 0.0;
        this.thrustCapability = new Vector2(0.0, 0.0);
    }

    set(settings) {
        this.thrust = settings.thrust ?? this.thrust;
        this.angularThrustCapability = settings.angularThrustCapability ?? this.angularThrustCapability;
        this.thrustCapability = settings.thrustCapability ?? this.thrustCapability;
    }

    /** @abstract */
    update(deltaTime) {
        throw new Error(`${this.constructor.name} must implement update(deltaTime).`);
    };

}


/**
 * ShipTypeA class representing a specific type of spaceship.
 */
class ShipTypeA extends Ship {
    constructor(position, velocity) {
        super(position, velocity);
        this.set({  // TODO LATER FROM A JSON FILE
            angularThrustCapability: 0.0002 * RUPS ** 2,
            thrustCapability: new Vector2(
                0.005 * RUPS ** 2,
                0.010 * RUPS ** 2
            )
        });

        this.width = 30.0;
        this.halfWidth     = this.width /  2;  // Optimization 
        this.quarterWidth  = this.width /  4;  // Optimization 

        this.height = 30.0;
        this.halfHeight    = this.height / 2;  // Optimization 
        this.quarterHeight = this.height / 4;  // Optimization 
    }

    calculateThrustVector() {
        const cos = Math.cos(this.angle - Math.PI / 2);
        const sin = Math.sin(this.angle - Math.PI / 2);
        return new Vector2(
            cos * this.thrust.y - sin * this.thrust.x,
            sin * this.thrust.y + cos * this.thrust.x
        );
    }

    update(deltaTime) {
        this.angularVelocity += this.angularAcceleration * deltaTime;
        this.angle += this.angularVelocity * deltaTime;

        this.acceleration = this.calculateThrustVector();
        this.velocity.addInPlace(this.acceleration.scale(deltaTime));
        this.position.addInPlace(this.velocity.scale(deltaTime));

    }

    render(context) {
        // Draw the ship as a triangle with the tip pointing upwards relative to its position.
        // Then apply rotation based on the ship's angle.

        // Draw the axis-aligned bounding box for debugging purposes.
        context.save();
        
        
        // Move the canvas origin to the object's center and rotate it.
        context.translate(this.position.x, this.position.y);
        context.rotate(this.angle);
        
        var scaleCoeff = this.width + this.height;
        // Draw the exhaust flame based on the current thrust.
        if (this.thrust.y > 0) {
            context.beginPath();
            const y = scaleCoeff + Math.random() * 10;
            context.moveTo(Math.random() * this.quarterWidth / 2, y);
            context.lineTo( this.quarterWidth, this.halfHeight);
            context.lineTo(-this.quarterWidth, this.halfHeight);
            context.closePath();
            context.fillStyle = "#f5e619";
            context.fill();
        }

        if (this.thrust.y > 0) {
            context.beginPath();
            const y = scaleCoeff * .80 + Math.random() * 10;
            context.moveTo(Math.random() * this.quarterWidth / 2, y);
            context.lineTo( this.quarterWidth, this.halfHeight);
            context.lineTo(-this.quarterWidth, this.halfHeight);
            context.closePath();
            context.fillStyle = "#c55616";
            context.fill();
        }

        // Draw the lateral thrusters based on the current thrust in the x direction.
        function drawLateralThruster(self, x, y, positive) {
            context.beginPath();
            const r = Math.random() * 4.0;
            const p = positive ? 1 : -1;
            const startX = (self.thrust.x > 0 ? -x : x) * p;
            const direction = startX < 0 ? -1 : 1;
            context.rect(startX, y - 1, direction * 2.5, 4);
            context.rect(startX, y, direction * (self.halfWidth + r), 2);
            context.fillStyle = "#dbdbdb";
            context.fill();
        }

        
        if (this.thrust.x !== 0) {
            drawLateralThruster(this, this.halfWidth,         this.quarterHeight, true);
            drawLateralThruster(this, this.quarterWidth / 2, -this.height * .88,  true);
        }
        
        if (this.angularAcceleration > 0) {
            drawLateralThruster(this, this.halfWidth,         this.quarterHeight, false);
            drawLateralThruster(this, this.quarterWidth / 2, -this.height * .88,   true);
        } else if (this.angularAcceleration < 0) {
            drawLateralThruster(this, this.halfWidth,         this.quarterHeight,  true);
            drawLateralThruster(this, this.quarterWidth / 2, -this.height * .88,  false);
        }

        // Draw the ships hull.
        context.beginPath();
        context.moveTo(-2.0, -this.height);
        context.lineTo( 2.0, -this.height);
        context.lineTo( this.halfWidth, this.halfHeight);
        context.lineTo(-this.halfWidth, this.halfHeight);
        context.closePath();
        context.fillStyle = "gray";
        context.fill();

        context.restore();

        /** DEBUG context.save();
        const aabb = this.getAABB();
        context.beginPath();
        context.rect(aabb.minX, aabb.minY, aabb.maxX - aabb.minX, aabb.maxY - aabb.minY);
        context.strokeStyle = "red";
        context.stroke();
        context.restore();
        */

        /** DEBUG
        // const normals = this.getEdgeNormals();
        // const vertices = this.getVertices();
        // context.save();
        // context.strokeStyle = "red";

        // // Draw the edge normals for debugging
        // for (let i = 0; i < vertices.length; i++) {
        //     const this_v = vertices[i];
        //     const next_v = vertices[(i + 1) % vertices.length];
        //     // Draw the edge normal from the midpoint of the edge to outside the shape
        //     const midX = (this_v.x + next_v.x) / 2;
        //     const midY = (this_v.y + next_v.y) / 2;
        //     const n = normals[i];
        //     context.beginPath();
        //     context.moveTo(midX, midY);
        //     context.lineTo(midX + n.x * 50, midY + n.y * 50);
        //     context.stroke();
        // }

        // context.restore();
        */
    }

    getVertices() {
        const cos = Math.cos(this.angle);
        const sin = Math.sin(this.angle);

        const vertices = [
            { x: -2.0, y: -this.height },
            { x: 2.0, y: -this.height },
            { x: this.halfWidth, y: this.halfHeight },
            { x: -this.halfWidth, y: this.halfHeight }
        ];

        return vertices.map(v => {
            const rx = v.x * cos - v.y * sin;
            const ry = v.x * sin + v.y * cos;
            return {
                x: rx + this.position.x,
                y: ry + this.position.y
            };
        });
    }

    getEdgeNormals() {
        const vertices = this.getVertices();
        const normals = [];
        for (let i = 0; i < vertices.length; i++) {
            const current = vertices[i];
            const next = vertices[(i + 1) % vertices.length];
            const edge = { x: next.x - current.x, y: next.y - current.y };
            const normal = { x: edge.y, y: -edge.x };
            const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
            normals.push({ x: normal.x / length, y: normal.y / length });
        }
        return normals;
    }

    getAABB() {
        const cos = Math.cos(this.angle);
        const sin = Math.sin(this.angle);
        
        // These match your render() calls exactly
        const vertices = [
            { x: -2.0, y: -this.height },               // Top-left
            { x: 2.0, y: -this.height },                // Top-right
            { x: this.halfWidth, y: this.halfHeight },   // Bottom-right
            { x: -this.halfWidth, y: this.halfHeight }  // Bottom-left
        ];

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        for (const v of vertices) {
            // Rotate the vertex
            const rx = v.x * cos - v.y * sin;
            const ry = v.x * sin + v.y * cos;
            
            // Translate to world space
            const wx = rx + this.position.x;
            const wy = ry + this.position.y;

            if (wx < minX) minX = wx;
            if (wx > maxX) maxX = wx;
            if (wy < minY) minY = wy;
            if (wy > maxY) maxY = wy;
        }

        return { minX, minY, maxX, maxY };
    }

}

export { ShipTypeA, Ship };