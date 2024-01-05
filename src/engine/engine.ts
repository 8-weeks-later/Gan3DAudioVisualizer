import { canvasSize, numOfLight } from '../setting';
import GeometryGenerator from "../objects/geometryGenerator";
import Renderer from "./renderer";
import Camera from "./camera";
import AudioAnalyser from "../audioAnalyser/audioAnalyser";
import InputManager from './inputManager';
import ObjExporter from '../objects/objExporter';
import { mat4 } from 'gl-matrix';
import InteractionParameter from './interactionParameter';

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

        this.addInteractions();

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
    }

    private addInteractions(): void {
        const soundInput = document.querySelector("#soundFileInput");
        soundInput.addEventListener("input", () => {
            this.analyseAudio().then(() => {
                console.log("Loaded audio file");
            });
        });

        const objInput = document.querySelector("#objFileInput") as HTMLInputElement;
        objInput?.addEventListener("input", () => {
            this.loadObjFile(objInput).then(() => {
                console.log("Loaded obj file");
            });
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

        const interactionParameter = InteractionParameter.getInstance();
        for (let i = 0; i < numOfLight; i++){
            const htmlIndex = i + 1;
            const light = interactionParameter.GetLight(i);
            const lightDirectionXInput = document.querySelector(`#lightPositionRange${htmlIndex}X`) as HTMLInputElement;
            lightDirectionXInput.value = `${light.direction[0] * 20 + 50}`;
            lightDirectionXInput.addEventListener("input", () => {
                light.direction[0] = (parseFloat(lightDirectionXInput.value) - 50) / 20;
            });

            const lightDirectionYInput = document.querySelector(`#lightPositionRange${htmlIndex}Y`) as HTMLInputElement;
            lightDirectionYInput.value = `${light.direction[1] * 20 + 50}`;
            lightDirectionYInput.addEventListener("input", () => {
                light.direction[1] = (parseFloat(lightDirectionYInput.value) - 50) / 20;
            });

            const lightDirectionZInput = document.querySelector(`#lightPositionRange${htmlIndex}Z`) as HTMLInputElement;
            lightDirectionZInput.value = `${light.direction[2] * 20 + 50}`;
            lightDirectionZInput.addEventListener("input", () => {
                light.direction[2] = (parseFloat(lightDirectionZInput.value) - 50) / 20;
            });

            const lightColorRInput = document.querySelector(`#lightColorRange${htmlIndex}R`) as HTMLInputElement
            lightColorRInput.value = `${light.color[0] * 100}`;
            lightColorRInput.addEventListener("input", () => {
                light.color[0] = parseFloat(lightColorRInput.value) / 100;
            });

            const lightColorGInput = document.querySelector(`#lightColorRange${htmlIndex}G`) as HTMLInputElement
            lightColorGInput.value = `${light.color[1] * 100}`;
            lightColorGInput.addEventListener("input", () => {
                light.color[1] = parseFloat(lightColorGInput.value) / 100;
            });

            const lightColorBInput = document.querySelector(`#lightColorRange${htmlIndex}B`) as HTMLInputElement
            lightColorBInput.value = `${light.color[2] * 100}`;
            lightColorBInput.addEventListener("input", () => {
                light.color[2] = parseFloat(lightColorBInput.value) / 100;
            });

            const lightIntensityInput = document.querySelector(`#lightColorIntensity${htmlIndex}`) as HTMLInputElement;
            lightIntensityInput.value = `${light.intensity} * 50`;
            lightIntensityInput.addEventListener("input", () => {
                light.intensity = parseFloat(lightIntensityInput.value) / 50;
            });
        }
    }
}
