import { canvasSize } from "../setting";
import GeometryGenerator from "../objects/geometryGenerator";
import Renderer from "./renderer";
import Camera from "./camera";
import AudioAnalyser from "../audioAnalyser/audioAnalyser";
import InputManager from './inputManager';
import ObjExporter from '../objects/objExporter';
import { mat4 } from 'gl-matrix';

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

        const soundInput = document.querySelector("#soundFileInput");
        soundInput.addEventListener("input", () => {
            this.analyseAudio();
        });

        const objInput = document.querySelector("#objFileInput") as HTMLInputElement;
        objInput?.addEventListener("input", () => {
            this.loadObjFile(objInput);
        });

        const objExportButton = document.querySelector("#objExportButton");
        objExportButton?.addEventListener("click", () => {
            console.log(this.renderer.meshes.length);
            const meshData = ObjExporter.exportMesh(this.renderer.meshes[this.renderer.meshes.length - 2]);
            const blob = new Blob([meshData], {type: "text/plain;charset=utf-8"});
            const a = document.createElement("a");
            a.download = "mesh.obj";
            a.href = URL.createObjectURL(blob);
            a.click();
        });

        this.renderer.resizeBackings();

        Camera.getInstance().initialize();
        Camera.getInstance().setPosition([0, 0, -10]);

        this.renderer.setMesh(this.geoGen.makeBox(1));
        await this.renderer.setCubeMapMesh(this.geoGen.makeBox(40));
        this.renderer.render();

        InputManager.getInstance().init(this.canvas, this.renderer.device);
    }

    initCanvas(canvas: HTMLCanvasElement){
        canvas.width = canvas.height = canvasSize;
    }

    async analyseAudio(): Promise<void>{
        const data = await this.audioAnalyser.analyse();
        this.renderer.setMesh(this.geoGen.makeAudioMesh(data, 5, 64));
    }

    async loadObjFile(objInput: HTMLInputElement): Promise<void>{
        const response = await fetch(URL.createObjectURL(objInput.files[0]))
        if (!response.ok){
            throw new Error("Failed to load obj file");
        }
        const file = await response.text();
        this.renderer.setMesh(this.geoGen.makeObjMesh(file));
        let mesh = this.renderer.meshes[0];
        mat4.rotateX(mesh.transform, mesh.transform, Math.PI / 2);
        mesh.rotType = 1;
        console.log("Loaded obj file");
    }
}
