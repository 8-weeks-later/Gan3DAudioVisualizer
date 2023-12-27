import Camera from './camera';

export default class InputManager {
    //#region Singleton
    private static instance: InputManager;

    private constructor() {
    }

    public static getInstance() {
        return this.instance || (this.instance = new this())
    }
    //#endregion Singleton

    private isOnDrag: boolean = false;

    public init(canvas: HTMLCanvasElement): void {
        canvas.addEventListener("mousemove", this.onMouseMove);
        canvas.addEventListener("mousedown", this.onMouseDown);
        canvas.addEventListener("mouseup", this.onMouseUp);
        canvas.addEventListener("keydown", this.onKeyDown);
        canvas.addEventListener("keyup", this.onKeyUp);
        canvas.addEventListener("wheel", this.onWheel);
    }

    private onMouseMove(mouseEvent: MouseEvent): void {
        if (!this.isOnDrag) return;
        Camera.getInstance().rotateXY(mouseEvent.movementY / 100, mouseEvent.movementX / 100);
    }

    public onMouseDown(mouseEvent: MouseEvent): void {
        if (mouseEvent.button === 0) {
            this.isOnDrag = true;
        }
    }

    public onMouseUp(mouseEvent: MouseEvent): void {
        if (mouseEvent.button === 0) {
            this.isOnDrag = false;
        }
    }

    public onKeyDown(keyboardEvent: KeyboardEvent): void {
        if (keyboardEvent.key === "`") {
            Camera.getInstance().initialize();
        }
    }

    public onKeyUp(keyboardEvent: KeyboardEvent): void {
    }

    public onWheel(wheelEvent: WheelEvent): void {
        Camera.getInstance().moveForward(wheelEvent.deltaY / 100);
    }
}