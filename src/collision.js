class Collision {
    static sat(objectA, objectB){
        const normalsA = objectA.getEdgeNormals();
        const normalsB = objectB.getEdgeNormals();

        const allNormals = normalsA.concat(normalsB);
        for (const normal of allNormals) {
            let minA = Infinity, maxA = -Infinity;
            for (const vertex of objectA.getVertices()) {
                const projection = vertex.x * normal.x + vertex.y * normal.y;
                minA = Math.min(minA, projection);
                maxA = Math.max(maxA, projection);
            }

            let minB = Infinity, maxB = -Infinity;
            for (const vertex of objectB.getVertices()) {
                const projection = vertex.x * normal.x + vertex.y * normal.y;
                minB = Math.min(minB, projection);
                maxB = Math.max(maxB, projection);
            }

            if (maxA < minB || maxB < minA) {
                return false; // Separating axis found
            }
        }

        console.debug("Collision detected between objectA and objectB");
        return true; // No separating axis found, collision detected

    }
}

export default Collision;
