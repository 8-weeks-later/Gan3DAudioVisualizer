import Mesh from "./mesh";
import MeshData from "./meshData";

export default class CubeMapShaderMesh extends Mesh{
    cubemapTexture: GPUTexture;

    constructor(meshData: MeshData, device: GPUDevice);

    loadCubeMap(): Promise<void>;
    createShaderModel(): void;
    createPipeline(): void;
    render(passEncoder: GPURenderPassEncoder): void;
}
