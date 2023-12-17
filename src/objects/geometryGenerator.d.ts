import MeshData from "./meshData";

export default class GeometryGenerator{
    makeTriangle(scale: number): MeshData;
    makeSquare(scale: number): MeshData;
    makeGrid(width: number, height: number, numSlices: number, numStacks: number): MeshData;
    makeBox(scale: number): MeshData;
    makeAudioMesh(data: number[], size: number, chunkSize: number): MeshData;
}