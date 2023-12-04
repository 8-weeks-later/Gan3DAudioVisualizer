import MeshData from "./meshData";

export default class Mesh{
    positionBuffer: GPUBuffer;
    colorBuffer: GPUBuffer;
    indexBuffer: GPUBuffer;
    uvBuffer: GPUBuffer;
    numOfIndex: number;
    
    device: GPUDevice;

    vertModule: GPUShaderModule;
    fragModule: GPUShaderModule;

    constructor(meshData: MeshData);

    createShaderModel(shaderType);
}
