import MeshData from "./meshData";
import { mat4 } from 'gl-matrix';

export default class Mesh{
    positionBuffer: GPUBuffer;
    colorBuffer: GPUBuffer;
    indexBuffer: GPUBuffer;
    uvBuffer: GPUBuffer;
    normalBuffer: GPUBuffer;
    numOfIndex: number;
    
    device: GPUDevice;
    pipeline: GPURenderPipeline;

    vertModule: GPUShaderModule;
    fragModule: GPUShaderModule;

    meshData: MeshData;

    transform: mat4;

    constructor(meshData: MeshData, device: GPUDevice);

    createShaderModel(): void;
    createPipeline(): void;
    render(passEncoder: GPURenderPassEncoder): void;
}
