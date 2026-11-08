import type {
    Collidable,
    CollisionResult,
    Point2
} from './types.js';
import type {
    DynamicObject,
    StaticObject
} from './gameObject.js';

class Collision {
    static sat(
        objectA: Collidable,
        objectB: Collidable
    ): CollisionResult | null {
        const normalsA = objectA.getEdgeNormals();
        const normalsB = objectB.getEdgeNormals();

        const allNormals = normalsA.concat(normalsB);

        // Calculate world-space vertices once per collision check.
        const verticesA = objectA.getVertices();
        const verticesB = objectB.getVertices();

        let smallestOverlap = Number.POSITIVE_INFINITY;
        let collisionNormal = { x: 0, y: 0 };

        for (const normal of allNormals) {
            let minA = Number.POSITIVE_INFINITY;
            let maxA = Number.NEGATIVE_INFINITY;

            for (const vertex of verticesA) {
                const projection =
                    vertex.x * normal.x + vertex.y * normal.y;

                minA = Math.min(minA, projection);
                maxA = Math.max(maxA, projection);
            }

            let minB = Number.POSITIVE_INFINITY;
            let maxB = Number.NEGATIVE_INFINITY;

            for (const vertex of verticesB) {
                const projection =
                    vertex.x * normal.x + vertex.y * normal.y;

                minB = Math.min(minB, projection);
                maxB = Math.max(maxB, projection);
            }

            const overlap =
                Math.min(maxA, maxB) - Math.max(minA, minB);

            // A separating axis was found: no collision.
            if (overlap < 0) {
                return null;
            }

            // The axis with the smallest overlap is the most plausible
            // direction in which to resolve the collision.
            if (overlap < smallestOverlap) {
                smallestOverlap = overlap;
                collisionNormal = normal;
            }
        }

        const centerA = Collision.centroid(verticesA);
        const centerB = Collision.centroid(verticesB);

        const direction =
            (centerA.x - centerB.x) * collisionNormal.x +
            (centerA.y - centerB.y) * collisionNormal.y;

        if (direction < 0) {
            collisionNormal = {
                x: -collisionNormal.x,
                y: -collisionNormal.y
            };
        }

        // The ship vertex closest to the platform along the collision normal.
        let contactVertex = verticesA[0];
        let smallestProjection = Number.POSITIVE_INFINITY;

        for (const vertex of verticesA) {
            const projection =
                vertex.x * collisionNormal.x +
                vertex.y * collisionNormal.y;

            if (projection < smallestProjection) {
                smallestProjection = projection;
                contactVertex = vertex;
            }
        }

        return {
            normal: collisionNormal,
            penetrationDepth: smallestOverlap,
            contactPoint: contactVertex
        };
    }

static resolveAgainstStatic(
    dynamicObject: DynamicObject,
    result: CollisionResult,
    restitution: number
): void {
    const {
        normal,
        penetrationDepth,
        contactPoint
    } = result;

    // Separate the ship from the platform.
    dynamicObject.position.x += normal.x * penetrationDepth;
    dynamicObject.position.y += normal.y * penetrationDepth;

    // Vector from the ship center to the contact point.
    const rx = contactPoint.x - dynamicObject.position.x;
    const ry = contactPoint.y - dynamicObject.position.y;

    // Cross product of the contact offset and collision normal.
    // This determines how much torque the normal impulse produces.
    const rn =
        rx * normal.y - ry * normal.x;

    // Velocity at the contact point:
    // v_contact = v + omega cross r
    const contactNormalVelocity =
        dynamicObject.velocity.x * normal.x +
        dynamicObject.velocity.y * normal.y +
        dynamicObject.angularVelocity * rn;

    // Already separating, or stationary along the normal.
    if (contactNormalVelocity >= 0) {
        return;
    }

    // Impulse magnitude for unit mass. The rotational term makes an
    // impact near the edge produce less linear velocity change and more
    // angular velocity change.
    const denominator =
        dynamicObject.mass +
        rn * rn * dynamicObject.inverseMomentOfInertia;

    const normalImpulse =
        -(1 + restitution) * contactNormalVelocity / denominator;

    // Apply the linear part of the impulse.
    dynamicObject.velocity.x += normal.x * normalImpulse;
    dynamicObject.velocity.y += normal.y * normalImpulse;

    // Apply the angular part: torque = r cross impulse.
    const torque =
        rx * (normal.y * normalImpulse) -
        ry * (normal.x * normalImpulse);

    dynamicObject.angularVelocity +=
        torque * dynamicObject.inverseMomentOfInertia;
}

    private static centroid(vertices: Point2[]): Point2 {
        let x = 0;
        let y = 0;

        for (const vertex of vertices) {
            x += vertex.x;
            y += vertex.y;
        }

        return {
            x: x / vertices.length,
            y: y / vertices.length
        };
    }
}

export default Collision;
