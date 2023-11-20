import GeometryGenerator from "./objects/geometryGenerator";
import Renderer from "./renderer";

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

        const geometryGenerator = new GeometryGenerator;

        this.renderer.resizeBackings();

        this.renderer.setMesh(geometryGenerator.makeTriangle(1.0));
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
