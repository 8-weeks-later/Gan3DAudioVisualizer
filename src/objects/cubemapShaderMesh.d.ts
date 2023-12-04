import Mesh from "./mesh";
import MeshData from "./meshData";

export default class CubemapShaderMesh extends Mesh{
    constructor(meshData: MeshData, device: GPUDevice);

    createShaderModel(): void;
    createPipeline(): GPURenderPipeline;
}
