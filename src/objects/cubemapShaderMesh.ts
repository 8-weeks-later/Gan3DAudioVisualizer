import Mesh from "./mesh";
import MeshData from "./meshData";
import { mat4, vec4 } from 'gl-matrix';

import vsCode from '../shaders/cubemap.vert.wgsl';
import fsCode from '../shaders/cubemap.frag.wgsl';
import CameraSetting, { canvasSize } from "../setting";
import Camera from '../camera';

export default class CubemapShaderMesh extends Mesh{
    cubemapTexture: GPUTexture;

    constructor(meshData: MeshData, device: GPUDevice){
        super(meshData, device);
    }

    async loadCubeMap(){
        // The order of the array layers is [+X, -X, +Y, -Y, +Z, -Z]
        const imgSrcs = [
            '../assets/img/cubemap/spaceblue/posx.png',
            '../assets/img/cubemap/spaceblue/negx.png',
            '../assets/img/cubemap/spaceblue/posy.png',
            '../assets/img/cubemap/spaceblue/negy.png',
            '../assets/img/cubemap/spaceblue/posz.png',
            '../assets/img/cubemap/spaceblue/negz.png',
        ];
        const promises = imgSrcs.map(async (src) => {
          const response = await fetch(src);
          return createImageBitmap(await response.blob());
        });
        const imageBitmaps = await Promise.all(promises);
    
        this.cubemapTexture = this.device.createTexture({
          dimension: '2d',
          // Create a 2d array texture.
          // Assume each image has the same size.
          size: [imageBitmaps[0].width, imageBitmaps[0].height, 6],
          format: 'rgba8unorm',
          usage:
            GPUTextureUsage.TEXTURE_BINDING |
            GPUTextureUsage.COPY_DST |
            GPUTextureUsage.RENDER_ATTACHMENT,
        });
    
        for (let i = 0; i < imageBitmaps.length; i++) {
          const imageBitmap = imageBitmaps[i];
          this.device.queue.copyExternalImageToTexture(
            { source: imageBitmap },
            { texture: this.cubemapTexture, origin: [0, 0, i] },
            [imageBitmap.width, imageBitmap.height]
          );
        }
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

        this.pipeline = this.device.createRenderPipeline(pipelineDesc);
    }

    render(passEncoder: GPURenderPassEncoder){
        const cameraBuffer = this.device.createBuffer({
            size: 144, // Room for two 4x4 matrices and a vec3
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM
        });

        const sampler = this.device.createSampler({
            magFilter: "linear",
            minFilter: "linear",
            mipmapFilter: "linear",
        });

        const bindGroup = this.device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(0),
            entries: [{
                binding: 0,
                resource: { buffer: cameraBuffer },
            }, {
                binding: 1,
                resource: sampler,
                
            }, {
                binding: 2,
                resource: this.cubemapTexture.createView({
                    dimension: 'cube',
                }),
            }],
            });

        const cameraInstance = Camera.getInstance();
        const cameraArray = new Float32Array(36);

        cameraArray.set(cameraInstance.getProjectionMatrix(), 0);
        cameraArray.set(cameraInstance.getViewMatrix(), 16);
        cameraArray.set(cameraInstance.getPosition(), 32);

        // Update the camera uniform buffer
        this.device.queue.writeBuffer(cameraBuffer, 0, cameraArray);
        
        passEncoder.setPipeline(this.pipeline);
        passEncoder.setBindGroup(0, bindGroup);
        
        passEncoder.setVertexBuffer(0, this.positionBuffer);
        passEncoder.setVertexBuffer(1, this.colorBuffer);
        passEncoder.setIndexBuffer(this.indexBuffer, 'uint16');
        passEncoder.drawIndexed(this.numOfIndex);
    }
}