import type { Collidable } from './types.js';

class Collision {
    static sat(objectA: Collidable, objectB: Collidable): boolean {
        const normalsA = objectA.getEdgeNormals();
        const normalsB = objectB.getEdgeNormals();

        const allNormals = normalsA.concat(normalsB);

        // Calculate world-space vertices once per collision check.
        const verticesA = objectA.getVertices();
        const verticesB = objectB.getVertices();

        for (const normal of allNormals) {
            let minA = Infinity;
            let maxA = -Infinity;

            for (const vertex of verticesA) {
                const projection =
                    vertex.x * normal.x + vertex.y * normal.y;

                minA = Math.min(minA, projection);
                maxA = Math.max(maxA, projection);
            }

            let minB = Infinity;
            let maxB = -Infinity;

            for (const vertex of verticesB) {
                const projection =
                    vertex.x * normal.x + vertex.y * normal.y;

                minB = Math.min(minB, projection);
                maxB = Math.max(maxB, projection);
            }

            if (maxA < minB || maxB < minA) {
                return false;
            }
        }

        console.debug("Collision detected between objectA and objectB");
        return true;
    }
}

export default Collision;
