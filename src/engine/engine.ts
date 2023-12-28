import { canvasSize } from "../setting";
import GeometryGenerator from "../objects/geometryGenerator";
import Renderer from "./renderer";
import Camera from "./camera";
import AudioAnalyser from "../audioAnalyser/audioAnalyser";
import InputManager from './inputManager';

export default class Engine {
    canvas: HTMLCanvasElement;
    renderer: Renderer;
    audioAnalyser: AudioAnalyser;
    geoGen: GeometryGenerator = new GeometryGenerator;

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
        input.addEventListener("input", () => {
            this.analyseAudio();
        });

        this.renderer.resizeBackings();

        Camera.getInstance().initialize();
        Camera.getInstance().setPosition([0, 0, -10]);

        await this.renderer.setMesh(this.geoGen.makeBox(1), this.geoGen.makeBox(45));
        this.renderer.render();

        InputManager.getInstance().init(this.canvas, this.renderer.device);
    }

    initCanvas(canvas: HTMLCanvasElement){
        canvas.width = canvas.height = canvasSize;
    }

    async analyseAudio(): Promise<void>{
        const data = await this.audioAnalyser.analyse();
        await this.renderer.setMesh(this.geoGen.makeAudioMesh(data, 5, 64), this.geoGen.makeBox(45));
    }

    async loadObjFile(objInput: HTMLInputElement): Promise<void>{
        const response = await fetch(URL.createObjectURL(objInput.files[0]))
        if (!response.ok){
            throw new Error("Failed to load obj file");
        }
        const file = await response.text();
        await this.renderer.setMesh(this.geoGen.makeObjMesh(file), this.geoGen.makeBox(45));
        console.log("Loaded obj file");
    }
}
