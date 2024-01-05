export const canvasSize = 600

export const numOfLight = 3;

export default class CameraSetting{
    static readonly fov = 45;
    static readonly fovRadian = CameraSetting.fov * Math.PI / 180;
    static readonly near = 0.1;
    static readonly far = 100;
}