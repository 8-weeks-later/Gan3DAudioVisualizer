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
    bindGroupLayout: GPUBindGroupLayout;
    commandEncoder: GPUCommandEncoder;
    passEncoder: GPURenderPassEncoder;
    modelMatrix: mat4;
    constructor(canvas: any);
    start(): Promise<void>;
    initializeAPI(): Promise<boolean>;
    initializeResources(): void;
    createDefaultPipeline(): void;
    createCubemapPipeline(): void;
    resizeBackings(): void;
    encodeCommands(): void;
    render: () => void;
    setMesh(meshData: MeshData, cubeMapMesh: MeshData): boolean;
}