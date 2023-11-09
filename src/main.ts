import Engine from "./engine";

const canvas = document.getElementById('gfx') as HTMLCanvasElement;
const engine = new Engine(canvas);

engine.appRun();