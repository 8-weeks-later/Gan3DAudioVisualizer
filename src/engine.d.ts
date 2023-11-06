import Renderer from "./renderer";

export default class Engine {
    canvas: HTMLCanvasElement;
    renderer: Renderer;

    constructor(canvas: any);
    main(): Promise<void>;
    initCanvas(): void;
}