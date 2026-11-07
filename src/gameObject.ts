import Vector2 from './vector.js';
import type {
    AABB,
    Collidable,
    Point2,
    Renderable,
    ShipSettings
} from './types.js';
import { RUPS } from './constants.js';


class GameObject implements Renderable {
    render(_context: CanvasRenderingContext2D): void {
        // Default implementation does not draw anything.
    }
}


class StaticObject extends GameObject {
    position: Vector2;

    constructor(position: Vector2) {
        super();
        this.position = position;
    }
}


class DynamicObject extends GameObject {
    position: Vector2;
    velocity: Vector2;

    acceleration: Vector2 = new Vector2();

    angle: number = 0;
    angularAcceleration: number = 0;
    angularVelocity: number = 0;

    constructor(position: Vector2, velocity: Vector2) {
        super();
        this.position = position;
        this.velocity = velocity;
    }

    update(deltaTime: number): void {
        this.angularVelocity += this.angularAcceleration * deltaTime;
        this.angle += this.angularVelocity * deltaTime;

        this.velocity.addInPlace(
            this.acceleration.scale(deltaTime)
        );

        this.position.addInPlace(
            this.velocity.scale(deltaTime)
        );
    }
}


class Platform extends StaticObject implements Collidable {
    width: number;
    height: number;

    constructor(position: Vector2, width: number, height: number) {
        super(position);
        this.width = width;
        this.height = height;
    }

    override render(context: CanvasRenderingContext2D): void {
        context.fillStyle = "gray";

        context.fillRect(
            this.position.x,
            this.position.y,
            this.width,
            this.height
        );
    }

    getAABB(): AABB {
        return {
            minX: this.position.x,
            minY: this.position.y,
            maxX: this.position.x + this.width,
            maxY: this.position.y + this.height
        };
    }

    getVertices(): Point2[] {
        return [
            {
                x: this.position.x,
                y: this.position.y
            },
            {
                x: this.position.x + this.width,
                y: this.position.y
            },
            {
                x: this.position.x + this.width,
                y: this.position.y + this.height
            },
            {
                x: this.position.x,
                y: this.position.y + this.height
            }
        ];
    }

    getEdgeNormals(): Point2[] {
        const vertices = this.getVertices();
        const normals: Point2[] = [];

        for (let i = 0; i < vertices.length; i++) {
            const current = vertices[i];
            const next = vertices[(i + 1) % vertices.length];

            const edge: Point2 = {
                x: next.x - current.x,
                y: next.y - current.y
            };

            const normal: Point2 = {
                x: edge.y,
                y: -edge.x
            };

            const length = Math.hypot(normal.x, normal.y);

            normals.push({
                x: normal.x / length,
                y: normal.y / length
            });
        }

        return normals;
    }
}


class Ship extends DynamicObject implements Collidable {
    width: number;
    halfWidth: number;
    quarterWidth: number;
    height: number;
    halfHeight: number;
    quarterHeight: number;

    angle: number = 0;
    angularVelocity: number = 0;

    acceleration: Vector2 = new Vector2();
    angularAcceleration: number = 0;

    thrust: Vector2 = new Vector2();

    angularThrustCapability: number = 0;
    thrustCapability: Vector2 = new Vector2();

    constructor(position: Vector2, velocity: Vector2) {
        super(position, velocity);

        this.setShipSettings({
            angularThrustCapability: 0.0002 * RUPS ** 2,
            thrustCapability: new Vector2(
                0.005 * RUPS ** 2,
                0.010 * RUPS ** 2
            )
        });

        this.width = 30;
        this.halfWidth = this.width / 2;
        this.quarterWidth = this.width / 4;

        this.height = 30;
        this.halfHeight = this.height / 2;
        this.quarterHeight = this.height / 4;
    }

    setShipSettings(settings: ShipSettings): void {
        this.thrust = settings.thrust ?? this.thrust;

        this.angularThrustCapability =
            settings.angularThrustCapability ??
            this.angularThrustCapability;

        this.thrustCapability =
            settings.thrustCapability ?? this.thrustCapability;
    }


    calculateThrustVector(): Vector2 {
        const cos = Math.cos(this.angle - Math.PI / 2);
        const sin = Math.sin(this.angle - Math.PI / 2);

        return new Vector2(
            cos * this.thrust.y - sin * this.thrust.x,
            sin * this.thrust.y + cos * this.thrust.x
        );
    }

    override update(deltaTime: number): void {
        this.acceleration = this.calculateThrustVector();
        super.update(deltaTime);
    }

    override render(context: CanvasRenderingContext2D): void {
        context.save();

        context.translate(this.position.x, this.position.y);
        context.rotate(this.angle);

        const scaleCoeff = this.width + this.height;

        if (this.thrust.y > 0) {
            context.beginPath();

            const y = scaleCoeff + Math.random() * 10;

            context.moveTo(
                Math.random() * this.quarterWidth / 2,
                y
            );

            context.lineTo(this.quarterWidth, this.halfHeight);
            context.lineTo(-this.quarterWidth, this.halfHeight);
            context.closePath();

            context.fillStyle = "#f5e619";
            context.fill();
        }

        if (this.thrust.y > 0) {
            context.beginPath();

            const y = scaleCoeff * 0.80 + Math.random() * 10;

            context.moveTo(
                Math.random() * this.quarterWidth / 2,
                y
            );

            context.lineTo(this.quarterWidth, this.halfHeight);
            context.lineTo(-this.quarterWidth, this.halfHeight);
            context.closePath();

            context.fillStyle = "#c55616";
            context.fill();
        }

        function drawLateralThruster(
            self: Ship,
            x: number,
            y: number,
            positive: boolean
        ): void {
            context.beginPath();

            const r = Math.random() * 4;
            const p = positive ? 1 : -1;
            const startX = (self.thrust.x > 0 ? -x : x) * p;
            const direction = startX < 0 ? -1 : 1;

            context.rect(
                startX,
                y - 1,
                direction * 2.5,
                4
            );

            context.rect(
                startX,
                y,
                direction * (self.halfWidth + r),
                2
            );

            context.fillStyle = "#dbdbdb";
            context.fill();
        }

        if (this.thrust.x !== 0) {
            drawLateralThruster(
                this,
                this.halfWidth,
                this.quarterHeight,
                true
            );

            drawLateralThruster(
                this,
                this.quarterWidth / 2,
                -this.height * 0.88,
                true
            );
        }

        if (this.angularAcceleration > 0) {
            drawLateralThruster(
                this,
                this.halfWidth,
                this.quarterHeight,
                false
            );

            drawLateralThruster(
                this,
                this.quarterWidth / 2,
                -this.height * 0.88,
                true
            );
        } else if (this.angularAcceleration < 0) {
            drawLateralThruster(
                this,
                this.halfWidth,
                this.quarterHeight,
                true
            );

            drawLateralThruster(
                this,
                this.quarterWidth / 2,
                -this.height * 0.88,
                false
            );
        }

        context.beginPath();

        context.moveTo(-2, -this.height);
        context.lineTo(2, -this.height);
        context.lineTo(this.halfWidth, this.halfHeight);
        context.lineTo(-this.halfWidth, this.halfHeight);

        context.closePath();

        context.fillStyle = "gray";
        context.fill();

        context.restore();
    }

    getVertices(): Point2[] {
        const cos = Math.cos(this.angle);
        const sin = Math.sin(this.angle);

        const vertices: Point2[] = [
            { x: -2, y: -this.height },
            { x: 2, y: -this.height },
            { x: this.halfWidth, y: this.halfHeight },
            { x: -this.halfWidth, y: this.halfHeight }
        ];

        return vertices.map((vertex): Point2 => {
            const rx = vertex.x * cos - vertex.y * sin;
            const ry = vertex.x * sin + vertex.y * cos;

            return {
                x: rx + this.position.x,
                y: ry + this.position.y
            };
        });
    }

    getEdgeNormals(): Point2[] {
        const vertices = this.getVertices();
        const normals: Point2[] = [];

        for (let i = 0; i < vertices.length; i++) {
            const current = vertices[i];
            const next = vertices[(i + 1) % vertices.length];

            const edge: Point2 = {
                x: next.x - current.x,
                y: next.y - current.y
            };

            const normal: Point2 = {
                x: edge.y,
                y: -edge.x
            };

            const length = Math.hypot(normal.x, normal.y);

            normals.push({
                x: normal.x / length,
                y: normal.y / length
            });
        }

        return normals;
    }

    getAABB(): AABB {
        const vertices = this.getVertices();

        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        for (const vertex of vertices) {
            minX = Math.min(minX, vertex.x);
            minY = Math.min(minY, vertex.y);
            maxX = Math.max(maxX, vertex.x);
            maxY = Math.max(maxY, vertex.y);
        }

        return { minX, minY, maxX, maxY };
    }

}


export { Platform, Ship };
