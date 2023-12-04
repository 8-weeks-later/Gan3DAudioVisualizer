import MeshData from "./meshData";

import defaultVSCode from '../shaders/default.vert.wgsl';
import defaultFSCode from '../shaders/default.frag.wgsl';
import cubeMapVSCode from '../shaders/cubemap.vert.wgsl';
import cubeMapFSCode from '../shaders/cubemap.frag.wgsl';

const eShaderType = {
    DEFAULT: 'Default',
    CUBE_MAP: 'CubeMap'
  } as const;
  type eShaderType = typeof eShaderType[keyof typeof eShaderType];

export default class Mesh{
    positionBuffer: GPUBuffer;
    colorBuffer: GPUBuffer;
    indexBuffer: GPUBuffer;
    uvBuffer: GPUBuffer;
    numOfIndex: number;
    
    device: GPUDevice;

    vertModule: GPUShaderModule;
    fragModule: GPUShaderModule;

    constructor(meshData: MeshData, shaderType: eShaderType, device: GPUDevice){
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

        this.device = device;
        this.createShaderModel(shaderType);

        this.positionBuffer = createBuffer(meshData.positions, GPUBufferUsage.VERTEX);
        this.colorBuffer = createBuffer(meshData.colors, GPUBufferUsage.VERTEX);
        this.indexBuffer = createBuffer(meshData.indices, GPUBufferUsage.INDEX);
        this.uvBuffer = createBuffer(meshData.uv, GPUBufferUsage.VERTEX);
        this.numOfIndex = meshData.indices.length;
    }

    createShaderModel(shaderType: eShaderType){
        switch(shaderType){
            case "Default":
                const defaultVsmDesc = {
                    code: defaultVSCode
                };
                this.vertModule = this.device.createShaderModule(defaultVsmDesc);
        
                const defaultFsmDesc = {
                    code: defaultFSCode
                };
                this.fragModule = this.device.createShaderModule(defaultFsmDesc);
                break;
            case "CubeMap": 
                const cubemapVsmDesc = {
                    code: cubeMapVSCode
                };
                this.vertModule = this.device.createShaderModule(cubemapVsmDesc);
                const cubemapFsmDesc = {
                    code: cubeMapFSCode
                };
                this.fragModule = this.device.createShaderModule(cubemapFsmDesc);
                break;
        }
    }
}