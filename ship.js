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
        this.thrust = new Vector2(0.0, 0.0);

        this.angularThrustCapability = 0.0;
        this.thrustCapability = new Vector2(0.0, 0.0);
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
            angularThrustCapability: (0.0002),
            thrustCapability: new Vector2(0.005, 0.008)
        });
    }

    calculateThrustVector() {
        const cos = Math.cos(this.angle - Math.PI / 2);
        const sin = Math.sin(this.angle - Math.PI / 2);
        return new Vector2(
            cos * this.thrust.y - sin * this.thrust.x,
            sin * this.thrust.y + cos * this.thrust.x
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
        context.moveTo(-2.0, -20.0);
        context.lineTo(2.0, -20.0);
        context.lineTo(10.0, 10.0);
        context.lineTo(-10.0, 10.0);
        context.closePath();
        context.fillStyle = "gray";
        context.fill();

        // Draw the exhaust flame based on the current thrust.
        if (this.thrust.y > 0) {
            context.beginPath();
            const y = 35.0 + Math.random() * 10;
            context.moveTo(0.0, y);
            context.lineTo(5.0, 10.0);
            context.lineTo(-5.0, 10.0);
            context.closePath();
            context.fillStyle = "yellow";
            context.fill();
        }

        if (this.thrust.y > 0) {
            context.beginPath();
            const y = 25.0 + Math.random() * 10;
            context.moveTo(0.0, y);
            context.lineTo(5.0, 10.0);
            context.lineTo(-5.0, 10.0);
            context.closePath();
            context.fillStyle = "tomato";
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
            context.rect(startX, y, direction * (10.0 + r), 2);
            context.fillStyle = "#dbdbdb";
            context.fill();
        }

        if (this.thrust.x !== 0) {
            drawLateralThruster(this, 10, -1, true);
            drawLateralThruster(this, 5, -16, true);
        }
        
        if (this.angularAcceleration > 0) {
            drawLateralThruster(this, 10, -1, false);
            drawLateralThruster(this, 5, -16, true);
        } else if (this.angularAcceleration < 0) {
            drawLateralThruster(this, 10, -1, true);
            drawLateralThruster(this, 5, -16, false);
        }

        context.restore();

    }

}

export { ShipTypeA, Ship };