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
    mesh : Mesh;
    cubeMapMesh : Mesh;
    defaultPipeline: GPURenderPipeline;
    cubemapPipeline: GPURenderPipeline;
    commandEncoder: GPUCommandEncoder;
    passEncoder: GPURenderPassEncoder;
    cubemapTexture: GPUTexture;
    constructor(canvas: any);
    start(): Promise<void>;
    initializeAPI(): Promise<boolean>;
    createPipeline(): void;
    resizeBackings(): void;
    encodeCommands(): void;
    render: () => void;
    setMesh(meshData: MeshData, cubeMapMesh: MeshData): Promise<void>;
}