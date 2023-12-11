import { canvasSize } from "./setting";
import GeometryGenerator from "./objects/geometryGenerator";
import Renderer from "./renderer";
import AudioAnalyser from "./audioAnalyser/audioAnalyser";

export default class Engine {
    canvas: HTMLCanvasElement;
    renderer: Renderer;
    audioAnalyser: AudioAnalyser;

    constructor(canvas) {
        this.canvas = canvas;
        this.initCanvas(canvas);
        this.renderer = new Renderer(canvas);
        this.audioAnalyser = new AudioAnalyser(64, 44100, 512);
    }
    
    async appRun() : Promise<void>{
        if (!(await this.renderer.initializeAPI())) {
            return;
        }

        const input = document.querySelector("input");
        input.addEventListener("input", this.analyseAudio);

        const geometryGenerator = new GeometryGenerator;

        this.renderer.resizeBackings();

        await this.renderer.setMesh(geometryGenerator.makeBox(1), geometryGenerator.makeBox(45));
        this.renderer.render();

        while(1){
            // TODO: remove force delay
            // Update
            await new Promise(f => setTimeout(f, 1000)); 
            console.log("Updated!!")
        }
    }

    initCanvas(canvas: HTMLCanvasElement){
        canvas.width = canvas.height = canvasSize;
    }

    async analyseAudio(): Promise<void>{
        const data = await this.audioAnalyser.analyser();
    }
}
