import { mat4, vec3 } from "gl-matrix";

export default class Camera {
    private static instance: Camera;
    private constructor();
    public static getInstance();

    private viewMatrix: mat4;
    private projectionMatrix: mat4;

    private position: vec3;
    private rotation: vec3;

    public initialize(): void;
    public getProjectionMatrix(): mat4;
    public getViewMatrix(): mat4;
    public updateProjectionMatrix(): void;
    public updateViewMatrix(): void;
    public setPosition(position: vec3): void;
    public setRotation(rotation: vec3): void;
}