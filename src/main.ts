import Engine from "./engine/engine";

const canvas = document.getElementById('gfx') as HTMLCanvasElement;
const engine = new Engine(canvas);

engine.appRun();