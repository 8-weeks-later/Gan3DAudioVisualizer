export default class InputManager {
    private static instance: InputManager;

    private constructor();

    public static getInstance();

    private isOnDrag: boolean;

    public init(canvas: HTMLCanvasElement): void;
    public onMouseMove(mouseEvent: MouseEvent): void;
    public onMouseDown(mouseEvent: MouseEvent): void;
    public onMouseUp(mouseEvent: MouseEvent): void;
    public onKeyDown(keyboardEvent: KeyboardEvent): void;
    public onKeyUp(keyboardEvent: KeyboardEvent): void;
    public onWheel(wheelEvent: WheelEvent): void;
}