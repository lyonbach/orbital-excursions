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


export interface CollisionResult {
    normal: Point2;
    penetrationDepth: number;
    contactPoint: Point2;
}


export interface ShipSettings {
    thrust?: Vector2;
    angularThrustCapability?: number;
    thrustCapability?: Vector2;
}

export interface LandingGearContact {
    point: Point2;
    normal: Point2;
    compression: number;
    requiredCompression: number;
    bottomedOut: boolean;
}
