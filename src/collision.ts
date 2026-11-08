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

        // Your resolver expects the normal to point from the static
        // object (objectB) toward the dynamic object (objectA).
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

        return {
            normal: collisionNormal,
            penetrationDepth: smallestOverlap
        };
    }

    static resolveAgainstStatic(
        dynamicObject: DynamicObject,
        result: CollisionResult,
        restitution: number
    ): void {
        const { normal, penetrationDepth } = result;

        // Separate the ship from the platform.
        dynamicObject.position.x += normal.x * penetrationDepth;
        dynamicObject.position.y += normal.y * penetrationDepth;

        const normalVelocity =
            dynamicObject.velocity.x * normal.x +
            dynamicObject.velocity.y * normal.y;

        // Already stationary along the normal, or moving away.
        if (normalVelocity >= 0) {
            return;
        }

        const velocityChange =
            -(1 + restitution) * normalVelocity;

        dynamicObject.velocity.x += velocityChange * normal.x;
        dynamicObject.velocity.y += velocityChange * normal.y;
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
