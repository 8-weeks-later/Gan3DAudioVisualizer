import { mat4, vec3 } from "gl-matrix";
import CameraSetting, { canvasSize } from "./setting";

export default class Camera{
    //#region Singleton
    private static instance: Camera;

    private constructor() { 
    }

    public static getInstance() {
        return this.instance || (this.instance = new this())
    }
    //#endregion Singleton

    private viewMatrix: mat4 = mat4.create();
    private projectionMatrix: mat4 = mat4.create();

    private position: vec3 = vec3.create();
    private rotation: vec3 = vec3.create();

    public initialize(): void {
        this.updateProjectionMatrix();
        this.updateViewMatrix();
    }

    public getPosition(): vec3 {
        return this.position;
    }

    public getProjectionMatrix(): mat4 {
        return this.projectionMatrix;
    }

    public getViewMatrix(): mat4 {
        return this.viewMatrix;
    }

    public updateProjectionMatrix(): void {
        mat4.identity(this.projectionMatrix);
        mat4.perspective(this.projectionMatrix, CameraSetting.fovRadian, canvasSize / canvasSize, CameraSetting.near, CameraSetting.far);
    }

    public updateViewMatrix(): void {
        mat4.identity(this.viewMatrix);
        mat4.translate(this.viewMatrix, this.viewMatrix, this.position);
        mat4.rotateX(this.viewMatrix, this.viewMatrix, this.rotation[0]);
        mat4.rotateY(this.viewMatrix, this.viewMatrix, this.rotation[1]);
        mat4.rotateZ(this.viewMatrix, this.viewMatrix, this.rotation[2]);
    }

    public setPosition(position: vec3): void {
        this.position = position;
        this.updateViewMatrix();
    }

    public setRotation(rotation: vec3): void {
        this.rotation = rotation;
        this.updateViewMatrix();
    }
}