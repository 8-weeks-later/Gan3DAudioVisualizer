import defaultVSCode from './shaders/default.vert.wgsl';
import defaultFSCode from './shaders/default.frag.wgsl';
import cubeMapVSCode from './shaders/cubemap.vert.wgsl';
import cubeMapFSCode from './shaders/cubemap.frag.wgsl';

import Mesh from './objects/mesh';
import MeshData from './objects/meshData';
import { mat4, vec4 } from 'gl-matrix';

export default class Renderer {
    //#region fields
    canvas: HTMLCanvasElement;

    // ⚙️ API Data Structures
    adapter: GPUAdapter;
    device: GPUDevice;
    queue: GPUQueue;

    // 🎞️ Frame Backings
    context: GPUCanvasContext;
    colorTexture: GPUTexture;
    colorTextureView: GPUTextureView;
    depthTexture: GPUTexture;
    depthTextureView: GPUTextureView;

    // 🔺 Resources
    mesh : Mesh;
    cubeMapMesh : Mesh;

    defaultPipeline: GPURenderPipeline;
    cubemapPipeline: GPURenderPipeline;

    bindGroupLayout: GPUBindGroupLayout;
    commandEncoder: GPUCommandEncoder;
    passEncoder: GPURenderPassEncoder;
    modelMatrix: mat4;
    //#endregion fields

    constructor(canvas) {
        this.canvas = canvas;
    }

    // 🏎️ Start the rendering engine
    async start() {
        if (await this.initializeAPI()) {
            this.resizeBackings();
        }
    }

    // 🌟 Initialize WebGPU
    async initializeAPI(): Promise<boolean> {
        try {
            // 🏭 Entry to WebGPU
            const entry: GPU = navigator.gpu; 
            if (!entry) {
                return false;
            }

            // 🔌 Physical Device Adapter
            this.adapter = await entry.requestAdapter();

            // 💻 Logical Device
            this.device = await this.adapter.requestDevice();

            // 📦 Queue
            this.queue = this.device.queue;
        } catch (e) {
            console.error(e);
            return false;
        }

        return true;
    }

    // ↙️ Resize swapchain, frame buffer attachments
    resizeBackings() {
        // ⛓️ Swapchain
        if (!this.context) {
            this.context = this.canvas.getContext('webgpu');
            const canvasConfig: GPUCanvasConfiguration = {
                device: this.device,
                format: 'bgra8unorm',
                usage:
                    GPUTextureUsage.RENDER_ATTACHMENT |
                    GPUTextureUsage.COPY_SRC,
                    alphaMode: 'opaque'
            };
            this.context.configure(canvasConfig);
        }

        const depthTextureDesc: GPUTextureDescriptor = {
            size: [this.canvas.width, this.canvas.height, 1],
            dimension: '2d',
            format: 'depth24plus-stencil8',
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC
        };

        this.depthTexture = this.device.createTexture(depthTextureDesc);
        this.depthTextureView = this.depthTexture.createView();
    }

    // 🍱 Initialize resources to render triangle (buffers, shaders, pipeline)
    initializeResources() {
        this.createDefaultPipeline();
        this.createCubemapPipeline();
    }

    createDefaultPipeline() {
        // 🔣 Input Assembly
        const positionAttribDesc: GPUVertexAttribute = {
            shaderLocation: 0, // [[location(0)]]
            offset: 0,
            format: 'float32x4'
        };
        const colorAttribDesc: GPUVertexAttribute = {
            shaderLocation: 1, // [[location(1)]]
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
        this.bindGroupLayout = this.device.createBindGroupLayout({
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
            this.bindGroupLayout // @group(0)
        ]};
        const layout = this.device.createPipelineLayout(pipelineLayoutDesc);

        // 🎭 Shader Stages
        const vertex: GPUVertexState = {
            module: this.mesh.vertModule,
            entryPoint: 'main',
            buffers: [positionBufferDesc, colorBufferDesc]
        };

        // 🌀 Color/Blend State
        const colorState: GPUColorTargetState = {
            format: 'bgra8unorm'
        };

        const fragment: GPUFragmentState = {
            module: this.mesh.fragModule,
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
        this.defaultPipeline = this.device.createRenderPipeline(pipelineDesc);
    }

    createCubemapPipeline() {
        // 🔣 Input Assembly
        const positionAttribDesc: GPUVertexAttribute = {
            shaderLocation: 0, // [[location(0)]]
            offset: 0,
            format: 'float32x4'
        };
        const colorAttribDesc: GPUVertexAttribute = {
            shaderLocation: 1, // [[location(1)]]
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
        this.bindGroupLayout = this.device.createBindGroupLayout({
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
            this.bindGroupLayout // @group(0)
        ]};
        const layout = this.device.createPipelineLayout(pipelineLayoutDesc);

        // 🎭 Shader Stages
        const vertex: GPUVertexState = {
            module: this.cubeMapMesh.vertModule,
            entryPoint: 'main',
            buffers: [positionBufferDesc, colorBufferDesc]
        };

        // 🌀 Color/Blend State
        const colorState: GPUColorTargetState = {
            format: 'bgra8unorm'
        };

        const fragment: GPUFragmentState = {
            module: this.cubeMapMesh.fragModule,
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
        this.cubemapPipeline = this.device.createRenderPipeline(pipelineDesc);
    }

    render = () => {
        // ⏭ Acquire next image from context
        this.colorTexture = this.context.getCurrentTexture();
        this.colorTextureView = this.colorTexture.createView();

        // 📦 Write and submit commands to queue
        this.encodeCommands();

        // ➿ Refresh canvas
        requestAnimationFrame(this.render);
    };

    // ✍️ Write commands to send to the GPU
    encodeCommands() {
        let colorAttachment: GPURenderPassColorAttachment = {
            view: this.colorTextureView,
            clearValue: { r: 0, g: 0, b: 0, a: 1 },
            loadOp: 'clear',
            storeOp: 'store'
        };

        const depthAttachment: GPURenderPassDepthStencilAttachment = {
            view: this.depthTextureView,
            depthClearValue: 1,
            depthLoadOp: 'clear',
            depthStoreOp: 'store',
            stencilClearValue: 0,
            stencilLoadOp: 'clear',
            stencilStoreOp: 'store'
        };

        const renderPassDesc: GPURenderPassDescriptor = {
            colorAttachments: [colorAttachment],
            depthStencilAttachment: depthAttachment
        };

        this.commandEncoder = this.device.createCommandEncoder();

        // Resources and Bind Groups
        const cameraBuffer = this.device.createBuffer({
            size: 144, // Room for two 4x4 matrices and a vec3
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM
        });
        
        const modelBuffer = this.device.createBuffer({
            size: 64, // Room for one 4x4 matrix
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM
        });
        
        const baseColorTexture = this.device.createTexture({
            size: { width: 256, height: 256 },
            usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING,
            format: 'rgba8unorm',
        });
        
        const baseColorSampler = this.device.createSampler({
            magFilter: "linear",
            minFilter: "linear",
            mipmapFilter: "linear",
            addressModeU: "repeat",
            addressModeV: "repeat",
        });

        const bindGroup = this.device.createBindGroup({
        layout: this.bindGroupLayout,
        entries: [{
            binding: 0,
            resource: { buffer: cameraBuffer },
        }, {
            binding: 1,
            resource: { buffer: modelBuffer },
        }],
        });

        // Place the most recent camera values in an array at the appropriate offsets.
        const cameraArray = new Float32Array(36);
        const projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, 45 * Math.PI / 180, this.canvas.width / this.canvas.height, 0.1, 100.0);
        const viewMatrix = mat4.create();
        mat4.translate(viewMatrix, viewMatrix, [0, 0, -10]);
        const cameraPosition = vec4.create();
        vec4.set(cameraPosition, 0, 0, 0, 0);

        mat4.rotateY(this.modelMatrix, this.modelMatrix, 1 * 0.04);

        cameraArray.set(projectionMatrix, 0);
        cameraArray.set(viewMatrix, 16);
        cameraArray.set(cameraPosition, 32);

        // Update the camera uniform buffer
        this.device.queue.writeBuffer(cameraBuffer, 0, cameraArray);

        // Update the model uniform buffer
        this.device.queue.writeBuffer(modelBuffer, 0, this.modelMatrix as Float32Array);

        // 🖌️ Encode drawing commands
        this.passEncoder = this.commandEncoder.beginRenderPass(renderPassDesc);
        this.passEncoder.setViewport(
            0,
            0,
            this.canvas.width,
            this.canvas.height,
            0,
            1
        );
        this.passEncoder.setScissorRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
        this.passEncoder.setPipeline(this.defaultPipeline);
        this.passEncoder.setBindGroup(0, bindGroup); // @group(0)
        
        this.passEncoder.setVertexBuffer(0, this.mesh.positionBuffer);
        this.passEncoder.setVertexBuffer(1, this.mesh.colorBuffer);
        this.passEncoder.setIndexBuffer(this.mesh.indexBuffer, 'uint16');
        this.passEncoder.drawIndexed(this.mesh.numOfIndex);
        
        this.passEncoder.setPipeline(this.cubemapPipeline);
        this.passEncoder.setBindGroup(0, bindGroup); // @group(0)
        
        this.passEncoder.setVertexBuffer(0, this.cubeMapMesh.positionBuffer);
        this.passEncoder.setVertexBuffer(1, this.cubeMapMesh.colorBuffer);
        this.passEncoder.setIndexBuffer(this.cubeMapMesh.indexBuffer, 'uint16');
        this.passEncoder.drawIndexed(this.cubeMapMesh.numOfIndex);
        this.passEncoder.end();

        this.queue.submit([this.commandEncoder.finish()]);
    }

    setMesh(meshData: MeshData, cubeMapMeshData: MeshData): boolean {
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
            let buffer = this.device.createBuffer(desc);
            const writeArray =
                arr instanceof Uint16Array
                    ? new Uint16Array(buffer.getMappedRange())
                    : new Float32Array(buffer.getMappedRange());
            writeArray.set(arr);
            buffer.unmap();
            return buffer;
        };

        let mesh = new Mesh(meshData);
        
        mesh.positionBuffer = createBuffer(meshData.positions, GPUBufferUsage.VERTEX);
        mesh.colorBuffer = createBuffer(meshData.colors, GPUBufferUsage.VERTEX);
        mesh.indexBuffer = createBuffer(meshData.indices, GPUBufferUsage.INDEX);
        mesh.numOfIndex = meshData.indices.length;

        // TODO: 쉐이더 적용 동적으로 변경가능하도록 변경
        // 🖍️ Shaders
        const defaultVsmDesc = {
            code: defaultVSCode
        };
        mesh.vertModule = this.device.createShaderModule(defaultVsmDesc);

        const defaultFsmDesc = {
            code: defaultFSCode
        };
        mesh.fragModule = this.device.createShaderModule(defaultFsmDesc);

        this.mesh = mesh;

        let cuebMapMesh = new Mesh(cubeMapMeshData);
        
        cuebMapMesh.positionBuffer = createBuffer(cubeMapMeshData.positions, GPUBufferUsage.VERTEX);
        cuebMapMesh.colorBuffer = createBuffer(cubeMapMeshData.colors, GPUBufferUsage.VERTEX);
        cuebMapMesh.indexBuffer = createBuffer(cubeMapMeshData.indices, GPUBufferUsage.INDEX);
        cuebMapMesh.numOfIndex = cubeMapMeshData.indices.length;

        const cubemapVsmDesc = {
            code: cubeMapVSCode
        };
        cuebMapMesh.vertModule = this.device.createShaderModule(cubemapVsmDesc);
        const cubemapFsmDesc = {
            code: cubeMapFSCode
        };
        cuebMapMesh.fragModule = this.device.createShaderModule(cubemapFsmDesc);

        this.cubeMapMesh = cuebMapMesh;

        this.initializeResources();

        // 🎨 Model Matrix
        this.modelMatrix = mat4.create();
        mat4.rotateX(this.modelMatrix, this.modelMatrix, 40);

        return true;
    }
}