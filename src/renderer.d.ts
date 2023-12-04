import { mat4 } from "gl-matrix";
import Mesh from "./objects/mesh";
import MeshData from "./objects/meshData";

export default class Renderer {
    canvas: HTMLCanvasElement;
    adapter: GPUAdapter;
    device: GPUDevice;
    queue: GPUQueue;
    context: GPUCanvasContext;
    colorTexture: GPUTexture;
    colorTextureView: GPUTextureView;
    depthTexture: GPUTexture;
    depthTextureView: GPUTextureView;
    meshes: Mesh[];
    commandEncoder: GPUCommandEncoder;
    passEncoder: GPURenderPassEncoder;
    cubemapTexture: GPUTexture;
    constructor(canvas: any);
    initializeAPI(): Promise<boolean>;
    resizeBackings(): void;
    encodeCommands(): void;
    render: () => void;
    setMesh(meshData: MeshData, cubeMapMesh: MeshData): Promise<void>;
}