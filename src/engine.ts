import MeshData from "./objects/meshData";
import Renderer from "./renderer";

//#region Tmp
const positions = new Float32Array([
    -1.0, -1.0, 0.0,
    0.0, -1.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, -1.0, 0.0,
    1.0, -1.0, 0.0,
    1.0, 1.0, 0.0
]);

const colors = new Float32Array([
    1.0,
    0.0,
    0.0, // 🔴
    0.0,
    1.0,
    0.0, // 🟢
    0.0,
    0.0,
    1.0, // 🔵
    1.0,
    0.0,
    0.0, // 🔴
    0.0,
    1.0,
    0.0, // 🟢
    0.0,
    0.0,
    1.0 // 🔵
]);

const indices = new Uint16Array([0, 1, 2, 3, 4, 5]);
//#endregion Tmp

export default class Engine {
    canvas: HTMLCanvasElement;
    renderer: Renderer;

    constructor(canvas) {
        this.canvas = canvas;
        this.initCanvas(canvas);
        this.renderer = new Renderer(canvas);
    }
    
    async appRun() : Promise<void>{
        if (!(await this.renderer.initializeAPI())) {
            return;
        }

        this.renderer.resizeBackings();
        const meshData = new MeshData(positions, colors, indices);
        this.renderer.setMesh(meshData);
        
        this.renderer.render();

        while(1){
            // TODO: remove force delay
            // Update
            await new Promise(f => setTimeout(f, 1000)); 
            console.log("Updated!!")
        }
    }

    initCanvas(canvas: HTMLCanvasElement){
        canvas.width = canvas.height = 640;
    }
}
