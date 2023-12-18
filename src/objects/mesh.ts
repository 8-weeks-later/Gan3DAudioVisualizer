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

    transform: mat4;

    constructor(meshData: MeshData, device: GPUDevice){
        const createBuffer = (
            arr: Float32Array | Uint16Array,
            usage: number
        ) => {
            // 📏 Align to 4 bytes (thanks @chrimsonite)
            let desc = {
                size: (arr.byteLength + 3) & ~3,
                usage,
                mappedAtCreation: true
            };
            let buffer = device.createBuffer(desc);
            const writeArray =
                arr instanceof Uint16Array
                    ? new Uint16Array(buffer.getMappedRange())
                    : new Float32Array(buffer.getMappedRange());
            writeArray.set(arr);
            buffer.unmap();
            return buffer;
        };

        this.transform = mat4.create();
        this.device = device;
        this.createShaderModel();

        this.positionBuffer = createBuffer(meshData.positions, GPUBufferUsage.VERTEX);
        this.colorBuffer = createBuffer(meshData.colors, GPUBufferUsage.VERTEX);
        this.indexBuffer = createBuffer(meshData.indices, GPUBufferUsage.INDEX);
        this.uvBuffer = createBuffer(meshData.uv, GPUBufferUsage.VERTEX);
        this.normalBuffer = createBuffer(meshData.normals, GPUBufferUsage.VERTEX);
        this.numOfIndex = meshData.indices.length;

        this.createPipeline();
    }

    createShaderModel(){}
    createPipeline(){}
    render(passEncoder: GPURenderPassEncoder){}
}