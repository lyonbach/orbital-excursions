import Vector2 from "./vector";

export interface Point2 {
    x: number;
    y: number;
}

export interface AABB {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}

export interface Renderable {
    render(context: CanvasRenderingContext2D): void;
}

export interface Updatable {
    update(deltaTime: number): void;
}

export interface Collidable {
    getVertices(): Point2[];
    getEdgeNormals(): Point2[];
    getAABB(): AABB;
}

export interface ShipSettings {
    thrust?: Vector2;
    angularThrustCapability?: number;
    thrustCapability?: Vector2;
}