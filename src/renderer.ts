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

    commandEncoder: GPUCommandEncoder;
    passEncoder: GPURenderPassEncoder;
    modelMatrix: mat4;
    cubemapTexture: GPUTexture;
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
        this.defaultPipeline = this.mesh.createPipeline();
        this.cubemapPipeline = this.cubeMapMesh.createPipeline();
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

        const sampler = this.device.createSampler({
            magFilter: "linear",
            minFilter: "linear",
            mipmapFilter: "linear",
        });

        const defaultBindGroup = this.device.createBindGroup({
            layout: this.defaultPipeline.getBindGroupLayout(0),
            entries: [{
                binding: 0,
                resource: { buffer: cameraBuffer },
            }, {
                binding: 1,
                resource: { buffer: modelBuffer },
            }],
            });

        const cubeMapBindGroup = this.device.createBindGroup({
            layout: this.cubemapPipeline.getBindGroupLayout(0),
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
        this.passEncoder.setBindGroup(0, defaultBindGroup);
        
        this.passEncoder.setVertexBuffer(0, this.mesh.positionBuffer);
        this.passEncoder.setVertexBuffer(1, this.mesh.colorBuffer);
        this.passEncoder.setVertexBuffer(2, this.mesh.uvBuffer);
        this.passEncoder.setIndexBuffer(this.mesh.indexBuffer, 'uint16');
        this.passEncoder.drawIndexed(this.mesh.numOfIndex);
        
        this.passEncoder.setPipeline(this.cubemapPipeline);
        this.passEncoder.setBindGroup(0, cubeMapBindGroup);
        
        this.passEncoder.setVertexBuffer(0, this.cubeMapMesh.positionBuffer);
        this.passEncoder.setVertexBuffer(1, this.cubeMapMesh.colorBuffer);
        this.passEncoder.setIndexBuffer(this.cubeMapMesh.indexBuffer, 'uint16');
        this.passEncoder.drawIndexed(this.cubeMapMesh.numOfIndex);
        this.passEncoder.end();

        this.queue.submit([this.commandEncoder.finish()]);
    }

    async setMesh(meshData: MeshData, cubeMapMeshData: MeshData): Promise<void> {
        this.mesh = new Mesh(meshData, "Default", this.device);

        let cuebMapMesh = new Mesh(cubeMapMeshData, "CubeMap", this.device);
                
        // The order of the array layers is [+X, -X, +Y, -Y, +Z, -Z]
        const imgSrcs = [
            '../assets/img/cubemap/posx.jpg',
            '../assets/img/cubemap/negx.jpg',
            '../assets/img/cubemap/posy.jpg',
            '../assets/img/cubemap/negy.jpg',
            '../assets/img/cubemap/posz.jpg',
            '../assets/img/cubemap/negz.jpg',
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

        this.cubeMapMesh = cuebMapMesh;

        this.initializeResources();

        // 🎨 Model Matrix
        this.modelMatrix = mat4.create();
        mat4.rotateX(this.modelMatrix, this.modelMatrix, 40);
    }
}