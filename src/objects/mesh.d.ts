import MeshData from "./meshData";

export default class Mesh{
    positionBuffer: GPUBuffer;
    colorBuffer: GPUBuffer;
    indexBuffer: GPUBuffer;
    numOfIndex: number;
    
    vertModule: GPUShaderModule;
    fragModule: GPUShaderModule;
    constructor(meshData: MeshData);
}