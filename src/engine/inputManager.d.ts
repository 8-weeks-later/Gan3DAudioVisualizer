export default class InputManager {
    private static instance: InputManager;

    private constructor();

    public static getInstance();

    private isOnDrag: boolean;
    // @ts-ignore
    private device: GPUDevice;

    // @ts-ignore
    public init(canvas: HTMLCanvasElement): void;
    // @ts-ignore
    public onMouseMove(mouseEvent: MouseEvent): void;
    // @ts-ignore
    public onMouseDown(mouseEvent: MouseEvent): void;
    // @ts-ignore
    public onMouseUp(mouseEvent: MouseEvent): void;
    // @ts-ignore
    public onKeyDown(keyboardEvent: KeyboardEvent): void;
    // @ts-ignore
    public onKeyUp(keyboardEvent: KeyboardEvent): void;
    // @ts-ignore
    public onWheel(wheelEvent: WheelEvent): void;

    // @ts-ignore
    private processMoveKey(keyboardEvent: KeyboardEvent): void;
    // @ts-ignore
    private processNumberKey(keyboardEvent: KeyboardEvent): void;
}