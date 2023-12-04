import Mesh from "./mesh";
import MeshData from "./meshData";
import { mat4, vec4 } from 'gl-matrix';

import vsCode from '../shaders/default.vert.wgsl';
import fsCode from '../shaders/default.frag.wgsl';
import CameraSetting, { canvasSize } from "../setting";

export default class DefaultShaderMesh extends Mesh{
    constructor(meshData: MeshData, device: GPUDevice){
        super(meshData, device);

        // tmp
        mat4.rotateX(this.transform, this.transform, 40);
    }

    createShaderModel(){
        this.vertModule = this.device.createShaderModule({code: vsCode});
        this.fragModule = this.device.createShaderModule({code: fsCode});
    }

    createPipeline(): GPURenderPipeline {
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

        this.pipeline = this.device.createRenderPipeline(pipelineDesc);
        return this.pipeline;
    }
    
    render(passEncoder: GPURenderPassEncoder){
        const cameraBuffer = this.device.createBuffer({
            size: 144, // Room for two 4x4 matrices and a vec3
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM
        });
        
        const modelBuffer = this.device.createBuffer({
            size: 64, // Room for one 4x4 matrix
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM
        });
        
        const bindGroup = this.device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(0),
            entries: [{
                binding: 0,
                resource: { buffer: cameraBuffer },
            }, {
                binding: 1,
                resource: { buffer: modelBuffer },
            }],
            });
        
        const cameraArray = new Float32Array(36);
        const projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, CameraSetting.fovRadian, canvasSize / canvasSize, CameraSetting.near, CameraSetting.far);
        const viewMatrix = mat4.create();
        mat4.translate(viewMatrix, viewMatrix, [0, 0, -10]);
        const cameraPosition = vec4.create();
        vec4.set(cameraPosition, 0, 0, 0, 0);

        mat4.rotateY(this.transform, this.transform, 1 * 0.04);

        cameraArray.set(projectionMatrix, 0);
        cameraArray.set(viewMatrix, 16);
        cameraArray.set(cameraPosition, 32);

        // Update the camera uniform buffer
        this.device.queue.writeBuffer(cameraBuffer, 0, cameraArray);

        // Update the model uniform buffer
        this.device.queue.writeBuffer(modelBuffer, 0, this.transform as Float32Array);
        
        passEncoder.setPipeline(this.pipeline);
        passEncoder.setBindGroup(0, bindGroup);
        
        passEncoder.setVertexBuffer(0, this.positionBuffer);
        passEncoder.setVertexBuffer(1, this.colorBuffer);
        passEncoder.setVertexBuffer(2, this.uvBuffer);
        passEncoder.setIndexBuffer(this.indexBuffer, 'uint16');
        passEncoder.drawIndexed(this.numOfIndex);
    }
}