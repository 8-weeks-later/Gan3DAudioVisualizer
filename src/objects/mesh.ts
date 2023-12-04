import MeshData from "./meshData";

import defaultVSCode from '../shaders/default.vert.wgsl';
import defaultFSCode from '../shaders/default.frag.wgsl';
import cubeMapVSCode from '../shaders/cubemap.vert.wgsl';
import cubeMapFSCode from '../shaders/cubemap.frag.wgsl';

// 적은 개수의 쉐이더만 사용할것으로 예상하고 Union Type을 사용함
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
    shaderType: eShaderType;
    
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
        this.shaderType = shaderType;

        this.createShaderModel();

        this.positionBuffer = createBuffer(meshData.positions, GPUBufferUsage.VERTEX);
        this.colorBuffer = createBuffer(meshData.colors, GPUBufferUsage.VERTEX);
        this.indexBuffer = createBuffer(meshData.indices, GPUBufferUsage.INDEX);
        this.uvBuffer = createBuffer(meshData.uv, GPUBufferUsage.VERTEX);
        this.numOfIndex = meshData.indices.length;
    }

    createShaderModel(){
        switch(this.shaderType){
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
    
    createPipeline(): GPURenderPipeline{
        let rst = null;
        switch(this.shaderType){
            case "Default":
                rst = this.createDefaultPipeline();
                break;
            case "CubeMap":
                rst = this.createCubemapPipeline();
                break;
        }
        return rst;
    }

    createDefaultPipeline(): GPURenderPipeline{
        // 🔣 Input Assembly
        const positionAttribDesc: GPUVertexAttribute = {
            shaderLocation: 0, // [[location(0)]]
            offset: 0,
            format: 'float32x4'
        };
        const colorAttribDesc: GPUVertexAttribute = {
            shaderLocation: 1, // [[location(1)]]
            offset: 0,
            format: 'float32x4'
        };  
        const uvAttribDesc: GPUVertexAttribute = {
            shaderLocation: 2, // [[location(2)]]
            offset: 0,
            format: 'float32x2'
        };
        const positionBufferDesc: GPUVertexBufferLayout = {
            attributes: [positionAttribDesc],
            arrayStride: 4 * 4, // sizeof(float) * 4
            stepMode: 'vertex'
        };
        const colorBufferDesc: GPUVertexBufferLayout = {
            attributes: [colorAttribDesc],
            arrayStride: 4 * 4, // sizeof(float) * 4
            stepMode: 'vertex'
        };
        const uvBufferDesc: GPUVertexBufferLayout = {
            attributes: [uvAttribDesc],
            arrayStride: 4 * 2, // sizeof(float) * 2
            stepMode: 'vertex'
        };

        // 🌑 Depth
        const depthStencil: GPUDepthStencilState = {
            depthWriteEnabled: true,
            depthCompare: 'less',
            format: 'depth24plus-stencil8'
        };

        // 🦄 Uniform Data
        const bindGroupLayout = this.device.createBindGroupLayout({
            entries: [{
              binding: 0, // camera uniforms
              visibility: GPUShaderStage.VERTEX,
              buffer: {},
            }, {
              binding: 1, // model uniform
              visibility: GPUShaderStage.VERTEX,
              buffer: {},
            }]
        });

        const pipelineLayoutDesc = { bindGroupLayouts: [
            bindGroupLayout // @group(0)
        ]};
        const layout = this.device.createPipelineLayout(pipelineLayoutDesc);

        // 🎭 Shader Stages
        const vertex: GPUVertexState = {
            module: this.vertModule,
            entryPoint: 'main',
            buffers: [positionBufferDesc, colorBufferDesc, uvBufferDesc]
        };

        // 🌀 Color/Blend State
        const colorState: GPUColorTargetState = {
            format: 'bgra8unorm'
        };

        const fragment: GPUFragmentState = {
            module: this.fragModule,
            entryPoint: 'main',
            targets: [colorState]
        };

        // 🟨 Rasterization
        const primitive: GPUPrimitiveState = {
            frontFace: 'cw',
            cullMode: 'none',
            topology: 'triangle-list'
        };

        const pipelineDesc: GPURenderPipelineDescriptor = {
            layout,
            vertex,
            fragment,
            primitive,
            depthStencil
        };
        return this.device.createRenderPipeline(pipelineDesc);
    }

    createCubemapPipeline(): GPURenderPipeline{
        // 🔣 Input Assembly
        const positionAttribDesc: GPUVertexAttribute = {
            shaderLocation: 0, // [[location(0)]]
            offset: 0,
            format: 'float32x4'
        };
        const colorAttribDesc: GPUVertexAttribute = {
            shaderLocation: 1, // [[location(1)]]
            offset: 0,
            format: 'float32x4'
        };
        const positionBufferDesc: GPUVertexBufferLayout = {
            attributes: [positionAttribDesc],
            arrayStride: 4 * 4, // sizeof(float) * 4
            stepMode: 'vertex'
        };
        const colorBufferDesc: GPUVertexBufferLayout = {
            attributes: [colorAttribDesc],
            arrayStride: 4 * 4, // sizeof(float) * 4
            stepMode: 'vertex'
        };

        // 🌑 Depth
        const depthStencil: GPUDepthStencilState = {
            depthWriteEnabled: true,
            depthCompare: 'less',
            format: 'depth24plus-stencil8'
        };

        // 🦄 Uniform Data
        const bindGroupLayout = this.device.createBindGroupLayout({
            entries: [{
                binding: 0,
                visibility: GPUShaderStage.VERTEX,
                buffer: {},
              }, {
                binding: 1,
                visibility: GPUShaderStage.FRAGMENT,
                sampler: {},
            }, {
                binding: 2,
                visibility: GPUShaderStage.FRAGMENT,
                texture: {viewDimension: 'cube'},
            }]
        });

        const pipelineLayoutDesc = { bindGroupLayouts: [
            bindGroupLayout // @group(0)
        ]};
        const layout = this.device.createPipelineLayout(pipelineLayoutDesc);

        // 🎭 Shader Stages
        const vertex: GPUVertexState = {
            module: this.vertModule,
            entryPoint: 'main',
            buffers: [positionBufferDesc, colorBufferDesc]
        };

        // 🌀 Color/Blend State
        const colorState: GPUColorTargetState = {
            format: 'bgra8unorm'
        };

        const fragment: GPUFragmentState = {
            module: this.fragModule,
            entryPoint: 'main',
            targets: [colorState]
        };

        // 🟨 Rasterization
        const primitive: GPUPrimitiveState = {
            frontFace: 'cw',
            cullMode: 'none',
            topology: 'triangle-list'
        };

        const pipelineDesc: GPURenderPipelineDescriptor = {
            layout,
            vertex,
            fragment,
            primitive,
            depthStencil
        };
        return this.device.createRenderPipeline(pipelineDesc);
    }
}