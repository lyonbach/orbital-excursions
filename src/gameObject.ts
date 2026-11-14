import Vector2 from './vector.js';
import type {
    AABB,
    Collidable,
    Point2,
    Renderable,
    LandingGearContact,
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

    mass: number = 1;
    inverseMomentOfInertia: number = 1;

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

    applyForceAtPoint(force: Vector2, point: Point2, deltaTime: number): void {
        const inverseMass = 1 / this.mass;
        this.velocity.x += force.x * inverseMass * deltaTime;
        this.velocity.y += force.y * inverseMass * deltaTime;

        const rX = point.x - this.position.x;
        const rY = point.y - this.position.y;

        const torque = rX * force.y - rY * force.x;
        this.angularVelocity += torque * this.inverseMomentOfInertia * deltaTime;
    }

    getVelocityAtPoint(worldPoint: Point2): Point2 {
        const rX = worldPoint.x - this.position.x;
        const rY = worldPoint.y - this.position.y;

        return {
            x: this.velocity.x - this.angularVelocity * rY,
            y: this.velocity.y + this.angularVelocity * rX
        };
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

    thrust: Vector2 = new Vector2();
    angularThrustCapability: number = 0;
    thrustCapability: Vector2 = new Vector2();

    landingGearExtension: number = 0;  // landingGearExtension ranges from 0 (fully retracted) to 1 (fully deployed).
    landingGearTarget: number = 0;
    landingGearSpeed: number = 0.5;

    landingGearSpan: number = 20;
    landingGearLength: number = 10;
    landingGearFootRadius: number = 3;

    landingGearSuspensionTravel: number = 10;
    landingGearSuspensionStiffness: number = 5;
    landingGearSuspensionDamping: number = 3;

    landingGearCompressionLeft: number = 0;
    landingGearCompressionRight: number = 0;
    // landingGearCompressionCenter: number = 0;  // Add this later




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

        const momentOfInertia =  // FIXME GET THIS FROM THE SETTINGS
            (this.width * this.width + this.height * this.height) / 12;

        this.inverseMomentOfInertia = 1 / momentOfInertia;
    }

    override update(deltaTime: number): void {

        // Landing gear control: extend or retract based on the target position.
        const direction = Math.sign(
            this.landingGearTarget - this.landingGearExtension
        );

        if (direction !== 0) {
            this.landingGearExtension = Math.max(
                0,
                Math.min(
                    1,
                    this.landingGearExtension +
                    direction * this.landingGearSpeed * deltaTime
                )
            );
        }

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

        function renderLateralThruster(
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
            renderLateralThruster(
                this,
                this.halfWidth,
                this.quarterHeight,
                true
            );

            renderLateralThruster(
                this,
                this.quarterWidth / 2,
                -this.height * 0.88,
                true
            );
        }

        if (this.angularAcceleration > 0) {
            renderLateralThruster(
                this,
                this.halfWidth,
                this.quarterHeight,
                true
            );

            renderLateralThruster(
                this,
                this.quarterWidth / 2,
                -this.height * 0.88,
                false
            );
        } else if (this.angularAcceleration < 0) {
            renderLateralThruster(
                this,
                this.halfWidth,
                this.quarterHeight,
                false
            );

            renderLateralThruster(
                this,
                this.quarterWidth / 2,
                -this.height * 0.88,
                true
            );
        }

        this.renderLandingGear(context);
        this.renderHull(context);
        context.restore();
    }

    private renderHull(
        context: CanvasRenderingContext2D,
        color: string = "gray"
    ): void {
        context.beginPath();
        context.moveTo(-2, -this.height);
        context.lineTo(2, -this.height);
        context.lineTo(this.halfWidth, this.halfHeight);
        context.lineTo(-this.halfWidth, this.halfHeight);
        context.closePath();

        context.fillStyle = color;
        context.fill();
    }

    private calculateSuspensionForce(compression: number, compressionSpeed: number): number {
        if (compression <= 0) {
            return 0;
        }
        const springForce = this.landingGearSuspensionStiffness * compression;
        const dampingForce = this.landingGearSuspensionDamping * compressionSpeed;
        return Math.max(0, springForce + dampingForce);
    }

    private getLandingFootLocal(side: number= -1 | 1, compressionOverride?: number): Point2 {
        const extension = this.landingGearExtension;
        const compression = compressionOverride ?? (side === -1 ? this.landingGearCompressionLeft : this.landingGearCompressionRight);
        const maximumCompression = this.landingGearSuspensionTravel * extension;
        const clampedCompression = Math.max(0, Math.min(compression, maximumCompression));

        return {
            x: side * this.landingGearSpan * extension,
            y: this.halfHeight + this.landingGearLength * extension - clampedCompression
        }
    }

    private getLandingGearFootWorld(side: number= -1 | 1, compressionOverride?: number): Point2 {
        const local = this.getLandingFootLocal(side, compressionOverride);
        const cos = Math.cos(this.angle);
        const sin = Math.sin(this.angle);

        return {
            x: this.position.x + local.x * cos - local.y * sin,
            y: this.position.y + local.x * sin + local.y * cos
        };
    }

    private getLandingGearContact(side: number= -1 | 1, platform: Platform): LandingGearContact | null {
        const extension = this.landingGearExtension;
        if (extension <= 0) {
            return null;
        }
        
        const sin = Math.sin(this.angle);
        const cos = Math.cos(this.angle);

        if (cos <= 0) {
            return null;
        }

        const restingFoot = this.getLandingGearFootWorld(side, 0);
        const platformTop = platform.position.y;
        const platformLeft = platform.position.x;
        const platformRight = platformLeft + platform.width;

        const overlap =
            restingFoot.y +
    this.landingGearFootRadius -
    platformTop;
        
        if (overlap < 0) {
            return null;
        }

        const requiredCompression = overlap / cos;
        const contactX = restingFoot.x + sin * requiredCompression;
        if (contactX < platformLeft || contactX > platformRight) {
            return null;
        }

        const maximumCompression = this.landingGearSuspensionTravel * extension;
        const compression = Math.min(requiredCompression, maximumCompression);

        return {
            point: {
                x: contactX,
                y: platformTop
            },

            normal: {
                x: 0,
                y: -1
            },

            compression,
            requiredCompression,
            bottomedOut: requiredCompression > maximumCompression
        };
    }

    applyLandingGearSuspension(platform: Platform, deltaTime: number): void {
        const contacts = ([-1, 1] as const).map(side => {
            const contact = this.getLandingGearContact(side, platform);
            if (contact === null) {
                return {side, contact, force: 0};
            }
            const velocity = this.getVelocityAtPoint(contact.point);
            const compressionSpeed = velocity.y / Math.cos(this.angle);
            const springForce = this.calculateSuspensionForce(contact.compression, compressionSpeed);
            
            // Convert the axial spring force to vertical force
            const force = springForce / Math.cos(this.angle);
            return {side, contact, force};
        });

        for (const {side, contact, force} of contacts) {
            const compression = contact?.compression ?? 0;

            if (side === -1) {
                this.landingGearCompressionLeft = compression;
            } else if (side === 1) {
                this.landingGearCompressionRight = compression;
            }
            if (contact === null || force <= 0) {
                continue;
            }

            this.applyForceAtPoint(
                new Vector2(
                    contact.normal.x * force,
                    contact.normal.y * force),
                    contact.point,
                    deltaTime
            );
        }
    }

    private renderLandingGear(
        context: CanvasRenderingContext2D
    ): void {
        const extension = this.landingGearExtension;

        if (extension <= 0) {
            return;
        }

        // const legLength = this.landingGearLength * extension;
        // const legSpan = this.landingGearSpan * extension;

        context.strokeStyle = "#c8c8c8";
        context.lineWidth = 3;
        context.lineCap = "round";

        for (const side of [-1, 1]) {
            const hipX = side * this.halfWidth * 0.55;
            const hipY = this.halfHeight * 0.55;

            const foot = this.getLandingFootLocal(side);

            context.beginPath();
            context.moveTo(hipX, hipY);
            context.lineTo(foot.x, foot.y);
            context.stroke();

            context.beginPath();
            context.arc(
                foot.x,
                foot.y,
                this.landingGearFootRadius,
                0,
                Math.PI * 2
            );

            context.fillStyle = "#e0e0e0";
            context.fill();
        }
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

    getVertices(): Point2[] {
        const cos = Math.cos(this.angle);
        const sin = Math.sin(this.angle);

        const localVertices: Point2[] = [
            { x: -2, y: -this.height },
            { x: 2, y: -this.height },
            { x: this.halfWidth, y: this.halfHeight },
            { x: -this.halfWidth, y: this.halfHeight }
        ];

        // if (this.landingGearExtension > 0) {
        //     const legLength =
        //         this.landingGearLength * this.landingGearExtension;

        //     const legSpan =
        //         this.landingGearSpan * this.landingGearExtension;

        //     const footY = this.halfHeight + legLength;

        //     localVertices.push(
        //         { x: -legSpan, y: footY },
        //         { x: legSpan, y: footY }
        //     );
        // }

        return localVertices.map((vertex): Point2 => {
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

    setLandingGear(deployed: boolean): void {
        this.landingGearTarget = deployed ? 1 : 0;
    }

}


export { Platform, Ship, DynamicObject, StaticObject };
