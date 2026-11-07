class GameObject {
    render(context) {
        // Default render method for a game object.
    }
}

class StaticObject extends GameObject {
    constructor(position) {
        super();
        this.position = position;
    }

    render(context) {
        // Default render method for a static object.
    }
}

class DynamicObject extends GameObject {
    constructor(position, velocity) {
        super();
        this.position = position;
        this.velocity = velocity;
    }
    render(context) {
        // Default render method for a dynamic object.
    }
}


class Platform extends StaticObject {
    constructor(position, width, height) {
        super(position);
        this.width = width;
        this.height = height;
    }

    render(context) {
        context.fillStyle = "gray";
        context.fillRect(this.position.x, this.position.y, this.width, this.height);

        /** DEBUG: Draw edge normals for debugging
        // const normals = this.getEdgeNormals();
        // const vertices = this.getVertices();
        // context.save();
        context.strokeStyle = "red";
        for (let i = 0; i < vertices.length; i++) {
            const this_v = vertices[i];
            const next_v = vertices[(i + 1) % vertices.length];
            const midX = (this_v.x + next_v.x) / 2;
            const midY = (this_v.y + next_v.y) / 2;
            const n = normals[i];
            context.beginPath();
            context.moveTo(midX, midY);
            context.lineTo(midX + n.x * 50, midY + n.y * 50);
            context.stroke();
        }
        context.restore(); */
        
    }

    getAABB() {
        return {
            minX: this.position.x,
            minY: this.position.y,
            maxX: this.position.x + this.width,
            maxY: this.position.y + this.height
        };
    }

    getVertices() {
        const vertices = [
            { x: this.position.x, y: this.position.y },
            { x: this.position.x + this.width, y: this.position.y },
            { x: this.position.x + this.width, y: this.position.y + this.height },
            { x: this.position.x, y: this.position.y + this.height }
        ];
        return vertices;
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

}

export { Platform }
