import Renderer from "./renderer";
import AudioAnalyser from "./audioAnalyser/audioAnalyser";

export default class Engine {
    canvas: HTMLCanvasElement;
    renderer: Renderer;
    audioAnalyser: AudioAnalyser;

    constructor(canvas: any);
    appRun(): Promise<void>;
    initCanvas(): void;
    analyseAudio(): Promise<void>;
}