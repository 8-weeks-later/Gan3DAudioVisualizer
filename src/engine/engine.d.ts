import Renderer from "./renderer";
import AudioAnalyser from "../audioAnalyser/audioAnalyser";

export default class Engine {
    // @ts-ignore
    canvas: HTMLCanvasElement;
    renderer: Renderer;
    audioAnalyser: AudioAnalyser;

    constructor(canvas: any);
    appRun(): Promise<void>;
    initCanvas(): void;
    analyseAudio(): Promise<void>;

    // @ts-ignore
    loadObjFile(objInput: HTMLInputElement): Promise<void>;

    private addInteractions(): void;
}