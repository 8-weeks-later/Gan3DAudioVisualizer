import Mesh from "./mesh";
import MeshData from "./meshData";
import { mat4, vec3, vec4 } from 'gl-matrix';

import vsCode from '../shaders/default.vert.wgsl';
import fsCode from '../shaders/default.frag.wgsl';
import CameraSetting, { canvasSize } from "../setting";

export default class DefaultShaderMesh extends Mesh{
    constructor(meshData: MeshData, device: GPUDevice){
        super(meshData, device);
        mat4.rotateX(this.transform, this.transform, -1.5708);
    }

    createShaderModel(){
        this.vertModule = this.device.createShaderModule({code: vsCode});
        this.fragModule = this.device.createShaderModule({code: fsCode});
    }

    createPipeline(){
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
        const normalAttribDesc: GPUVertexAttribute = {
            shaderLocation: 3, // [[location(3)]]
            offset: 0,
            format: 'float32x3'
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
        const normalBufferDesc: GPUVertexBufferLayout = {
            attributes: [normalAttribDesc],
            arrayStride: 4 * 3, // sizeof(float) * 3
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
            },{
                binding: 2, // eye position
                visibility: GPUShaderStage.FRAGMENT,
                buffer: {},
            },{
                binding: 3, // light
                visibility: GPUShaderStage.FRAGMENT,
                buffer: {},
            },{
                binding: 4, // material
                visibility: GPUShaderStage.FRAGMENT,
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
            buffers: [positionBufferDesc, colorBufferDesc, uvBufferDesc, normalBufferDesc]
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

        const eyePositionBuffer = this.device.createBuffer({
            size: 16, // Room for one vec4
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM
        });

        const lightBuffer = this.device.createBuffer({
            size: 32, // Room for two vec4
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM
        });

        const materialBuffer = this.device.createBuffer({
            size: 64, // Room for three vec4
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
            }, {
                binding: 2,
                resource: { buffer: eyePositionBuffer },
            }, {
                binding: 3,
                resource: { buffer: lightBuffer },
            }, {
                binding: 4,
                resource: { buffer: materialBuffer },
            }],
            });
        
        const cameraArray = new Float32Array(36);
        const projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, CameraSetting.fovRadian, canvasSize / canvasSize, CameraSetting.near, CameraSetting.far);
        const viewMatrix = mat4.create();
        mat4.translate(viewMatrix, viewMatrix, [0, 0, -10]);
        const cameraPosition = vec4.create();
        vec4.set(cameraPosition, 0, 0, -10, 0);

        mat4.rotateZ(this.transform, this.transform, 1 * 0.04);

        cameraArray.set(projectionMatrix, 0);
        cameraArray.set(viewMatrix, 16);
        cameraArray.set(cameraPosition, 32);

        this.device.queue.writeBuffer(cameraBuffer, 0, cameraArray);
        this.device.queue.writeBuffer(modelBuffer, 0, this.transform as Float32Array);

        const eyePositionArray = new Float32Array(4);
        eyePositionArray.set(cameraPosition, 0);
        this.device.queue.writeBuffer(eyePositionBuffer, 0, eyePositionArray);

        const lightArray = new Float32Array(8);
        const lightDirection = vec3.create();
        vec3.set(lightDirection, 0.3, 0.3, -1.0);
        lightArray.set(lightDirection, 0);
        
        lightArray.set([0], 3);

        const lightColor = vec3.create();
        vec3.set(lightColor, 1, 1, 1);
        lightArray.set(lightColor, 4);

        const lightIntensity = 2;
        lightArray.set([lightIntensity], 7);
        this.device.queue.writeBuffer(lightBuffer, 0, lightArray);

        const materialArray = new Float32Array(12);
        const ambient = vec3.create();
        vec3.set(ambient, 0.1, 0.1, 0.1);
        materialArray.set(ambient, 0);

        lightArray.set([0], 3);

        const diffuse = vec3.create();
        vec3.set(diffuse, 0.5, 0.5, 0.5);
        materialArray.set(diffuse, 4);
        
        lightArray.set([0], 7);

        const specular = vec3.create();
        vec3.set(specular, 1, 1, 1);
        materialArray.set(specular, 8);
        
        const shininess = 32;
        materialArray.set([shininess], 11);
        this.device.queue.writeBuffer(materialBuffer, 0, materialArray);
        
        passEncoder.setPipeline(this.pipeline);
        passEncoder.setBindGroup(0, bindGroup);
        
        passEncoder.setVertexBuffer(0, this.positionBuffer);
        passEncoder.setVertexBuffer(1, this.colorBuffer);
        passEncoder.setVertexBuffer(2, this.uvBuffer);
        passEncoder.setVertexBuffer(3, this.normalBuffer);
        passEncoder.setIndexBuffer(this.indexBuffer, 'uint16');
        passEncoder.drawIndexed(this.numOfIndex);
    }
}