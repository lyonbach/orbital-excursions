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
    }
}

export { Platform }
