import Renderer from "./renderer";

export default class Engine {
    canvas: HTMLCanvasElement;
    renderer: Renderer;

    constructor(canvas: any);
    appRun(): Promise<void>;
    initCanvas(): void;
}