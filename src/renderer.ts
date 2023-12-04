import DefaultShaderMesh from './objects/defaultShaderMesh';
import CubemapShaderMesh from './objects/cubemapShaderMesh';
import Mesh from './objects/mesh';
import MeshData from './objects/meshData';

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

    meshes: Mesh[];

    commandEncoder: GPUCommandEncoder;
    passEncoder: GPURenderPassEncoder;
    cubemapTexture: GPUTexture;
    //#endregion fields

    constructor(canvas) {
        this.canvas = canvas;
    }

    // 🌟 Initialize WebGPU
    async initializeAPI(): Promise<boolean> {
        this.meshes = [];
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

        this.meshes.forEach(mesh => {
            mesh.render(this.passEncoder);
        });
        
        this.passEncoder.end();
        this.queue.submit([this.commandEncoder.finish()]);
    }

    async setMesh(meshData: MeshData, cubeMapMeshData: MeshData): Promise<void> {
        let mesh = new DefaultShaderMesh(meshData, this.device);
        let cubeMapMesh = new CubemapShaderMesh(cubeMapMeshData, this.device);
        await cubeMapMesh.loadCubeMap();
        
        this.meshes.push(mesh);
        this.meshes.push(cubeMapMesh);
    }
}