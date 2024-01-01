import Camera from './camera';
import CubeMapManager from './cubeMapManager';

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
    private device: GPUDevice;

    public init(canvas: HTMLCanvasElement, device: GPUDevice): void {
        canvas.addEventListener("mousemove", this.onMouseMove);
        canvas.addEventListener("mousedown", this.onMouseDown);
        canvas.addEventListener("mouseup", this.onMouseUp);
        canvas.addEventListener("keydown", this.onKeyDown);
        canvas.addEventListener("keyup", this.onKeyUp);
        canvas.addEventListener("wheel", this.onWheel);
        this.device = device;
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

        const inputManager = InputManager.getInstance();
        inputManager.processMoveKey(keyboardEvent);
        inputManager.processNumberKey(keyboardEvent);
    }

    public onKeyUp(keyboardEvent: KeyboardEvent): void {
    }

    public onWheel(wheelEvent: WheelEvent): void {
        Camera.getInstance().moveForward(wheelEvent.deltaY / 100);
    }

    private processMoveKey(keyboardEvent: KeyboardEvent): void {
        const moveSpeed = 0.3;
        if (keyboardEvent.key == "w")
            Camera.getInstance().moveForward(moveSpeed);
        if (keyboardEvent.key == "s")
            Camera.getInstance().moveForward(-moveSpeed);
        if (keyboardEvent.key == "a")
            Camera.getInstance().moveRight(moveSpeed);
        if (keyboardEvent.key == "d")
            Camera.getInstance().moveRight(-moveSpeed);
        if (keyboardEvent.key == "q")
            Camera.getInstance().moveUp(-moveSpeed);
        if (keyboardEvent.key == "e")
            Camera.getInstance().moveUp(moveSpeed);
    }

    private processNumberKey(keyboardEvent: KeyboardEvent): void {
        const key = parseInt(keyboardEvent.key);
        if (key < 0 || key > 9) return;

        switch (key) {
            case 1:
                if (this.device != null) {
                    CubeMapManager.getInstance().changeCubeMap(0, this.device);
                }
                break;
            case 2:
                if (this.device != null) {
                    CubeMapManager.getInstance().changeCubeMap(1, this.device);
                }
                break;
            case 3:
                if (this.device != null) {
                    CubeMapManager.getInstance().changeCubeMap(2, this.device);
                }
                break;
            case 4:
                if (this.device != null) {
                    CubeMapManager.getInstance().changeCubeMap(3, this.device);
                }
                break;
        }
    }
}