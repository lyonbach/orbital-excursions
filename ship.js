import Vector2 from './vector.js';
/**
 * Ship class representing a spaceship in the game.
 */
class Ship {
    constructor(position, velocity) {
        this.position = position;
        this.velocity = velocity;
        this.angle = 0.0;
        this.angularVelocity = 0.0;

        this.acceleration = new Vector2(0.0, 0.0);
        this.angularAcceleration = 0.0;
        this.thrust = 0.0;

        this.angularThrustCapability = 0.0;
        this.thrustCapability = 0.0;
    }

    set(settings) {
        this.thrust = settings.thrust ?? this.thrust;
        this.angularThrustCapability = settings.angularThrustCapability ?? this.angularThrustCapability;
        this.thrustCapability = settings.thrustCapability ?? this.thrustCapability;
    }
}


/**
 * ShipTypeA class representing a specific type of spaceship.
 */
class ShipTypeA extends Ship {
    constructor(position, velocity) {
        super(position, velocity);
        this.set({  // TODO LATER FROM A JSON FILE
            angularThrustCapability: 0.001,
            thrustCapability: 0.02
        });
    }

    calculateThrustVector() {
        return new Vector2(
            Math.cos(this.angle - Math.PI / 2) * this.thrust,
            Math.sin(this.angle - Math.PI / 2) * this.thrust
        );
    }

    update() {
        this.angularVelocity += this.angularAcceleration;
        this.angle += this.angularVelocity;

        this.acceleration = this.calculateThrustVector();
        this.velocity.addInPlace(this.acceleration);
        this.position.addInPlace(this.velocity);

    }

    render(context) {
        // Draw the ship as a triangle with the tip pointing upwards relative to its position.
        // Then apply rotation based on the ship's angle.
        context.save();

        // Move the canvas origin to the object's center and rotate it.
        context.translate(this.position.x, this.position.y);
        context.rotate(this.angle);

        // Define the triangle relative to (0, 0).
        context.beginPath();
        context.moveTo(0.0, -20.0);
        context.lineTo(10.0, 10.0);
        context.lineTo(-10.0, 10.0);
        context.closePath();

        // Fill while the transform is still active.
        context.fillStyle = "tomato";
        context.fill();

        context.restore();

    }
}

export { ShipTypeA, Ship };